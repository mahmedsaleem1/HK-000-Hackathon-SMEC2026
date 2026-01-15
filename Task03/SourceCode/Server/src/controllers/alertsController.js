/**
 * Alerts Controller
 * Handles alert management and budget configuration
 */

const Alert = require('../models/Alert');
const BudgetSettings = require('../models/BudgetSettings');
const { successResponse, paginatedResponse } = require('../middleware/responseFormatter');
const { NotFoundError, ValidationError } = require('../middleware/errorHandler');
const { validateBudgetPayload } = require('../utils/validators');

/**
 * Get all alerts with optional filters
 */
const getAlerts = async (req, res, next) => {
  try {
    const { type, isRead, limit = 20, page = 1 } = req.query;

    const filter = {};
    if (type) filter.alert_type = type;
    if (isRead !== undefined) filter.is_read = isRead === 'true';

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const alerts = await Alert.find(filter)
      .populate('related_expense_id', 'date amount vendor category')
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalCount = await Alert.countDocuments(filter);

    paginatedResponse(res, alerts, totalCount, page, limit);
  } catch (error) {
    next(error);
  }
};

/**
 * Get alert by ID
 */
const getAlertById = async (req, res, next) => {
  try {
    const alert = await Alert.findById(req.params.id).populate(
      'related_expense_id'
    );

    if (!alert) {
      throw new NotFoundError('Alert');
    }

    successResponse(res, alert);
  } catch (error) {
    next(error);
  }
};

/**
 * Mark alert as read
 */
const markAsRead = async (req, res, next) => {
  try {
    const alert = await Alert.findByIdAndUpdate(
      req.params.id,
      {
        is_read: true,
        read_at: new Date(),
      },
      { new: true }
    );

    if (!alert) {
      throw new NotFoundError('Alert');
    }

    successResponse(res, alert, 'Alert marked as read');
  } catch (error) {
    next(error);
  }
};

/**
 * Dismiss alert
 */
const dismissAlert = async (req, res, next) => {
  try {
    const alert = await Alert.findByIdAndUpdate(
      req.params.id,
      {
        is_dismissed: true,
        dismissed_at: new Date(),
      },
      { new: true }
    );

    if (!alert) {
      throw new NotFoundError('Alert');
    }

    successResponse(res, alert, 'Alert dismissed');
  } catch (error) {
    next(error);
  }
};

/**
 * Delete alert
 */
const deleteAlert = async (req, res, next) => {
  try {
    const alert = await Alert.findByIdAndDelete(req.params.id);

    if (!alert) {
      throw new NotFoundError('Alert');
    }

    successResponse(res, { deletedId: req.params.id }, 'Alert deleted');
  } catch (error) {
    next(error);
  }
};

/**
 * Get current budget settings
 */
const getBudgetSettings = async (req, res, next) => {
  try {
    let settings = await BudgetSettings.findOne({ user_id: 'default_user' });

    // Create default settings if none exist
    if (!settings) {
      settings = new BudgetSettings({ user_id: 'default_user' });
      await settings.save();
    }

    successResponse(res, settings);
  } catch (error) {
    next(error);
  }
};

/**
 * Update budget settings
 */
const updateBudgetSettings = async (req, res, next) => {
  try {
    const updateData = req.body;

    // Validate payload
    const validation = validateBudgetPayload(updateData);
    if (!validation.isValid) {
      throw new ValidationError('Invalid budget data', validation.errors);
    }

    const settings = await BudgetSettings.findOneAndUpdate(
      { user_id: 'default_user' },
      {
        ...updateData,
        updated_at: new Date(),
      },
      { new: true, upsert: true }
    );

    successResponse(res, settings, 'Budget settings updated');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAlerts,
  getAlertById,
  markAsRead,
  dismissAlert,
  deleteAlert,
  getBudgetSettings,
  updateBudgetSettings,
};
