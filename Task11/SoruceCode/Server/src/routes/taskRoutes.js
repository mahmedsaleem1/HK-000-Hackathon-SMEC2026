const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const {
  createTask,
  getTasks,
  getTask,
  updateTask,
  deleteTask,
  getMyPostedTasks,
  getMyAssignedTasks
} = require('../controllers/taskController');

// Public routes
router.get('/', getTasks);
router.get('/:id', getTask);

// Protected routes
router.post('/', protect, createTask);
router.put('/:id', protect, updateTask);
router.delete('/:id', protect, deleteTask);
router.get('/my/posted', protect, getMyPostedTasks);
router.get('/my/assigned', protect, getMyAssignedTasks);

module.exports = router;
