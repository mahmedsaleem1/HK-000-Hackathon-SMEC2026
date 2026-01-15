/**
 * Input Validation Utilities
 * Validates request data before processing
 */

/**
 * Validate date format
 * Accepts: YYYY-MM-DD, MM/DD/YYYY, DD/MM/YYYY
 */
const isValidDate = (dateString) => {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
};

/**
 * Validate amount (positive number)
 */
const isValidAmount = (amount) => {
  return typeof amount === 'number' && amount >= 0;
};

/**
 * Validate category
 */
const isValidCategory = (category) => {
  const validCategories = [
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
    'Other',
  ];
  return validCategories.includes(category);
};

/**
 * Validate vendor name
 */
const isValidVendor = (vendor) => {
  return typeof vendor === 'string' && vendor.trim().length > 0;
};

/**
 * Validate confidence score (0-100)
 */
const isValidConfidence = (score) => {
  return typeof score === 'number' && score >= 0 && score <= 100;
};

/**
 * Validate budget amount
 */
const isValidBudget = (budget) => {
  return typeof budget === 'number' && budget >= 0;
};

/**
 * Sanitize vendor name (lowercase, trim)
 */
const sanitizeVendor = (vendor) => {
  return vendor.trim().toLowerCase();
};

/**
 * Validate expense creation payload
 */
const validateExpensePayload = (data) => {
  const errors = [];

  if (!data.date || !isValidDate(data.date)) {
    errors.push('Invalid date format');
  }
  if (!data.amount || !isValidAmount(data.amount)) {
    errors.push('Amount must be a positive number');
  }
  if (data.category && !isValidCategory(data.category)) {
    errors.push('Invalid category');
  }
  if (data.vendor && !isValidVendor(data.vendor)) {
    errors.push('Vendor name is required and cannot be empty');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate budget settings payload
 */
const validateBudgetPayload = (data) => {
  const errors = [];

  if (data.monthly_budget && !isValidBudget(data.monthly_budget)) {
    errors.push('Monthly budget must be a positive number');
  }

  if (data.category_budgets) {
    Object.entries(data.category_budgets).forEach(([category, budget]) => {
      if (!isValidBudget(budget)) {
        errors.push(`Budget for ${category} must be a positive number`);
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

module.exports = {
  isValidDate,
  isValidAmount,
  isValidCategory,
  isValidVendor,
  isValidConfidence,
  isValidBudget,
  sanitizeVendor,
  validateExpensePayload,
  validateBudgetPayload,
};
