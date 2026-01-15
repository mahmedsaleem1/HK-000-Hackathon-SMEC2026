/**
 * Alerts Routes
 * Handles: list alerts, mark as read, configure budgets
 */

const express = require('express');
const router = express.Router();

const alertsController = require('../controllers/alertsController');

/**
 * GET /api/alerts
 * Get all unread alerts with optional filters
 * Query params: type, isRead, limit, page
 */
router.get('/', alertsController.getAlerts);

/**
 * GET /api/alerts/:id
 * Get specific alert by ID
 */
router.get('/:id', alertsController.getAlertById);

/**
 * PUT /api/alerts/:id/read
 * Mark alert as read
 */
router.put('/:id/read', alertsController.markAsRead);

/**
 * PUT /api/alerts/:id/dismiss
 * Dismiss alert
 */
router.put('/:id/dismiss', alertsController.dismissAlert);

/**
 * DELETE /api/alerts/:id
 * Delete alert
 */
router.delete('/:id', alertsController.deleteAlert);

/**
 * GET /api/alerts/settings
 * Get current budget settings
 */
router.get('/settings/current', alertsController.getBudgetSettings);

/**
 * POST /api/alerts/settings
 * Update budget settings and alert thresholds
 */
router.post('/settings', alertsController.updateBudgetSettings);

module.exports = router;
