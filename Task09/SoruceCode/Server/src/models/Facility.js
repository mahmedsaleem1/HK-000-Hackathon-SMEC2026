const mongoose = require('mongoose');

const facilitySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Facility name is required'],
        trim: true,
        maxlength: [100, 'Name cannot exceed 100 characters']
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        enum: ['lab', 'hall', 'equipment', 'sports', 'meeting-room', 'auditorium', 'other'],
        default: 'other'
    },
    description: {
        type: String,
        maxlength: [500, 'Description cannot exceed 500 characters']
    },
    location: {
        building: { type: String, trim: true },
        floor: { type: String, trim: true },
        room: { type: String, trim: true }
    },
    capacity: {
        type: Number,
        min: [1, 'Capacity must be at least 1']
    },
    amenities: [{
        type: String,
        trim: true
    }],
    imageUrl: {
        type: String,
        default: ''
    },
    availability: {
        monday: { start: String, end: String, available: { type: Boolean, default: true } },
        tuesday: { start: String, end: String, available: { type: Boolean, default: true } },
        wednesday: { start: String, end: String, available: { type: Boolean, default: true } },
        thursday: { start: String, end: String, available: { type: Boolean, default: true } },
        friday: { start: String, end: String, available: { type: Boolean, default: true } },
        saturday: { start: String, end: String, available: { type: Boolean, default: false } },
        sunday: { start: String, end: String, available: { type: Boolean, default: false } }
    },
    defaultSlotDuration: {
        type: Number,
        default: 60, // in minutes
        min: [15, 'Slot duration must be at least 15 minutes']
    },
    requiresApproval: {
        type: Boolean,
        default: true
    },
    managedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Member'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    tags: [{
        type: String,
        lowercase: true,
        trim: true
    }]
}, {
    timestamps: true
});

// Index for search functionality
facilitySchema.index({ name: 'text', description: 'text', tags: 'text' });
facilitySchema.index({ category: 1, isActive: 1 });

module.exports = mongoose.model('Facility', facilitySchema);
