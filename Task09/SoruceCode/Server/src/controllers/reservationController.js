const Reservation = require('../models/Reservation');
const Facility = require('../models/Facility');
const Member = require('../models/Member');
const notificationService = require('../services/notificationService');

// Create a reservation
exports.createReservation = async (req, res) => {
    try {
        const { facility, title, purpose, date, startTime, endTime, attendees, contactPhone } = req.body;

        // Verify facility exists
        const facilityDoc = await Facility.findById(facility);
        if (!facilityDoc) {
            return res.status(404).json({
                success: false,
                message: 'Facility not found'
            });
        }

        if (!facilityDoc.isActive) {
            return res.status(400).json({
                success: false,
                message: 'This facility is currently unavailable'
            });
        }

        // Check for time conflicts
        const hasConflict = await Reservation.hasConflict(facility, new Date(date), startTime, endTime);
        if (hasConflict) {
            return res.status(400).json({
                success: false,
                message: 'This time slot is already booked. Please choose another.'
            });
        }

        // Check capacity
        if (attendees > facilityDoc.capacity) {
            return res.status(400).json({
                success: false,
                message: `Maximum capacity is ${facilityDoc.capacity} people`
            });
        }

        // Create reservation
        const reservation = await Reservation.create({
            facility,
            requestedBy: req.member._id,
            title,
            purpose,
            date: new Date(date),
            startTime,
            endTime,
            attendees,
            contactPhone,
            status: facilityDoc.requiresApproval ? 'pending' : 'approved'
        });

        // Send notification
        try {
            await notificationService.notifyBookingCreated(reservation, facilityDoc, req.member);
            reservation.notificationSent = true;
            await reservation.save();
        } catch (emailError) {
            console.log('Email notification failed:', emailError.message);
        }

        res.status(201).json({
            success: true,
            message: facilityDoc.requiresApproval 
                ? 'Booking submitted for approval' 
                : 'Booking confirmed',
            reservation
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Booking failed',
            error: error.message
        });
    }
};

// Get user's reservations
exports.getMyReservations = async (req, res) => {
    try {
        const { status, upcoming, page = 1, limit = 10 } = req.query;
        
        let query = { requestedBy: req.member._id };
        
        if (status) query.status = status;
        if (upcoming === 'true') query.date = { $gte: new Date() };

        const reservations = await Reservation.find(query)
            .populate('facility', 'name category location imageUrl')
            .sort({ date: -1, startTime: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await Reservation.countDocuments(query);

        res.status(200).json({
            success: true,
            count: reservations.length,
            total,
            pages: Math.ceil(total / limit),
            reservations
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch bookings',
            error: error.message
        });
    }
};

// Get single reservation
exports.getReservation = async (req, res) => {
    try {
        const reservation = await Reservation.findById(req.params.id)
            .populate('facility', 'name category location imageUrl capacity')
            .populate('requestedBy', 'fullName email phone department')
            .populate('reviewedBy', 'fullName');

        if (!reservation) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        // Only allow owner or admin to view
        if (reservation.requestedBy._id.toString() !== req.member._id.toString() && 
            req.member.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view this booking'
            });
        }

        res.status(200).json({
            success: true,
            reservation
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch booking',
            error: error.message
        });
    }
};

// Cancel reservation (by user)
exports.cancelReservation = async (req, res) => {
    try {
        const reservation = await Reservation.findById(req.params.id);

        if (!reservation) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        // Check ownership
        if (reservation.requestedBy.toString() !== req.member._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to cancel this booking'
            });
        }

        // Can only cancel pending or approved
        if (!['pending', 'approved'].includes(reservation.status)) {
            return res.status(400).json({
                success: false,
                message: 'Cannot cancel this booking'
            });
        }

        reservation.status = 'cancelled';
        await reservation.save();

        res.status(200).json({
            success: true,
            message: 'Booking cancelled',
            reservation
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Cancellation failed',
            error: error.message
        });
    }
};

// ============ ADMIN FUNCTIONS ============

