/**
 * Expense Controller
 * Handles expense CRUD operations
 */

const Expense = require('../models/Expense');
const Receipt = require('../models/Receipt');
const { successResponse, paginatedResponse, errorResponse } = require('../middleware/responseFormatter');
const { NotFoundError, ValidationError } = require('../middleware/errorHandler');
const { validateExpensePayload } = require('../utils/validators');

/**
 * Get all expenses with filtering and pagination
 */
const getAllExpenses = async (req, res, next) => {
  try {
    const { startDate, endDate, category, vendor, page = 1, limit = 20 } = req.query;

    // Build filter
    const filter = {};
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }
    if (category) filter.category = category;
    if (vendor) filter.vendor = vendor.toLowerCase();

    console.log('📊 Fetching expenses with filter:', filter);

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const expenses = await Expense.find(filter)
      .populate('receipt_id', 'filename uploaded_at')
      .sort({ date: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalCount = await Expense.countDocuments(filter);

    console.log(`✅ Found ${expenses.length} expenses (total: ${totalCount})`);

    paginatedResponse(res, expenses, totalCount, page, limit);
  } catch (error) {
    next(error);
  }
};

/**
 * Get expense by ID
 */
const getExpenseById = async (req, res, next) => {
  try {
    const expense = await Expense.findById(req.params.id).populate(
      'receipt_id',
      'filename original_filename file_path uploaded_at'
    );

    if (!expense) {
      throw new NotFoundError('Expense');
    }

    successResponse(res, expense);
  } catch (error) {
    next(error);
  }
};

/**
 * Update expense data (manual corrections)
 */
const updateExpense = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Validate update payload
    const validation = validateExpensePayload(updateData);
    if (!validation.isValid) {
      throw new ValidationError('Invalid expense data', validation.errors);
    }

    // Mark as manually edited
    updateData.manual_edits = true;
    updateData.updated_at = new Date();

    const expense = await Expense.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!expense) {
      throw new NotFoundError('Expense');
    }

    successResponse(res, expense, 'Expense updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Delete expense
 */
const deleteExpense = async (req, res, next) => {
  try {
    const { id } = req.params;

    const expense = await Expense.findByIdAndDelete(id);

    if (!expense) {
      throw new NotFoundError('Expense');
    }

    // Optional: Delete associated receipt file
    // const receipt = await Receipt.findById(expense.receipt_id);
    // if (receipt && fs.existsSync(receipt.file_path)) {
    //   fs.unlinkSync(receipt.file_path);
    // }

    successResponse(res, { deletedId: id }, 'Expense deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
};
