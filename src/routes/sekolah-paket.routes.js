// ============================================
// Route: Sekolah Paket (SaaS Subscription)
// ============================================

const express = require('express');
const router = express.Router();
const sekolahPaketController = require('../controllers/sekolah-paket.controller');
const { authenticate } = require('../middlewares/auth');
const { authorize } = require('../middlewares/rbac');

// Hanya bisa diakses oleh ADMIN_KOMITE (Pengelola Sekolah) dan SEKOLAH (View Only)
router.use(authenticate);

// Endpoint untuk memilih paket langganan dan checkout
router.get('/', authorize('ADMIN_KOMITE', 'SEKOLAH', 'SUPER_ADMIN'), sekolahPaketController.getAvailablePaket);
router.post('/checkout', authorize('ADMIN_KOMITE', 'SUPER_ADMIN'), sekolahPaketController.checkoutPaket);
router.get('/riwayat', authorize('ADMIN_KOMITE', 'SEKOLAH', 'SUPER_ADMIN'), sekolahPaketController.getRiwayatTransaksi);

module.exports = router;
