const Bid = require('../models/Bid');
const Task = require('../models/Task');
const User = require('../models/User');

// @desc    Create a bid on a task
// @route   POST /api/bids
// @access  Private
exports.createBid = async (req, res) => {
  try {
    const { taskId, amount, deliveryTime, proposal, bidType } = req.body;

    // Check if task exists and is open
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    if (task.status !== 'open') {
      return res.status(400).json({
        success: false,
        message: 'Cannot bid on a task that is not open'
      });
    }

    // Prevent bidding on own task
    if (task.postedBy.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot bid on your own task'
      });
    }

    // Check if user already bid on this task
    const existingBid = await Bid.findOne({ task: taskId, bidder: req.user._id });
    if (existingBid) {
      return res.status(400).json({
        success: false,
        message: 'You have already placed a bid on this task'
      });
    }

    // Create bid
    const bid = await Bid.create({
      task: taskId,
      bidder: req.user._id,
      amount,
      deliveryTime,
      proposal,
      bidType: bidType || 'price'
    });

    // Add bid to task
    task.bids.push(bid._id);
    await task.save();

    // Populate bidder info
    await bid.populate('bidder', 'name email avatar rating completedTasks skills');

    // Emit socket event for real-time update
    if (req.io) {
      req.io.emit('newBid', { taskId, bid });
    }

    res.status(201).json({
      success: true,
      message: 'Bid placed successfully',
      bid
    });
  } catch (error) {
    console.error('Create bid error:', error);
    res.status(500).json({
      success: false,
      message: 'Error placing bid',
      error: error.message
    });
  }
};

// @desc    Get all bids for a task
// @route   GET /api/bids/task/:taskId
// @access  Public
exports.getTaskBids = async (req, res) => {
  try {
    const { sortBy } = req.query;
    
    let sort = { createdAt: -1 };
    if (sortBy === 'price') sort = { amount: 1 };
    if (sortBy === 'time') sort = { 'deliveryTime.value': 1 };

    const bids = await Bid.find({ task: req.params.taskId, status: 'pending' })
      .populate('bidder', 'name email avatar rating completedTasks skills')
      .sort(sort);

    res.json({
      success: true,
      count: bids.length,
      bids
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching bids',
      error: error.message
    });
  }
};

// @desc    Accept a bid
// @route   PUT /api/bids/:id/accept
// @access  Private (task owner only)
exports.acceptBid = async (req, res) => {
  try {
    const bid = await Bid.findById(req.params.id).populate('bidder');
    
    if (!bid) {
      return res.status(404).json({
        success: false,
        message: 'Bid not found'
      });
    }

    const task = await Task.findById(bid.task);
    
    // Check ownership
    if (task.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to accept this bid'
      });
    }

    if (task.status !== 'open') {
      return res.status(400).json({
        success: false,
        message: 'Task is no longer open for bids'
      });
    }

    // Accept this bid
    bid.status = 'accepted';
    await bid.save();

    // Reject all other bids
    await Bid.updateMany(
      { task: task._id, _id: { $ne: bid._id } },
      { status: 'rejected' }
    );

    // Update task
    task.status = 'in-progress';
    task.assignedTo = bid.bidder._id;
    task.acceptedBid = bid._id;
    await task.save();

    // Emit socket event
    if (req.io) {
      req.io.emit('bidAccepted', { taskId: task._id, bid });
      req.io.emit('taskUpdated', task);
    }

    res.json({
      success: true,
      message: 'Bid accepted successfully',
      bid,
      task
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error accepting bid',
      error: error.message
    });
  }
};

// @desc    Complete task and update portfolio
// @route   PUT /api/bids/:id/complete
// @access  Private (task owner only)
exports.completeTask = async (req, res) => {
  try {
    const { rating, feedback } = req.body;
    
    const bid = await Bid.findById(req.params.id);
    if (!bid) {
      return res.status(404).json({
        success: false,
        message: 'Bid not found'
      });
    }

    const task = await Task.findById(bid.task);
    
    // Check ownership
    if (task.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to complete this task'
      });
    }

    if (task.status !== 'in-progress') {
      return res.status(400).json({
        success: false,
        message: 'Task must be in-progress to complete'
      });
    }

    // Update task completion
    task.status = 'completed';
    task.completionDetails = {
      completedAt: new Date(),
      rating,
      feedback
    };
    await task.save();

    // Update worker's portfolio and rating
    const worker = await User.findById(bid.bidder);
    await worker.addToPortfolio(task, rating, feedback);
    await worker.updateRating(rating);

    // Emit socket event
    if (req.io) {
      req.io.emit('taskCompleted', { taskId: task._id, workerId: worker._id });
    }

    res.json({
      success: true,
      message: 'Task completed successfully. Portfolio updated!',
      task
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error completing task',
      error: error.message
    });
  }
};

// @desc    Withdraw a bid
// @route   PUT /api/bids/:id/withdraw
// @access  Private (bid owner only)
exports.withdrawBid = async (req, res) => {
  try {
    const bid = await Bid.findById(req.params.id);
    
    if (!bid) {
      return res.status(404).json({
        success: false,
        message: 'Bid not found'
      });
    }

    // Check ownership
    if (bid.bidder.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to withdraw this bid'
      });
    }

    if (bid.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Cannot withdraw a bid that is not pending'
      });
    }

    bid.status = 'withdrawn';
    await bid.save();

    // Remove bid from task
    await Task.findByIdAndUpdate(bid.task, {
      $pull: { bids: bid._id }
    });

    res.json({
      success: true,
      message: 'Bid withdrawn successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error withdrawing bid',
      error: error.message
    });
  }
};

// @desc    Get my bids
// @route   GET /api/bids/my
// @access  Private
exports.getMyBids = async (req, res) => {
  try {
    const bids = await Bid.find({ bidder: req.user._id })
      .populate({
        path: 'task',
        populate: {
          path: 'postedBy',
          select: 'name email avatar'
        }
      })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: bids.length,
      bids
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching your bids',
      error: error.message
    });
  }
};
