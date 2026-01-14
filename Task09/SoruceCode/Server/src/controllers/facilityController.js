const Facility = require('../models/Facility');
const Reservation = require('../models/Reservation');

// Get all facilities with filters
exports.getAllFacilities = async (req, res) => {
    try {
        const { category, search, available, page = 1, limit = 12 } = req.query;
        
        let query = { isActive: true };
        
        if (category && category !== 'all') {
            query.category = category;
        }
        
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { tags: { $in: [new RegExp(search, 'i')] } }
            ];
        }

        const facilities = await Facility.find(query)
            .populate('managedBy', 'fullName email')
            .sort({ name: 1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await Facility.countDocuments(query);

        res.status(200).json({
            success: true,
            count: facilities.length,
            total,
            pages: Math.ceil(total / limit),
            facilities
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch facilities',
            error: error.message
        });
    }
};

// Get single facility
exports.getFacility = async (req, res) => {
    try {
        const facility = await Facility.findById(req.params.id)
            .populate('managedBy', 'fullName email');

        if (!facility) {
            return res.status(404).json({
                success: false,
                message: 'Facility not found'
            });
        }

        res.status(200).json({
            success: true,
            facility
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch facility',
            error: error.message
        });
    }
};

// Get facility availability for a specific date
exports.getFacilityAvailability = async (req, res) => {
    try {
        const { id } = req.params;
        const { date } = req.query;

        if (!date) {
            return res.status(400).json({
                success: false,
                message: 'Date is required'
            });
        }

        const facility = await Facility.findById(id);
        if (!facility) {
            return res.status(404).json({
                success: false,
                message: 'Facility not found'
            });
        }

        // Get all reservations for this facility on the given date
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        const reservations = await Reservation.find({
            facility: id,
            date: { $gte: startOfDay, $lte: endOfDay },
            status: { $in: ['pending', 'approved'] }
        }).select('startTime endTime status title');

        // Get day of week availability
        const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const dayOfWeek = dayNames[new Date(date).getDay()];
        const dayAvailability = facility.availability[dayOfWeek];

        res.status(200).json({
            success: true,
            date,
            facility: {
                id: facility._id,
                name: facility.name,
                slotDuration: facility.defaultSlotDuration
            },
            dayAvailability,
            bookedSlots: reservations
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch availability',
            error: error.message
        });
    }
};

// Create facility (Admin)
exports.createFacility = async (req, res) => {
    try {
        const facilityData = {
            ...req.body,
            managedBy: req.member._id
        };

        const facility = await Facility.create(facilityData);

        res.status(201).json({
            success: true,
            message: 'Facility created successfully',
            facility
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to create facility',
            error: error.message
        });
    }
};

// Update facility (Admin)
exports.updateFacility = async (req, res) => {
    try {
        const facility = await Facility.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!facility) {
            return res.status(404).json({
                success: false,
                message: 'Facility not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Facility updated',
            facility
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Update failed',
            error: error.message
        });
    }
};

// Delete facility (Admin)
exports.deleteFacility = async (req, res) => {
    try {
        const facility = await Facility.findById(req.params.id);

        if (!facility) {
            return res.status(404).json({
                success: false,
                message: 'Facility not found'
            });
        }

        // Check for pending/approved reservations
        const activeReservations = await Reservation.countDocuments({
            facility: req.params.id,
            status: { $in: ['pending', 'approved'] },
            date: { $gte: new Date() }
        });

        if (activeReservations > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete. ${activeReservations} active booking(s) exist.`
            });
        }

        await Facility.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: 'Facility removed'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Delete failed',
            error: error.message
        });
    }
};

// Get all facilities for admin (including inactive)
exports.getAdminFacilities = async (req, res) => {
    try {
        const { category, search, isActive, page = 1, limit = 20 } = req.query;
        
        let query = {};
        
        if (category && category !== 'all') query.category = category;
        if (isActive !== undefined) query.isActive = isActive === 'true';
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        const facilities = await Facility.find(query)
            .populate('managedBy', 'fullName email')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await Facility.countDocuments(query);

        res.status(200).json({
            success: true,
            count: facilities.length,
            total,
            pages: Math.ceil(total / limit),
            facilities
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch facilities',
            error: error.message
        });
    }
};

// Get facility statistics (Admin)
exports.getFacilityStats = async (req, res) => {
    try {
        const totalFacilities = await Facility.countDocuments();
        const activeFacilities = await Facility.countDocuments({ isActive: true });
        
        const categoryStats = await Facility.aggregate([
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        res.status(200).json({
            success: true,
            stats: {
                total: totalFacilities,
                active: activeFacilities,
                inactive: totalFacilities - activeFacilities,
                byCategory: categoryStats
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
