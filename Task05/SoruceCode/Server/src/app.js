const express = require('express');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const friendRoutes = require('./routes/friendRoutes');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/users', userRoutes);
app.use('/api/friends', friendRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'QR Connect Server is running' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'QR Connect Server is running' });
});

module.exports = app;
