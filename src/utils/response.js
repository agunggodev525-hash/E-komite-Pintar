// ============================================
// API Response Helpers
// ============================================

/**
 * Format response sukses yang konsisten
 * @param {object} res - Express response object
 * @param {string} message - Pesan sukses
 * @param {object} data - Data yang dikembalikan
 * @param {number} statusCode - HTTP status code (default: 200)
 */
const successResponse = (res, message, data = null, statusCode = 200) => {
  const response = {
    success: true,
    message,
  };

  if (data !== null) {
    response.data = data;
  }

  return res.status(statusCode).json(response);
};

/**
 * Format response error yang konsisten
 * @param {object} res - Express response object
 * @param {string} message - Pesan error
 * @param {number} statusCode - HTTP status code (default: 500)
 * @param {array} errors - Detail error (optional)
 */
const errorResponse = (res, message, statusCode = 500, errors = null) => {
  const response = {
    success: false,
    message,
  };

  if (errors !== null) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};

module.exports = { successResponse, errorResponse };
