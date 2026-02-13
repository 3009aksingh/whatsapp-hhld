require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const mongoose = require('mongoose');
const WebSocket = require('ws');

const Message = require('./models/Message');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => console.log(err));

// REST Test Route
app.get('/', (req, res) => {
  res.send('Backend running 🚀');
});
// WebSocket Server
const wss = new WebSocket.Server({ server });

const users = new Map(); // userId → socket

wss.on('connection', (socket) => {
  console.log('New WebSocket connected');

  socket.on('message', async (data) => {
    console.log('Raw message received:', data.toString());

    const msg = JSON.parse(data);

    // Register user
    if (msg.type === 'register') {
      users.set(msg.userId, socket);
      socket.userId = msg.userId;
      console.log(`User registered: ${msg.userId}`);
    }

    // Send message
    if (msg.type === 'message') {
      try {
        // Save to DB
        const savedMessage = await Message.create({
          from: msg.from,
          to: msg.to,
          text: msg.text,
        });

        console.log('Saved message:', savedMessage);

        const receiverSocket = users.get(msg.to);

        if (receiverSocket) {
          receiverSocket.send(
            JSON.stringify({
              type: 'message',
              from: savedMessage.from,
              text: savedMessage.text,
            })
          );
        }
      } catch (err) {
        console.error('Message save failed:', err);
      }
    }
  });

  socket.on('close', () => {
    if (socket.userId) {
      users.delete(socket.userId);
      console.log(`User disconnected: ${socket.userId}`);
    }
  });
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
    console.error('Fetch messages failed:', err);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
