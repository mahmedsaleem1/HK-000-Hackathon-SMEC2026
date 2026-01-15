/**
 * Expenses Routes
 * Handles: upload, list, get, update, delete expenses
 */

const express = require('express');
const router = express.Router();

const { uploadSingleImage, handleUploadError } = require('../middleware/upload');
const uploadController = require('../controllers/uploadController');
const expenseController = require('../controllers/expenseController');

/**
 * POST /api/expenses/upload
 * Upload receipt image and extract expense data
 */
router.post('/upload', uploadSingleImage, handleUploadError, uploadController.processReceipt);

/**
 * GET /api/expenses
 * List all expenses with optional filters
 * Query params: startDate, endDate, category, vendor, page, limit
 */
router.get('/', expenseController.getAllExpenses);

/**
 * GET /api/expenses/:id
 * Get specific expense by ID
 */
router.get('/:id', expenseController.getExpenseById);

/**
 * PUT /api/expenses/:id
 * Update expense data (manual corrections)
 */
router.put('/:id', expenseController.updateExpense);

/**
 * DELETE /api/expenses/:id
 * Delete expense
 */
router.delete('/:id', expenseController.deleteExpense);

module.exports = router;
