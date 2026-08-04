// ============================================
// Routes: Laporan
// ============================================

const express = require('express');
const { authenticate } = require('../middlewares/auth');
const { authorize } = require('../middlewares/rbac');
const laporanController = require('../controllers/laporan.controller');

const router = express.Router();

/**
 * GET /api/v1/laporan/keuangan
 * Laporan total pemasukan dari pembayaran LUNAS
 * Akses: SUPER_ADMIN, ADMIN_KOMITE, SEKOLAH
 * Query params opsional: ?bulan=8&tahun=2026
 */
router.get(
  '/keuangan',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN_KOMITE', 'SEKOLAH'),
  laporanController.getKeuangan
);

module.exports = router;
