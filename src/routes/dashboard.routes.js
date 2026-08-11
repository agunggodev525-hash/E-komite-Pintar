// ============================================
// Routes: Dashboard
// ============================================

const express = require('express');
const { authenticate } = require('../middlewares/auth');
const { authorize } = require('../middlewares/rbac');
const dashboardController = require('../controllers/dashboard.controller');

const router = express.Router();

router.use(authenticate);

/**
 * GET /api/v1/dashboard/admin
 */
router.get(
  '/admin',
  authorize('ADMIN_KOMITE'),
  dashboardController.getAdminDashboard
);

/**
 * GET /api/v1/dashboard/admin/chart-trend?bulan=2026-08
 */
router.get(
  '/admin/chart-trend',
  authorize('ADMIN_KOMITE'),
  dashboardController.getChartTrend
);

module.exports = router;