// Get all reservations (Admin)
exports.getAllReservations = async (req, res) => {
    try {
        const { status, facility, date, page = 1, limit = 20 } = req.query;
        
        let query = {};
        
        if (status && status !== 'all') query.status = status;
        if (facility) query.facility = facility;
        if (date) {
            const startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);
            query.date = { $gte: startOfDay, $lte: endOfDay };
        }

        const reservations = await Reservation.find(query)
            .populate('facility', 'name category location')
            .populate('requestedBy', 'fullName email phone department')
            .populate('reviewedBy', 'fullName')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await Reservation.countDocuments(query);

        res.status(200).json({
            success: true,
            count: reservations.length,
            total,
            pages: Math.ceil(total / limit),
            reservations
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch bookings',
            error: error.message
        });
    }
};

// Update reservation status (Admin - approve/decline)
exports.updateReservationStatus = async (req, res) => {
    try {
        const { status, adminRemarks } = req.body;
        
        if (!['approved', 'declined', 'cancelled'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status'
            });
        }

        const reservation = await Reservation.findById(req.params.id);
        
        if (!reservation) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        // If approving, check for conflicts again
        if (status === 'approved') {
            const hasConflict = await Reservation.hasConflict(
                reservation.facility,
                reservation.date,
                reservation.startTime,
                reservation.endTime,
                reservation._id
            );
            
            if (hasConflict) {
                return res.status(400).json({
                    success: false,
                    message: 'Time slot conflict. Another booking was approved first.'
                });
            }
        }

        reservation.status = status;
        reservation.adminRemarks = adminRemarks || '';
        reservation.reviewedBy = req.member._id;
        reservation.reviewedAt = new Date();
        await reservation.save();

        // Send status notification
        try {
            const facility = await Facility.findById(reservation.facility);
            const member = await Member.findById(reservation.requestedBy);
            await notificationService.notifyStatusUpdate(reservation, facility, member, adminRemarks);
        } catch (emailError) {
            console.log('Status notification failed:', emailError.message);
        }

        res.status(200).json({
            success: true,
            message: `Booking ${status}`,
            reservation
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Status update failed',
            error: error.message
        });
    }
};

// Get reservation statistics (Admin)
exports.getReservationStats = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const stats = await Reservation.aggregate([
            {
                $facet: {
                    byStatus: [
                        { $group: { _id: '$status', count: { $sum: 1 } } }
                    ],
                    todayBookings: [
                        { 
                            $match: { 
                                date: { $gte: today, $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) },
                                status: 'approved'
                            } 
                        },
                        { $count: 'count' }
                    ],
                    pendingCount: [
                        { $match: { status: 'pending' } },
                        { $count: 'count' }
                    ],
                    thisWeek: [
                        {
                            $match: {
                                date: { 
                                    $gte: today,
                                    $lt: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
                                },
                                status: { $in: ['pending', 'approved'] }
                            }
                        },
                        { $count: 'count' }
                    ]
                }
            }
        ]);

        const result = stats[0];

        res.status(200).json({
            success: true,
            stats: {
                byStatus: result.byStatus,
                todayBookings: result.todayBookings[0]?.count || 0,
                pendingApproval: result.pendingCount[0]?.count || 0,
                upcomingThisWeek: result.thisWeek[0]?.count || 0
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch statistics',
            error: error.message
        });
    }
};

// Get calendar data for a facility
exports.getCalendarData = async (req, res) => {
    try {
        const { facilityId, month, year } = req.query;

        if (!month || !year) {
            return res.status(400).json({
                success: false,
                message: 'Month and year are required'
            });
        }

        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59);

        let query = {
            date: { $gte: startDate, $lte: endDate },
            status: { $in: ['pending', 'approved'] }
        };

        if (facilityId) {
            query.facility = facilityId;
        }

        const reservations = await Reservation.find(query)
            .populate('facility', 'name category')
            .populate('requestedBy', 'fullName')
            .select('facility date startTime endTime status title requestedBy');

        res.status(200).json({
            success: true,
            month: parseInt(month),
            year: parseInt(year),
            reservations
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch calendar data',
            error: error.message
        });
    }
};
