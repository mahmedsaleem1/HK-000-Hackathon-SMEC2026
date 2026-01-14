const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validateRequest } = require('../middlewares/validate');
const { protect, adminOnly } = require('../middlewares/auth');
const memberController = require('../controllers/memberController');

// Validation rules
const registerValidation = [
    body('fullName').trim().notEmpty().withMessage('Full name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

const loginValidation = [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required')
];

// Public routes
router.post('/register', registerValidation, validateRequest, memberController.register);
router.post('/login', loginValidation, validateRequest, memberController.login);

// Protected routes
router.get('/profile', protect, memberController.getProfile);
router.put('/profile', protect, memberController.updateProfile);

// Admin routes
router.get('/all', protect, adminOnly, memberController.getAllMembers);
router.put('/:id/role', protect, adminOnly, memberController.updateMemberRole);

module.exports = router;
