/**
 * Receipt Model / Schema
 * Stores metadata about uploaded receipt images
 * 
 * Data Structure:
 * - File information and storage path
 * - Processing status and logs
 * - Reference to processed expense data
 */

const mongoose = require('mongoose');

const receiptSchema = new mongoose.Schema(
  {
    // File Information
    filename: {
      type: String,
      required: true,
    },
    original_filename: {
      type: String,
      required: true,
    },
    file_path: {
      type: String,
      required: true,
    },
    file_size: {
      type: Number,
      required: true,
    },
    mime_type: {
      type: String,
      enum: ['image/jpeg', 'image/png', 'image/jpg'],
      required: true,
    },

    // Processing Status
    processing_status: {
      type: String,
      enum: ['pending', 'processing', 'success', 'failed'],
      default: 'pending',
      index: true,
    },

    // OCR Execution Details
    ocr_execution_time: {
      type: Number,
      default: null, // milliseconds
    },

    // Error Handling
    error_log: {
      type: String,
      default: null,
    },
    error_type: {
      type: String,
      enum: ['ocr_error', 'extraction_error', 'validation_error', 'system_error', null],
      default: null,
    },

    // Extracted Data Reference
    expense_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Expense',
      default: null,
    },

    // Extracted Raw Data (backup)
    extracted_text: {
      type: String,
      default: '',
    },

    // Audit Trail
    upload_ip: String,
    user_agent: String,

    // Timestamps
    uploaded_at: {
      type: Date,
      default: Date.now,
      index: true,
    },
    processed_at: {
      type: Date,
      default: null,
    },
  },
  {
    collection: 'receipts',
    timestamps: false,
  }
);

// Indexes for common queries
receiptSchema.index({ processing_status: 1 });
receiptSchema.index({ uploaded_at: -1 });
receiptSchema.index({ expense_id: 1 });

module.exports = mongoose.model('Receipt', receiptSchema);
