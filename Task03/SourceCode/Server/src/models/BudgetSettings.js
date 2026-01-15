/**
 * Budget Settings Model / Schema
 * Stores user budget configuration and preferences
 * 
 * Data Structure:
 * - Monthly budget limits
 * - Category-specific limits
 * - Alert thresholds
 */

const mongoose = require('mongoose');

const budgetSettingsSchema = new mongoose.Schema(
  {
    // User ID (for multi-user support in future)
    user_id: {
      type: String,
      default: 'default_user',
      unique: true,
      index: true,
    },

    // Overall Monthly Budget
    monthly_budget: {
      type: Number,
      default: 2000,
      min: 0,
    },

    // Category Budgets
    category_budgets: {
      Food: { type: Number, default: 500 },
      Travel: { type: Number, default: 300 },
      Shopping: { type: Number, default: 500 },
      Utilities: { type: Number, default: 200 },
      Entertainment: { type: Number, default: 200 },
      Other: { type: Number, default: 300 },
    },

    // Alert Thresholds
    alerts: {
      enabled: { type: Boolean, default: true },
      high_transaction_threshold: {
        type: Number,
        default: 500,
        min: 0,
      },
      budget_exceed_percentage: {
        type: Number,
        default: 100,
        min: 0,
        max: 200,
      },
      unusual_spending_deviation: {
        type: Number,
        default: 150, // percentage
        min: 0,
      },
    },

    // Timestamps
    created_at: {
      type: Date,
      default: Date.now,
    },
    updated_at: {
      type: Date,
      default: Date.now,
    },
  },
  {
    collection: 'budget_settings',
  }
);

module.exports = mongoose.model('BudgetSettings', budgetSettingsSchema);
