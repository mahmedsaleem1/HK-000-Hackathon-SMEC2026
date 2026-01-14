const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');
const commentRoutes = require('./routes/commentRoutes');
const followRoutes = require('./routes/followRoutes');

const app = express();

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3001', 
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


// main routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/follow', followRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Social Media API Server is running' });
});

module.exports = app;
