require('dotenv').config();

const SERVER_ID = process.env.PORT || 5000;
console.log('🚀 Server started:', SERVER_ID);

const express = require('express');
const http = require('http');
const cors = require('cors');
const mongoose = require('mongoose');
const WebSocket = require('ws');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { createClient } = require('redis');

const User = require('./models/User');
const Message = require('./models/Message');

const app = express();
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);
app.use(express.json());

const server = http.createServer(app);

/* =========================
   MongoDB Connection
========================= */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => console.log(err));

/* =========================
   Redis Clients
========================= */

const redisClient = createClient({
  url: process.env.REDIS_URL,
});

const redisSubscriber = createClient({
  url: process.env.REDIS_URL,
});

redisClient.on('error', (err) => console.error('Redis error:', err));

redisSubscriber.on('error', (err) =>
  console.error('Redis Subscriber error:', err)
);

(async () => {
  await redisClient.connect();
  console.log('Redis Connected');

  await redisSubscriber.connect();
  console.log('Redis Subscriber Connected');
})();

/* =========================
   WebSocket Setup
========================= */

const wss = new WebSocket.Server({ server });

/*
  userId -> Set of sockets
*/
const users = new Map();

/* =========================
   Broadcast Presence
========================= */
async function broadcastOnlineUsers() {
  const usersArray = await redisClient.sMembers('online_users');

  console.log(`🌍 [${SERVER_ID}] Online users:`, usersArray);

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(
        JSON.stringify({
          type: 'online_users',
          users: usersArray,
        })
      );
    }
  });
}


/* =========================
   WebSocket Connection
========================= */

wss.on('connection', async (socket, req) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    const token = url.searchParams.get('token');

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const userId = decoded.username;

    socket.userId = userId;

    if (!users.has(userId)) {
      users.set(userId, new Set());
    }

    users.get(userId).add(socket);

    await redisClient.sAdd('online_users', userId);

    console.log(`🔌 [${SERVER_ID}] WebSocket connected: ${userId}`);

    broadcastOnlineUsers();

    /* =========================
       Incoming Messages
    ========================= */

    socket.on('message', async (data) => {
      const msg = JSON.parse(data);

      if (msg.type === 'message') {
        try {
          const savedMessage = await Message.create({
            from: userId,
            to: msg.to,
            text: msg.text,
          });

          console.log(
            `📦 [${SERVER_ID}] Saved message from ${userId} to ${msg.to}`
          );

          await redisClient.publish(
            'chat_messages',
            JSON.stringify({
              id: savedMessage._id.toString(),
              from: savedMessage.from,
              to: savedMessage.to,
              text: savedMessage.text,
              originServer: SERVER_ID,
            })
          );

          console.log(`📡 [${SERVER_ID}] Published to Redis`);
        } catch (err) {
          console.error('Message save failed:', err);
        }
      }
    });

    /* =========================
       Socket Close
    ========================= */

    socket.on('close', async () => {
      const userSockets = users.get(userId);

      if (userSockets) {
        userSockets.delete(socket);

        if (userSockets.size === 0) {
          users.delete(userId);

          await redisClient.sRem('online_users', userId);

          console.log(`❌ [${SERVER_ID}] Fully disconnected: ${userId}`);
        }
      }

      broadcastOnlineUsers();
    });
  } catch (err) {
    console.log(`❗ [${SERVER_ID}] Invalid token`);
    socket.close();
  }
});

/* =========================
   Redis Pub/Sub Listener
========================= */

redisSubscriber.subscribe('chat_messages', async (message) => {
  const parsed = JSON.parse(message);

  const { id, from, to, text, originServer } = parsed;

  console.log(`📥 [${SERVER_ID}] Pub/Sub event for ${to}`);

  /*
      Deliver ONLY to sockets that actually belong
      to that specific user on THIS server.
    */

  // Deliver to receiver
  const receiverSockets = users.get(to);

  if (receiverSockets) {
    receiverSockets.forEach((clientSocket) => {
      if (clientSocket.readyState === WebSocket.OPEN) {
        clientSocket.send(
          JSON.stringify({
            type: 'message',
            id,
            from,
            text,
          })
        );
      }
    });
  }

  /*
      Echo to sender ONLY on origin server
      Prevents cross-server double echo
    */
  if (originServer === SERVER_ID) {
    const senderSockets = users.get(from);

    if (senderSockets) {
      senderSockets.forEach((clientSocket) => {
        if (clientSocket.readyState === WebSocket.OPEN) {
          clientSocket.send(
            JSON.stringify({
              type: 'message',
              id,
              from,
              text,
            })
          );
        }
      });
    }
  }
});

/* =========================
   REST APIs
========================= */

app.get('/', (req, res) => {
  res.send('Backend running 🚀');
});

app.get('/messages', async (req, res) => {
  try {
    const { user1, user2 } = req.query;

    const messages = await Message.find({
      $or: [
        { from: user1, to: user2 },
        { from: user2, to: user1 },
      ],
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    res.status(500).json({
      error: 'Failed to fetch messages',
    });
  }
});

app.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      username,
      password: hashedPassword,
    });

    res.json({
      message: 'User registered successfully',
    });
  } catch (err) {
    res.status(500).json({
      error: 'Registration failed',
    });
  }
});

app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({
      username,
    });

    if (!user) return res.status(400).json({ error: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
      {
        userId: user._id,
        username: user.username,
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({ token });
  } catch (err) {
    res.status(500).json({
      error: 'Login failed',
    });
  }
});

app.get('/users', async (req, res) => {
  try {
    const users = await User.find({}, { username: 1, _id: 0 });
    res.json(users);
  } catch (err) {
    res.status(500).json({
      error: 'Failed to fetch users',
    });
  }
});

/* =========================
   Start Server
========================= */

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
