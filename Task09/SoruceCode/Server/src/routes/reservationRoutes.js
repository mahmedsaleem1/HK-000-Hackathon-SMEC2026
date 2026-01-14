const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validateRequest } = require('../middlewares/validate');
const { protect, adminOnly } = require('../middlewares/auth');
const reservationController = require('../controllers/reservationController');

// Validation rules
const reservationValidation = [
    body('facility').notEmpty().withMessage('Facility is required'),
    body('title').trim().notEmpty().withMessage('Booking title is required'),
    body('date').isISO8601().withMessage('Valid date is required'),
    body('startTime').matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid start time is required'),
    body('endTime').matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid end time is required')
];

// User routes
router.post('/', protect, reservationValidation, validateRequest, reservationController.createReservation);
router.get('/my-bookings', protect, reservationController.getMyReservations);
router.get('/calendar', protect, reservationController.getCalendarData);
router.get('/:id', protect, reservationController.getReservation);
router.put('/:id/cancel', protect, reservationController.cancelReservation);

// Admin routes
router.get('/admin/all', protect, adminOnly, reservationController.getAllReservations);
router.get('/admin/stats', protect, adminOnly, reservationController.getReservationStats);
router.put('/admin/:id/status', protect, adminOnly, reservationController.updateReservationStatus);

module.exports = router;
