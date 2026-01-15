/**
 * Response Formatter Middleware
 * Standardizes API response format
 */

/**
 * Success response format
 */
const successResponse = (res, data, message = 'Success', statusCode = 200) => {
  res.status(statusCode).json({
    status: 'success',
    statusCode,
    message,
    data,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Paginated response format
 */
const paginatedResponse = (
  res,
  data,
  totalCount,
  page = 1,
  limit = 10,
  message = 'Success'
) => {
  const totalPages = Math.ceil(totalCount / limit);

  res.status(200).json({
    status: 'success',
    statusCode: 200,
    message,
    data,
    pagination: {
      currentPage: page,
      totalPages,
      totalRecords: totalCount,
      pageSize: limit,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
    timestamp: new Date().toISOString(),
  });
};

/**
 * Error response format (for manual error responses)
 */
const errorResponse = (res, message, statusCode = 500, details = null) => {
  res.status(statusCode).json({
    status: 'error',
    statusCode,
    message,
    ...(details && { details }),
    timestamp: new Date().toISOString(),
  });
};

module.exports = {
  successResponse,
  paginatedResponse,
  errorResponse,
};
