// ============================================
// Routes: Authentication
// ============================================

const express = require('express');
const { body } = require('express-validator');
const { validate } = require('../middlewares/validate');
const {
  register,
  login,
  requestOtp,
  verifyOtp,
} = require('../controllers/auth.controller');

const router = express.Router();

/**
 * POST /api/v1/auth/register
 * Registrasi user baru
 */
router.post(
  '/register',
  [
    body('nama_lengkap')
      .trim()
      .notEmpty()
      .withMessage('Nama lengkap wajib diisi.')
      .isLength({ min: 3, max: 255 })
      .withMessage('Nama lengkap harus antara 3-255 karakter.'),

    body('email')
      .trim()
      .notEmpty()
      .withMessage('Email wajib diisi.')
      .isEmail()
      .withMessage('Format email tidak valid.')
      .normalizeEmail(),

    body('password')
      .notEmpty()
      .withMessage('Password wajib diisi.')
      .isLength({ min: 8 })
      .withMessage('Password minimal 8 karakter.'),

    body('no_whatsapp')
      .optional()
      .trim()
      .isMobilePhone('id-ID')
      .withMessage('Nomor WhatsApp tidak valid.'),

    body('role')
      .optional()
      .isIn(['SUPER_ADMIN', 'ADMIN_KOMITE', 'ORANG_TUA', 'SEKOLAH'])
      .withMessage('Role tidak valid.'),
  ],
  validate,
  register
);

/**
 * POST /api/v1/auth/login
 * Login user
 */
router.post(
  '/login',
  [
    body('email')
      .trim()
      .notEmpty()
      .withMessage('Email wajib diisi.')
      .isEmail()
      .withMessage('Format email tidak valid.')
      .normalizeEmail(),

    body('password')
      .notEmpty()
      .withMessage('Password wajib diisi.'),
  ],
  validate,
  login
);

// ============================================
// OTP Routes
// ============================================

// POST /api/v1/auth/request-otp
router.post(
  '/request-otp',
  [body('no_whatsapp').notEmpty().withMessage('Nomor WhatsApp wajib diisi')],
  validate,
  requestOtp
);

// POST /api/v1/auth/verify-otp
router.post(
  '/verify-otp',
  [
    body('no_whatsapp').notEmpty().withMessage('Nomor WhatsApp wajib diisi'),
    body('otp').notEmpty().withMessage('OTP wajib diisi'),
  ],
  validate,
  verifyOtp
);

module.exports = router;
