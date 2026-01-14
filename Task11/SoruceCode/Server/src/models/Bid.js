const mongoose = require('mongoose');

const bidSchema = new mongoose.Schema({
  task: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    required: true
  },
  bidder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: [true, 'Bid amount is required'],
    min: 0
  },
  deliveryTime: {
    value: {
      type: Number,
      required: true,
      min: 1
    },
    unit: {
      type: String,
      enum: ['hours', 'days', 'weeks'],
      default: 'days'
    }
  },
  proposal: {
    type: String,
    required: [true, 'Proposal is required'],
    minlength: 50,
    maxlength: 1000
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'withdrawn'],
    default: 'pending'
  },
  bidType: {
    type: String,
    enum: ['price', 'time'],
    default: 'price'
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate bids
bidSchema.index({ task: 1, bidder: 1 }, { unique: true });

// Virtual to get delivery time in hours
bidSchema.virtual('deliveryTimeInHours').get(function() {
  const multipliers = {
    hours: 1,
    days: 24,
    weeks: 168
  };
  return this.deliveryTime.value * multipliers[this.deliveryTime.unit];
});

module.exports = mongoose.model('Bid', bidSchema);
