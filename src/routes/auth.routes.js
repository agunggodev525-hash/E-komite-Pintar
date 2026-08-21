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
  googleLogin,
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

/**
 * POST /api/v1/auth/google
 * Login user via Google
 */
router.post(
  '/google',
  [
    body('accessToken')
      .notEmpty()
      .withMessage('Token Google wajib diisi.'),
  ],
  validate,
  googleLogin
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

// GET /api/v1/auth/me
router.get(
  '/me',
  authenticate,
  async (req, res) => {
    try {
      const prisma = require('../config/database');
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: {
          id: true,
          nama_lengkap: true,
          email: true,
          no_whatsapp: true,
          role: true,
          status: true,
          foto_profil: true,
        }
      });
      if (!user) return require('../utils/response').errorResponse(res, 'User tidak ditemukan.', 404);
      return require('../utils/response').successResponse(res, 'Berhasil.', user);
    } catch (e) {
      next(e);
    }
  }
);

// Setup multer untuk foto profil dari app — pakai memoryStorage (Vercel compatible)
const multer = require('multer');
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Hanya file gambar yang diperbolehkan.'));
  }
});

// POST /api/v1/auth/foto-profil
const { updateFotoProfil } = require('../controllers/auth.controller');
router.post(
  '/foto-profil',
  authenticate,
  upload.single('foto'),
  updateFotoProfil
);

module.exports = router;
