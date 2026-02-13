require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const mongoose = require('mongoose');
const WebSocket = require('ws');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./models/User');

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

wss.on('connection', (socket, req) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    const token = url.searchParams.get('token');

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.username;

    users.set(userId, socket);
    socket.userId = userId;

    console.log(`WebSocket connected for user: ${userId}`);

    socket.on('message', async (data) => {
      console.log('Raw message received:', data.toString());

      const msg = JSON.parse(data);

      if (msg.type === 'message') {
        try {
          const savedMessage = await Message.create({
            from: userId,
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
      users.delete(userId);
      console.log(`User disconnected: ${userId}`);
    });
  } catch (err) {
    console.log('Invalid token');
    socket.close();
  }
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

app.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      password: hashedPassword,
    });

    res.json({ message: 'User registered successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });

    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
