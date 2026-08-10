// ============================================
// Routes: Pembayaran
// ============================================

const express = require('express');
const { body } = require('express-validator');
const { validate } = require('../middlewares/validate');
const { authenticate } = require('../middlewares/auth');
const { authorize } = require('../middlewares/rbac');
const pembayaranController = require('../controllers/pembayaran.controller');

const router = express.Router();

/**
 * POST /api/v1/pembayaran/checkout
 * Inisiasi pembayaran tagihan
 * Akses: ORANG_TUA (membayar tagihan anak sendiri)
 *        SUPER_ADMIN, ADMIN_KOMITE (bisa bayar untuk siapa saja)
 */
router.post(
  '/checkout',
  authenticate,
  authorize('ORANG_TUA', 'ADMIN_KOMITE'),
  [
    body('tagihan_id')
      .notEmpty()
      .withMessage('ID tagihan wajib diisi.')
      .isUUID()
      .withMessage('ID tagihan harus berformat UUID.'),

    body('siswa_id')
      .notEmpty()
      .withMessage('ID siswa wajib diisi.'),

    body('metode_bayar')
      .optional()
      .trim()
      .isIn(['TRANSFER_BANK', 'VIRTUAL_ACCOUNT', 'E_WALLET', 'QRIS'])
      .withMessage('Metode bayar tidak valid. Pilih: TRANSFER_BANK, VIRTUAL_ACCOUNT, E_WALLET, QRIS.'),
  ],
  validate,
  pembayaranController.checkout
);

router.get('/', authenticate, authorize('ADMIN_KOMITE'), pembayaranController.getAllPembayaran);

// PENTING: Route spesifik harus SEBELUM route dengan parameter (:id)
// agar Express tidak salah mencocokkan 'peringatan-massal' sebagai `:id`
router.post('/peringatan-massal', authenticate, authorize('ADMIN_KOMITE'), pembayaranController.kirimPeringatanMassal);

router.post('/:id/lunas', authenticate, authorize('ADMIN_KOMITE'), pembayaranController.bayarManual); // Alias untuk backward compatibility
router.post('/:id/bayar', authenticate, authorize('ADMIN_KOMITE'), pembayaranController.bayarManual);
router.post('/:id/dispensasi', authenticate, authorize('ADMIN_KOMITE'), pembayaranController.setDispensasi);

module.exports = router;
