const Task = require('../models/Task');
const Bid = require('../models/Bid');

// @desc    Create new task
// @route   POST /api/tasks
// @access  Private
exports.createTask = async (req, res) => {
  try {
    const { title, description, category, skills, budget, deadline, urgency, attachments } = req.body;

    const task = await Task.create({
      title,
      description,
      category,
      skills: skills || [],
      budget,
      deadline,
      urgency: urgency || 'medium',
      attachments: attachments || [],
      postedBy: req.user._id
    });

    // Populate posted by user
    await task.populate('postedBy', 'name email avatar rating');

    // Emit socket event for real-time update
    if (req.io) {
      req.io.emit('newTask', task);
    }

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      task
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating task',
      error: error.message
    });
  }
};

// @desc    Get all tasks (with filters)
// @route   GET /api/tasks
// @access  Public
exports.getTasks = async (req, res) => {
  try {
    const { 
      status, 
      category, 
      minBudget, 
      maxBudget, 
      search,
      urgency,
      sortBy,
      page = 1,
      limit = 10 
    } = req.query;

    // Build query
    const query = {};

    if (status) query.status = status;
    if (category) query.category = category;
    if (urgency) query.urgency = urgency;
    
    if (minBudget || maxBudget) {
      query['budget.min'] = {};
      if (minBudget) query['budget.min'].$gte = Number(minBudget);
      if (maxBudget) query['budget.max'] = { $lte: Number(maxBudget) };
    }

    if (search) {
      query.$text = { $search: search };
    }

    // Sorting
    let sort = { createdAt: -1 };
    if (sortBy === 'budget') sort = { 'budget.max': -1 };
    if (sortBy === 'deadline') sort = { deadline: 1 };
    if (sortBy === 'urgency') {
      sort = { urgency: -1 };
    }

    // Pagination
    const skip = (Number(page) - 1) * Number(limit);

    const tasks = await Task.find(query)
      .populate('postedBy', 'name email avatar rating')
      .populate('assignedTo', 'name email avatar rating')
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));

    const total = await Task.countDocuments(query);

    res.json({
      success: true,
      count: tasks.length,
      total,
      pages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      tasks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching tasks',
      error: error.message
    });
  }
};

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Public
exports.getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('postedBy', 'name email avatar rating completedTasks')
      .populate('assignedTo', 'name email avatar rating')
      .populate({
        path: 'bids',
        populate: {
          path: 'bidder',
          select: 'name email avatar rating completedTasks skills'
        }
      });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    res.json({
      success: true,
      task
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching task',
      error: error.message
    });
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private (task owner only)
exports.updateTask = async (req, res) => {
  try {
    let task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Check ownership
    if (task.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this task'
      });
    }

    // Prevent updates if task is in-progress or completed
    if (task.status !== 'open') {
      return res.status(400).json({
        success: false,
        message: 'Cannot update task that is not open'
      });
    }

    const { title, description, category, skills, budget, deadline, urgency } = req.body;
    
    task = await Task.findByIdAndUpdate(
      req.params.id,
      { title, description, category, skills, budget, deadline, urgency },
      { new: true, runValidators: true }
    ).populate('postedBy', 'name email avatar rating');

    // Emit socket event
    if (req.io) {
      req.io.emit('taskUpdated', task);
    }

    res.json({
      success: true,
      message: 'Task updated successfully',
      task
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating task',
      error: error.message
    });
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private (task owner only)
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Check ownership
    if (task.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this task'
      });
    }

    // Delete associated bids
    await Bid.deleteMany({ task: task._id });
    await task.deleteOne();

    // Emit socket event
    if (req.io) {
      req.io.emit('taskDeleted', req.params.id);
    }

    res.json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting task',
      error: error.message
    });
  }
};

// @desc    Get tasks posted by current user
// @route   GET /api/tasks/my/posted
// @access  Private
exports.getMyPostedTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ postedBy: req.user._id })
      .populate('assignedTo', 'name email avatar rating')
      .populate({
        path: 'bids',
        populate: {
          path: 'bidder',
          select: 'name email avatar rating'
        }
      })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: tasks.length,
      tasks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching your tasks',
      error: error.message
    });
  }
};

// @desc    Get tasks assigned to current user
// @route   GET /api/tasks/my/assigned
// @access  Private
exports.getMyAssignedTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ assignedTo: req.user._id })
      .populate('postedBy', 'name email avatar rating')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: tasks.length,
      tasks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching assigned tasks',
      error: error.message
    });
  }
};
