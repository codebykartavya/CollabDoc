require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
const Y = require('yjs');
const { setupWSConnection } = require('y-websocket/bin/utils');
const WebSocket = require('ws');
const Document = require('./models/Document');
const Revision = require('./models/Revision');
const authRoutes = require('./routes/auth');
const docRoutes = require('./routes/documents');
const authMiddleware = require('./middleware/auth');

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS']
}));
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/docs', authMiddleware, docRoutes);

app.get('/health', (req, res) => res.json({ status: 'ok' }));

const server = http.createServer(app);

// Socket.io for presence
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

io.on('connection', (socket) => {
  socket.on('join-room', ({ docId, userId, userName, color }) => {
    socket.join(docId);
    socket.data = { docId, userId, userName, color };
    socket.to(docId).emit('user-joined', { userId, userName, color });
    // send current room members to new joiner
    const room = io.sockets.adapter.rooms.get(docId);
    const members = [];
    if (room) {
      room.forEach(socketId => {
        const s = io.sockets.sockets.get(socketId);
        if (s && s.data.userId && s.data.userId !== userId) {
          members.push({ userId: s.data.userId, userName: s.data.userName, color: s.data.color });
        }
      });
    }
    socket.emit('room-members', members);
  });

  socket.on('user-typing', ({ docId, userName }) => {
    socket.to(docId).emit('typing', { userName });
  });

  socket.on('disconnect', () => {
    if (socket.data && socket.data.docId) {
      socket.to(socket.data.docId).emit('user-left', { userId: socket.data.userId });
    }
  });
});

// Yjs WebSocket server
const wss = new WebSocket.Server({ noServer: true });
const ydocs = new Map(); // docId -> Y.Doc
const saveTimers = new Map(); // docId -> timeout

function getYDoc(docName) {
  if (!ydocs.has(docName)) {
    ydocs.set(docName, new Y.Doc());
  }
  return ydocs.get(docName);
}

async function loadDocState(docName, ydoc) {
  try {
    const doc = await Document.findById(docName);
    if (doc && doc.ydocState && doc.ydocState.length > 0) {
      Y.applyUpdate(ydoc, new Uint8Array(doc.ydocState));
    }
  } catch (e) {
    console.error('Error loading doc state:', e.message);
  }
}

async function saveDocState(docName, ydoc, userId, userName) {
  try {
    const state = Buffer.from(Y.encodeStateAsUpdate(ydoc));
    await Document.findByIdAndUpdate(docName, { ydocState: state, updatedAt: new Date() });
    // save revision snapshot
    if (userId) {
      await Revision.create({ docId: docName, userId, userName, snapshot: state });
    }
  } catch (e) {
    console.error('Error saving doc state:', e.message);
  }
}

wss.on('connection', async (conn, req) => {
  // Extract docId from URL: /ws/DOCID
  const docName = req.url.slice(1).split('?')[0].replace(/^\//, '');
  const ydoc = getYDoc(docName);

  // Load existing state from MongoDB on first connection to this doc
  if (ydoc.store.clients.size === 0) {
    await loadDocState(docName, ydoc);
  }

  setupWSConnection(conn, req, { docName, gc: true });

  // Debounced save on every update
  ydoc.on('update', () => {
    if (saveTimers.has(docName)) clearTimeout(saveTimers.get(docName));
    saveTimers.set(docName, setTimeout(() => {
      saveDocState(docName, ydoc, null, null);
    }, 3000));
  });
});

// Upgrade HTTP to WebSocket only for /ws path
server.on('upgrade', (req, socket, head) => {
  if (req.url.startsWith('/ws')) {
    req.url = req.url.replace('/ws', '') || '/';
    wss.handleUpgrade(req, socket, head, (ws) => {
      wss.emit('connection', ws, req);
    });
  } else {
    socket.destroy();
  }
});

const connectDB = async () => {
  try {
    if (process.env.USE_IN_MEMORY_DB === 'true') {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create();
      await mongoose.connect(mongoServer.getUri());
      console.log('Connected to In-Memory MongoDB');
    } else {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('MongoDB connected');
    }
    server.listen(process.env.PORT || 8080, () => {
      console.log(`Server running on port ${process.env.PORT || 8080}`);
    });
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};

connectDB();
