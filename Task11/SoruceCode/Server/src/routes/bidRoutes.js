const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const {
  createBid,
  getTaskBids,
  acceptBid,
  completeTask,
  withdrawBid,
  getMyBids
} = require('../controllers/bidController');

// Public routes
router.get('/task/:taskId', getTaskBids);

// Protected routes
router.post('/', protect, createBid);
router.get('/my', protect, getMyBids);
router.put('/:id/accept', protect, acceptBid);
router.put('/:id/complete', protect, completeTask);
router.put('/:id/withdraw', protect, withdrawBid);

module.exports = router;
