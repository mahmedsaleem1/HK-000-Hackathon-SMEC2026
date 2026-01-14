const Ride = require('../models/Ride');

// Get all active rides
exports.getAllRides = (req, res) => {
  try {
    const rides = Ride.findAll();
    res.json({ success: true, data: rides });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get ride by ID
exports.getRideById = (req, res) => {
  try {
    const ride = Ride.findById(req.params.id);
    if (!ride) {
      return res.status(404).json({ success: false, error: 'Ride not found' });
    }
    res.json({ success: true, data: ride });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Create a new ride
exports.createRide = (req, res) => {
  try {
    const { driverName, driverPhone, origin, destination, departureTime, departureDate, totalSeats } = req.body;

    if (!driverName || !origin || !destination || !departureTime || !departureDate || !totalSeats) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    const ride = Ride.create(req.body);
    res.status(201).json({ success: true, data: ride });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Search rides
exports.searchRides = (req, res) => {
  try {
    const { origin, destination, date, seats } = req.query;
    const rides = Ride.search({ origin, destination, date, seats });
    res.json({ success: true, data: rides });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update ride
exports.updateRide = (req, res) => {
  try {
    const ride = Ride.update(req.params.id, req.body);
    if (!ride) {
      return res.status(404).json({ success: false, error: 'Ride not found' });
    }
    res.json({ success: true, data: ride });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Cancel ride
exports.cancelRide = (req, res) => {
  try {
    const success = Ride.delete(req.params.id);
    if (!success) {
      return res.status(404).json({ success: false, error: 'Ride not found' });
    }
    res.json({ success: true, message: 'Ride cancelled successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Book a seat
exports.bookSeat = (req, res) => {
  try {
    const { passengerName, passengerPhone, passengerEmail, seatsRequested, pickupPoint } = req.body;

    if (!passengerName || !passengerPhone || !seatsRequested) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    const result = Ride.bookSeat(req.params.id, req.body);
    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(201).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Cancel booking
exports.cancelBooking = (req, res) => {
  try {
    const result = Ride.cancelBooking(req.params.rideId, req.params.bookingId);
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get ride history (all rides including completed/cancelled)
exports.getRideHistory = (req, res) => {
  try {
    const rides = Ride.getHistory();
    res.json({ success: true, data: rides });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get real-time seat availability
exports.getSeatAvailability = (req, res) => {
  try {
    const ride = Ride.findById(req.params.id);
    if (!ride) {
      return res.status(404).json({ success: false, error: 'Ride not found' });
    }
    res.json({
      success: true,
      data: {
        rideId: ride.id,
        totalSeats: ride.totalSeats,
        availableSeats: ride.availableSeats,
        bookedSeats: ride.totalSeats - ride.availableSeats,
        bookings: ride.bookings.filter(b => b.status === 'confirmed')
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
