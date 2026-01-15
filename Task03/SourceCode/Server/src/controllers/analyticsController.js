/**
 * Analytics Controller
 * Phase 6: Complete analytics implementation with trends, forecasts, and insights
 */

const Expense = require('../models/Expense');
const BudgetSettings = require('../models/BudgetSettings');
const { successResponse } = require('../middleware/responseFormatter');

/**
 * GET /api/analytics/summary
 * Monthly overview with budget comparison
 */
const getSummary = async (req, res, next) => {
  try {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Total spending this month
    const totalSpending = await Expense.aggregate([
      {
        $match: {
          date: { $gte: monthStart, $lte: monthEnd },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
          count: { $sum: 1 },
          average: { $avg: '$amount' },
          max: { $max: '$amount' },
          min: { $min: '$amount' },
        },
      },
    ]);

    // Get budget settings
    const budgetSettings = await BudgetSettings.findOne();
    const budget = budgetSettings?.monthly_budget || 0;

    const stats = totalSpending[0] || {
      total: 0,
      count: 0,
      average: 0,
      max: 0,
      min: 0,
    };

    const percentageUsed = budget > 0 ? (stats.total / budget) * 100 : 0;

    successResponse(res, {
      period: `${monthStart.toLocaleDateString()} - ${monthEnd.toLocaleDateString()}`,
      total_spending: stats.total,
      transaction_count: stats.count,
      average_transaction: stats.average,
      highest_transaction: stats.max,
      lowest_transaction: stats.min,
      monthly_budget: budget,
      percentage_used: Math.round(percentageUsed),
      remaining_budget: Math.max(0, budget - stats.total),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/analytics/by-category
 * Spending breakdown by category with budget comparison
 */
const getByCategory = async (req, res, next) => {
  try {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const categoryBreakdown = await Expense.aggregate([
      {
        $match: {
          date: { $gte: monthStart },
        },
      },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
          average: { $avg: '$amount' },
        },
      },
      {
        $sort: { total: -1 },
      },
    ]);

    // Get budget limits
    const budgetSettings = await BudgetSettings.findOne();
    const categoryBudgets = budgetSettings?.category_budgets || {};

    const results = categoryBreakdown.map((cat) => ({
      category: cat._id,
      total_spending: cat.total,
      transaction_count: cat.count,
      average_transaction: cat.average,
      budget_limit: categoryBudgets[cat._id] || null,
      percentage_of_budget: categoryBudgets[cat._id]
        ? Math.round((cat.total / categoryBudgets[cat._id]) * 100)
        : null,
      is_over_budget: categoryBudgets[cat._id] ? cat.total > categoryBudgets[cat._id] : false,
    }));

    successResponse(res, { categories: results });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/analytics/daily
 * Daily spending trend for current month
 */
const getDaily = async (req, res, next) => {
  try {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const dailySpending = await Expense.aggregate([
      {
        $match: {
          date: { $gte: monthStart, $lte: monthEnd },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$date' },
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    const results = dailySpending.map((day) => ({
      date: day._id,
      spending: day.total,
      transactions: day.count,
    }));

    successResponse(res, { daily_data: results });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/analytics/trends
 * 12-month spending trends with analysis
 */
const getTrends = async (req, res, next) => {
  try {
    const monthlySpending = [];
    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      const spending = await Expense.aggregate([
        {
          $match: {
            date: { $gte: monthStart, $lte: monthEnd },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' },
          },
        },
      ]);

      monthlySpending.push({
        month: monthStart.toLocaleDateString('en-US', { year: 'numeric', month: 'short' }),
        spending: spending[0]?.total || 0,
      });
    }

    // Calculate trend analysis
    const last3Months = monthlySpending.slice(-3);
    const last6Months = monthlySpending.slice(-6);
    const avg3Month = last3Months.reduce((sum, m) => sum + m.spending, 0) / 3;
    const avg6Month = last6Months.reduce((sum, m) => sum + m.spending, 0) / 6;

    successResponse(res, {
      monthly_data: monthlySpending,
      average_3_month: Math.round(avg3Month),
      average_6_month: Math.round(avg6Month),
      trend_direction: avg3Month > avg6Month ? 'increasing' : 'decreasing',
      trend_percentage: Math.round(((avg3Month - avg6Month) / avg6Month) * 100),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/analytics/forecast
 * Next month prediction based on current trend
 */
const getForecast = async (req, res, next) => {
  try {
    // Get last 3 months spending
    const forecast_data = [];
    for (let i = 2; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      const spending = await Expense.aggregate([
        {
          $match: {
            date: { $gte: monthStart, $lte: monthEnd },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' },
          },
        },
      ]);

      forecast_data.push(spending[0]?.total || 0);
    }

    // Linear forecast
    const avg = forecast_data.reduce((a, b) => a + b, 0) / 3;
    const trend = (forecast_data[2] - forecast_data[0]) / 2;
    const predicted_next_month = avg + trend;

    // Current month progress
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const currentMonthSpending = await Expense.aggregate([
      {
        $match: {
          date: { $gte: monthStart, $lte: now },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
        },
      },
    ]);

    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const dayOfMonth = now.getDate();
    const currentSpending = currentMonthSpending[0]?.total || 0;
    const estimated_total = currentSpending > 0 ? (currentSpending / dayOfMonth) * daysInMonth : 0;

    successResponse(res, {
      historical_3_months: forecast_data,
      average_monthly: Math.round(avg),
      trend_direction: trend > 0 ? 'increasing' : 'decreasing',
      predicted_next_month: Math.round(predicted_next_month),
      current_month_progress: {
        days_elapsed: dayOfMonth,
        days_remaining: daysInMonth - dayOfMonth,
        current_spending: currentSpending,
        estimated_total: Math.round(estimated_total),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/analytics/top-vendors
 * Top spending vendors
 */
const getTopVendors = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const topVendors = await Expense.aggregate([
      {
        $match: {
          date: { $gte: monthStart },
        },
      },
      {
        $group: {
          _id: '$vendor',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
          average: { $avg: '$amount' },
        },
      },
      {
        $sort: { total: -1 },
      },
      {
        $limit: limit,
      },
    ]);

    const results = topVendors.map((vendor) => ({
      vendor: vendor._id,
      total_spending: vendor.total,
      transaction_count: vendor.count,
      average_transaction: vendor.average,
    }));

    successResponse(res, { top_vendors: results });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/analytics/category-trends
 * Spending trends for a specific category
 */
const getCategoryTrends = async (req, res, next) => {
  try {
    const { category } = req.query;

    if (!category) {
      return res.status(400).json({ error: 'Category parameter required' });
    }

    const monthlyTrends = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      const spending = await Expense.aggregate([
        {
          $match: {
            category: category,
            date: { $gte: monthStart, $lte: monthEnd },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' },
            count: { $sum: 1 },
          },
        },
      ]);

      monthlyTrends.push({
        month: monthStart.toLocaleDateString('en-US', { year: 'numeric', month: 'short' }),
        spending: spending[0]?.total || 0,
        transactions: spending[0]?.count || 0,
      });
    }

    successResponse(res, {
      category: category,
      trends: monthlyTrends,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSummary,
  getByCategory,
  getDaily,
  getTrends,
  getForecast,
  getTopVendors,
  getCategoryTrends,
};
