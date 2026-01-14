const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
    facility: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Facility',
        required: [true, 'Facility reference is required']
    },
    requestedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Member',
        required: [true, 'Member reference is required']
    },
    title: {
        type: String,
        required: [true, 'Booking title is required'],
        trim: true,
        maxlength: [100, 'Title cannot exceed 100 characters']
    },
    purpose: {
        type: String,
        maxlength: [300, 'Purpose cannot exceed 300 characters']
    },
    date: {
        type: Date,
        required: [true, 'Booking date is required']
    },
    startTime: {
        type: String,
        required: [true, 'Start time is required'],
        match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)']
    },
    endTime: {
        type: String,
        required: [true, 'End time is required'],
        match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)']
    },
    attendees: {
        type: Number,
        default: 1,
        min: [1, 'At least 1 attendee is required']
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'declined', 'cancelled', 'completed'],
        default: 'pending'
    },
    adminRemarks: {
        type: String,
        maxlength: [250, 'Remarks cannot exceed 250 characters']
    },
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Member'
    },
    reviewedAt: {
        type: Date
    },
    notificationSent: {
        type: Boolean,
        default: false
    },
    contactPhone: {
        type: String
    }
}, {
    timestamps: true
});

// Compound index to prevent double booking
reservationSchema.index({ facility: 1, date: 1, startTime: 1, endTime: 1 });
reservationSchema.index({ requestedBy: 1, status: 1 });
reservationSchema.index({ date: 1, status: 1 });

// Static method to check for conflicts
reservationSchema.statics.hasConflict = async function(facilityId, date, startTime, endTime, excludeId = null) {
    const query = {
        facility: facilityId,
        date: date,
        status: { $in: ['pending', 'approved'] },
        $or: [
            { startTime: { $lt: endTime }, endTime: { $gt: startTime } }
        ]
    };
    
    if (excludeId) {
        query._id = { $ne: excludeId };
    }
    
    const conflict = await this.findOne(query);
    return !!conflict;
};

module.exports = mongoose.model('Reservation', reservationSchema);
