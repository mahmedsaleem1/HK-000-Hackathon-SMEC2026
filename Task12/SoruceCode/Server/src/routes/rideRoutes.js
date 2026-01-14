const express = require('express');
const router = express.Router();
const rideController = require('../controllers/rideController');

// Ride routes
router.get('/rides', rideController.getAllRides);
router.get('/rides/search', rideController.searchRides);
router.get('/rides/history', rideController.getRideHistory);
router.get('/rides/:id', rideController.getRideById);
router.get('/rides/:id/seats', rideController.getSeatAvailability);
router.post('/rides', rideController.createRide);
router.put('/rides/:id', rideController.updateRide);
router.delete('/rides/:id', rideController.cancelRide);

// Booking routes
router.post('/rides/:id/book', rideController.bookSeat);
router.delete('/rides/:rideId/bookings/:bookingId', rideController.cancelBooking);

module.exports = router;
