/**
 * Analytics Routes
 * Phase 6: Advanced analytics with trends, forecasts, and insights
 */

const express = require('express');
const router = express.Router();

const analyticsController = require('../controllers/analyticsController');

/**
 * GET /api/analytics/summary
 * Monthly overview with budget comparison
 */
router.get('/summary', analyticsController.getSummary);

/**
 * GET /api/analytics/by-category
 * Spending breakdown by category with budget comparison
 * Query params: none
 */
router.get('/by-category', analyticsController.getByCategory);

/**
 * GET /api/analytics/daily
 * Daily spending trend for current month
 * Query params: none
 */
router.get('/daily', analyticsController.getDaily);

/**
 * GET /api/analytics/trends
 * 12-month spending trends with analysis
 * Query params: none
 */
router.get('/trends', analyticsController.getTrends);

/**
 * GET /api/analytics/forecast
 * Next month prediction based on current trend
 * Query params: none
 */
router.get('/forecast', analyticsController.getForecast);

/**
 * GET /api/analytics/top-vendors
 * Top spending vendors
 * Query params: limit (default: 10)
 */
router.get('/top-vendors', analyticsController.getTopVendors);

/**
 * GET /api/analytics/category-trends
 * Spending trends for a specific category
 * Query params: category (required)
 */
router.get('/category-trends', analyticsController.getCategoryTrends);

module.exports = router;
