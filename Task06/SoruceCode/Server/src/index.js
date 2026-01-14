const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const fileRoutes = require('./routes/fileRoutes');
const roomRoutes = require('./routes/roomRoutes');
const socketHandler = require('./services/socketHandler');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:5173',
        methods: ['GET', 'POST']
    }
});

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/files', fileRoutes);
app.use('/api/rooms', roomRoutes);

app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Server running' });
});

socketHandler(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

