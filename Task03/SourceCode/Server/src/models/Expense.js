/**
 * Expense Model / Schema
 * Represents extracted expense data from receipts
 * 
 * Data Structure:
 * - Stores all extracted financial information
 * - Links to Receipt metadata
 * - Tracks extraction confidence and raw OCR text
 */

const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema(
  {
    // Receipt Reference
    receipt_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Receipt',
      required: true,
    },

    // Core Financial Data
    date: {
      type: Date,
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
      index: true,
    },
    vendor: {
      type: String,
      trim: true,
      index: true,
    },
    category: {
      type: String,
      enum: [
        'Food & Dining',
        'Transportation',
        'Shopping',
        'Utilities',
        'Entertainment',
        'Health & Medical',
        'Groceries',
        'Travel',
        'Education',
        'Personal Care',
        'Other'
      ],
      default: 'Other',
      index: true,
    },

    // Item Details (line items from receipt)
    items: [
      {
        name: {
          type: String,
          trim: true,
        },
        price: {
          type: Number,
          min: 0,
        },
        quantity: {
          type: Number,
          min: 1,
          default: 1,
        },
      },
    ],

    // OCR & Extraction Data
    raw_text: {
      type: String,
      default: '',
    },
    extraction_confidence: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    // Field Confidence Scores
    field_confidence: {
      date_confidence: { type: Number, min: 0, max: 100, default: 0 },
      amount_confidence: { type: Number, min: 0, max: 100, default: 0 },
      vendor_confidence: { type: Number, min: 0, max: 100, default: 0 },
      category_confidence: { type: Number, min: 0, max: 100, default: 0 },
    },

    // User Annotations
    tags: [String],
    notes: {
      type: String,
      default: '',
    },

    // Status & Audit
    is_verified: {
      type: Boolean,
      default: false,
    },
    manual_edits: {
      type: Boolean,
      default: false,
    },

    // Timestamps
    created_at: {
      type: Date,
      default: Date.now,
      index: true,
    },
    updated_at: {
      type: Date,
      default: Date.now,
    },
  },
  {
    collection: 'expenses',
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

// Indexes for common queries
expenseSchema.index({ date: -1 });
expenseSchema.index({ category: 1, date: -1 });
expenseSchema.index({ vendor: 1 });
expenseSchema.index({ created_at: -1 });

// Virtual for month grouping
expenseSchema.virtual('month_year').get(function () {
  return this.date.toISOString().slice(0, 7); // YYYY-MM format
});

module.exports = mongoose.model('Expense', expenseSchema);
