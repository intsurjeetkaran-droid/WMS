/**
 * API Response Utility
 * Standardizes all API responses across the application
 */

/**
 * Send success response
 */
const successResponse = (res, message, data = null, statusCode = 200) => {
  const response = {
    success: true,
    message,
  };
  if (data !== null) response.data = data;
  return res.status(statusCode).json(response);
};

/**
 * Send error response
 */
const errorResponse = (res, message, statusCode = 500, errors = null) => {
  const response = {
    success: false,
    message,
  };
  if (errors) response.errors = errors;
  return res.status(statusCode).json(response);
};

/**
 * Send paginated response
 */
const paginatedResponse = (res, message, data, pagination) => {
  return res.status(200).json({
    success: true,
    message,
    data,
    pagination,
  });
};

module.exports = { successResponse, errorResponse, paginatedResponse };
