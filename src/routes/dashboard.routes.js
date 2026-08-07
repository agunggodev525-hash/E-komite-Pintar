// ============================================
// Routes: Dashboard
// ============================================

const express = require('express');
const { authorize, authenticate } = require('../middlewares/auth');
const dashboardController = require('../controllers/dashboard.controller');

const router = express.Router();

router.use(authenticate);

/**
 * GET /api/v1/dashboard/admin
 */
router.get(
  '/admin',
  authorize(['ADMIN_KOMITE']),
  dashboardController.getAdminDashboard
);

module.exports = router;
