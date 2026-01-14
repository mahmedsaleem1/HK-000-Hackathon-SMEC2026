const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true,
    minlength: 5,
    maxlength: 100
  },
  description: {
    type: String,
    required: [true, 'Task description is required'],
    minlength: 20,
    maxlength: 2000
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Web Development', 'Mobile Development', 'Design', 'Writing', 'Data Entry', 
           'Tutoring', 'Marketing', 'Video Editing', 'Photography', 'Other']
  },
  skills: [{
    type: String,
    trim: true
  }],
  budget: {
    min: {
      type: Number,
      required: true,
      min: 0
    },
    max: {
      type: Number,
      required: true,
      min: 0
    },
    type: {
      type: String,
      enum: ['fixed', 'hourly'],
      default: 'fixed'
    }
  },
  deadline: {
    type: Date,
    required: [true, 'Deadline is required']
  },
  status: {
    type: String,
    enum: ['open', 'in-progress', 'completed', 'cancelled'],
    default: 'open'
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  bids: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bid'
  }],
  acceptedBid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bid',
    default: null
  },
  completionDetails: {
    completedAt: Date,
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    feedback: String
  },
  urgency: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  attachments: [{
    filename: String,
    url: String
  }]
}, {
  timestamps: true
});

// Index for search and filtering
taskSchema.index({ title: 'text', description: 'text' });
taskSchema.index({ status: 1, category: 1 });
taskSchema.index({ postedBy: 1 });
taskSchema.index({ assignedTo: 1 });

module.exports = mongoose.model('Task', taskSchema);
