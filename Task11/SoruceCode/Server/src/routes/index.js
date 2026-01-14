const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const taskRoutes = require('./taskRoutes');
const bidRoutes = require('./bidRoutes');

// Mount routes
router.use('/auth', authRoutes);
router.use('/tasks', taskRoutes);
router.use('/bids', bidRoutes);

module.exports = router;
