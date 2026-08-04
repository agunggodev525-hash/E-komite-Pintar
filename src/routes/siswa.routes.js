// ============================================
// Routes: Siswa
// ============================================

const express = require('express');
const { body } = require('express-validator');
const { validate } = require('../middlewares/validate');
const { authenticate } = require('../middlewares/auth');
const { authorize } = require('../middlewares/rbac');
const siswaController = require('../controllers/siswa.controller');

const router = express.Router();

/**
 * GET /api/v1/siswa
 * Ambil daftar siswa untuk sekolah admin
 */
router.get(
  '/',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN_KOMITE'),
  siswaController.getAll
);

/**
 * POST /api/v1/siswa
 * Tambah siswa baru
 */
router.post(
  '/',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN_KOMITE'),
  [
    body('nama_siswa')
      .trim()
      .notEmpty()
      .withMessage('Nama siswa wajib diisi.'),
    body('nisn')
      .trim()
      .notEmpty()
      .withMessage('NISN wajib diisi.')
      .isNumeric()
      .withMessage('NISN harus berupa angka.'),
    body('kelas')
      .trim()
      .notEmpty()
      .withMessage('Kelas wajib diisi.'),
    body('nama_orang_tua')
      .trim()
      .notEmpty()
      .withMessage('Nama orang tua wajib diisi.'),
    body('email_orang_tua')
      .optional({ checkFalsy: true })
      .isEmail()
      .withMessage('Format email tidak valid.'),
  ],
  validate,
  siswaController.create
);

/**
 * POST /api/v1/siswa/bulk
 * Tambah banyak siswa dari Excel
 */
router.post(
  '/bulk',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN_KOMITE'),
  [
    body('data')
      .isArray()
      .withMessage('Data harus berupa array.'),
  ],
  validate,
  siswaController.bulkCreate
);

/**
 * POST /api/v1/siswa/:id/reset-password
 */
router.post(
  '/:id/reset-password',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN_KOMITE'),
  siswaController.resetPassword
);

/**
 * DELETE /api/v1/siswa/:id
 */
router.delete(
  '/:id',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN_KOMITE'),
  siswaController.remove
);

module.exports = router;
