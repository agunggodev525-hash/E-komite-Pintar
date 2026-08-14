// ============================================
// Routes: Super Admin
// ============================================

const express = require('express');
const { getAnalytics, getTenants, createTenant, toggleTenantStatus, impersonateTenant, resetPasswordTenant, updateTenant, getSystemLogs, getSettings, updateSettings, getPaketList, createPaket, updatePaket, deletePaket, togglePaketStatus } = require('../controllers/superadmin.controller');
const { authenticate } = require('../middlewares/auth');
const { authorize } = require('../middlewares/rbac');

const router = express.Router();

// Semua route di sini wajib login dan role SUPER_ADMIN
router.use(authenticate);
router.use(authorize('SUPER_ADMIN'));

// GET /api/v1/superadmin/analytics
router.get('/analytics', getAnalytics);

// Tenant Management
router.get('/tenants', getTenants);
router.post('/tenants', createTenant);
router.patch('/tenants/:id/status', toggleTenantStatus);
router.put('/tenants/:id', updateTenant);

// Troubleshooting
router.post('/tenants/:id/impersonate', impersonateTenant);
router.post('/tenants/:id/reset-password', resetPasswordTenant);

// Log & Settings
router.get('/logs', getSystemLogs);
router.get('/settings', getSettings);
router.post('/settings', updateSettings);

// Manajemen Paket SaaS
router.get('/paket', getPaketList);
router.post('/paket', createPaket);
router.put('/paket/:id', updatePaket);
router.delete('/paket/:id', deletePaket);
router.patch('/paket/:id/status', togglePaketStatus);

module.exports = router;
