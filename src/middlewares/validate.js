// ============================================
// Middleware: Input Validation (express-validator)
// ============================================

const { validationResult } = require('express-validator');
const { errorResponse } = require('../utils/response');

/**
 * Middleware wrapper untuk express-validator.
 * Jalankan setelah array validation rules.
 *
 * @example
 * router.post('/register',
 *   [body('email').isEmail(), body('password').isLength({ min: 6 })],
 *   validate,
 *   controller.register
 * );
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const extractedErrors = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
    }));

    return errorResponse(res, 'Validasi gagal.', 422, extractedErrors);
  }

  next();
};

module.exports = { validate };
