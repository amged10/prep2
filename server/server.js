require('dotenv').config();
const path = require('path');
const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { Server } = require('socket.io');

const connectDB = require('./config/db');
const User = require('./models/User');
const Message = require('./models/Message');

const authRoutes = require('./routes/auth');
const messageRoutes = require('./routes/messages');

const PORT = process.env.PORT || 5000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

const app = express();
const server = http.createServer(app);

app.use(express.json());
app.use(cors({ origin: CLIENT_ORIGIN }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);

// Connect DB and then start the HTTP + Socket servers

async function start() {
  try {
    await connectDB();
  } catch (err) {
    console.error('Failed to connect to DB, exiting.');
    process.exit(1);
  }

// Socket.io with JWT auth on handshake
const io = new Server(server, {
  cors: {
    origin: CLIENT_ORIGIN,
    methods: ['GET', 'POST'],
  },
});

io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Authentication error: token required'));

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    // Attach user data to socket
    socket.user = {
      id: payload.id,
      username: payload.username,
    };
    return next();
  } catch (err) {
    console.error('Socket auth error', err.message);
    return next(new Error('Authentication error'));
  }
});

io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id} (${socket.user?.username})`);

  // Optionally: join a global room
  socket.join('global');

  // Broadcast when someone connects (optional friendly join message)
  socket.to('global').emit('user_joined', {
    userId: socket.user.id,
    username: socket.user.username,
  });

  socket.on('send_message', async (payload) => {
    // payload: { content }
    try {
      const content = (payload.content || '').trim();
      if (!content) return;

      // Create & save message
      const msg = new Message({
        content,
        sender: socket.user.id,
        senderName: socket.user.username,
      });
      await msg.save();

      // Populate minimal sender info for broadcast
      const broadcastMsg = {
        _id: msg._id,
        content: msg.content,
        sender: msg.sender,
        senderName: msg.senderName,
        createdAt: msg.createdAt,
      };

      // Broadcast to everyone in 'global'
      io.to('global').emit('new_message', broadcastMsg);
    } catch (err) {
      console.error('Error saving or broadcasting message', err);
      socket.emit('error_message', { message: 'Message not delivered' });
    }
  });

  socket.on('disconnect', (reason) => {
    console.log(`Socket disconnected: ${socket.id} reason ${reason}`);
    socket.to('global').emit('user_left', {
      userId: socket.user?.id,
      username: socket.user?.username,
    });
  });
});

  server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

start();
