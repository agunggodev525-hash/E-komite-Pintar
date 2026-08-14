// ============================================
// Routes: Siswa
// ============================================

const express = require('express');
const { body } = require('express-validator');
const { validate } = require('../middlewares/validate');
const { authenticate } = require('../middlewares/auth');
const { authorize } = require('../middlewares/rbac');
const siswaController = require('../controllers/siswa.controller');

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

const router = express.Router();

/**
 * GET /api/v1/siswa
 * Ambil daftar siswa untuk sekolah admin
 */
router.get(
  '/',
  authenticate,
  authorize('ADMIN_KOMITE'),
  siswaController.getAll
);

/**
 * POST /api/v1/siswa
 * Tambah siswa baru
 */
router.post(
  '/',
  authenticate,
  authorize('ADMIN_KOMITE'),
  upload.single('foto_orang_tua'),
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
  authorize('ADMIN_KOMITE'),
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
  authorize('ADMIN_KOMITE'),
  siswaController.resetPassword
);

/**
 * DELETE /api/v1/siswa/:id
 */
router.delete(
  '/:id',
  authenticate,
  authorize('ADMIN_KOMITE'),
  siswaController.remove
);

/**
 * PUT /api/v1/siswa/:id
 * Update data siswa
 */
router.put(
  '/:id',
  authenticate,
  authorize('ADMIN_KOMITE'),
  upload.single('foto_orang_tua'),
  siswaController.update
);

module.exports = router;
