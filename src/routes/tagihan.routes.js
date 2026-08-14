// ============================================
// Routes: Tagihan
// ============================================

const express = require('express');
const { body } = require('express-validator');
const { validate } = require('../middlewares/validate');
const { authenticate } = require('../middlewares/auth');
const { authorize } = require('../middlewares/rbac');
const tagihanController = require('../controllers/tagihan.controller');
const { cacheMiddleware } = require('../utils/cache');

const router = express.Router();

/**
 * POST /api/v1/tagihan
 * Buat tagihan baru
 * Akses: SUPER_ADMIN, ADMIN_KOMITE (ORANG_TUA DITOLAK)
 */
router.post(
  '/',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN_KOMITE'),
  [
    body('judul')
      .trim()
      .notEmpty()
      .withMessage('Judul tagihan wajib diisi.')
      .isLength({ max: 255 })
      .withMessage('Judul tagihan maksimal 255 karakter.'),

    body('deskripsi')
      .optional()
      .trim(),

    body('nominal')
      .notEmpty()
      .withMessage('Nominal wajib diisi.')
      .isDecimal({ decimal_digits: '0,2' })
      .withMessage('Nominal harus berupa angka desimal.')
      .custom((value) => {
        if (parseFloat(value) <= 0) {
          throw new Error('Nominal harus lebih besar dari 0.');
        }
        return true;
      }),

    body('tenggat_waktu')
      .notEmpty()
      .withMessage('Tenggat waktu wajib diisi.')
      .isISO8601()
      .withMessage('Format tanggal tidak valid (gunakan YYYY-MM-DD).'),
  ],
  validate,
  tagihanController.create
);

/**
 * GET /api/v1/tagihan
 * Ambil semua tagihan (dengan pagination)
 * Akses: Semua role yang terautentikasi
 */
router.get(
  '/',
  authenticate,
  cacheMiddleware(300), // Cache 5 menit
  tagihanController.getAll
);

/**
 * GET /api/v1/tagihan/siswa/:siswaId
 * Ambil daftar tagihan milik siswa tertentu
 * Akses: Semua role (controller memvalidasi kepemilikan untuk ORANG_TUA)
 */
router.get(
  '/siswa/:siswaId',
  authenticate,
  cacheMiddleware(120), // Cache 2 menit — tagihan siswa lebih sering berubah
  tagihanController.getBySiswaId
);

/**
 * GET /api/v1/tagihan/:id
 * Ambil detail tagihan berdasarkan ID
 * Akses: Semua role yang terautentikasi
 */
router.get(
  '/:id',
  authenticate,
  cacheMiddleware(300),
  tagihanController.getById
);

module.exports = router;
