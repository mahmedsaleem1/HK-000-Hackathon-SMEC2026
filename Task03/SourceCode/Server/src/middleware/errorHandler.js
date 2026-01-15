/**
 * Error Handler Middleware
 * Centralized error handling and formatting
 */

class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.timestamp = new Date().toISOString();
  }
}

class ValidationError extends AppError {
  constructor(message, details = []) {
    super(message, 400);
    this.details = details;
  }
}

class NotFoundError extends AppError {
  constructor(resource) {
    super(`${resource} not found`, 404);
  }
}

class DatabaseError extends AppError {
  constructor(message = 'Database operation failed') {
    super(message, 500);
  }
}

class FileUploadError extends AppError {
  constructor(message = 'File upload failed') {
    super(message, 400);
  }
}

/**
 * Format error response
 */
const formatErrorResponse = (error) => {
  if (error instanceof AppError) {
    return {
      status: 'error',
      statusCode: error.statusCode,
      message: error.message,
      ...(error.details && { details: error.details }),
      timestamp: error.timestamp,
    };
  }

  // Generic error
  return {
    status: 'error',
    statusCode: 500,
    message: error.message || 'Internal server error',
    timestamp: new Date().toISOString(),
  };
};

/**
 * Error handler middleware
 */
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  const errorResponse = formatErrorResponse(err);
  res.status(errorResponse.statusCode).json(errorResponse);
};

module.exports = {
  AppError,
  ValidationError,
  NotFoundError,
  DatabaseError,
  FileUploadError,
  formatErrorResponse,
  errorHandler,
};
