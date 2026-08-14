// ============================================
// Routes: Authentication
// ============================================

const express = require('express');
const { body } = require('express-validator');
const { validate } = require('../middlewares/validate');
const { authenticate } = require('../middlewares/auth');
const {
  register,
  login,
  requestOtp,
  verifyOtp,
  updateFcmToken,
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

// POST /api/v1/auth/fcm-token
router.post(
  '/fcm-token',
  authenticate,
  [
    body('fcm_token').notEmpty().withMessage('FCM Token wajib diisi'),
  ],
  validate,
  updateFcmToken
);

// Setup multer untuk foto profil
const multer = require('multer');
const path = require('path');
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../public/uploads'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage, limits: { fileSize: 5 * 1024 * 1024 } }); // limit 5MB

// POST /api/v1/auth/foto-profil
const { updateFotoProfil } = require('../controllers/auth.controller');
router.post(
  '/foto-profil',
  authenticate,
  upload.single('foto'),
  updateFotoProfil
);

module.exports = router;
