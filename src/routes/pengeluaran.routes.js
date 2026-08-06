// ============================================
// Routes: Pengeluaran
// ============================================

const express = require('express');
const { authenticate } = require('../middlewares/auth');
const { authorize } = require('../middlewares/rbac');
const pengeluaranController = require('../controllers/pengeluaran.controller');

const router = express.Router();

// Semua rute pengeluaran butuh login
router.use(authenticate);

/**
 * GET /api/v1/pengeluaran
 * Akses: SUPER_ADMIN, ADMIN_KOMITE, SEKOLAH, ORANG_TUA
 */
router.get(
  '/',
  authorize('SUPER_ADMIN', 'ADMIN_KOMITE', 'SEKOLAH', 'ORANG_TUA'),
  pengeluaranController.getPengeluaran
);

/**
 * POST /api/v1/pengeluaran
 * Akses: SUPER_ADMIN, ADMIN_KOMITE
 */
router.post(
  '/',
  authorize('ADMIN_KOMITE'),
  pengeluaranController.createPengeluaran
);

/**
 * PUT /api/v1/pengeluaran/:id
 * Akses: SUPER_ADMIN, ADMIN_KOMITE
 */
router.put(
  '/:id',
  authorize('ADMIN_KOMITE'),
  pengeluaranController.updatePengeluaran
);

/**
 * DELETE /api/v1/pengeluaran/:id
 * Akses: SUPER_ADMIN, ADMIN_KOMITE
 */
router.delete(
  '/:id',
  authorize('ADMIN_KOMITE'),
  pengeluaranController.deletePengeluaran
);

module.exports = router;
