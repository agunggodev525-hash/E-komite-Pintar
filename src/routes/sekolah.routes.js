// ============================================
// Route: Sekolah (Tenant)
// ============================================

const express = require('express');
const router = express.Router();
const sekolahController = require('../controllers/sekolah.controller');
const { authenticate } = require('../middlewares/auth');
const { authorize } = require('../middlewares/rbac');

// Terapkan middleware otentikasi untuk semua route sekolah
router.use(authenticate);

// Khusus SUPER_ADMIN
router.use(authorize('SUPER_ADMIN'));

// Endpoint Manajemen Klien (SaaS)
router.post('/', sekolahController.createSekolah);
router.get('/', sekolahController.getAllSekolah);
router.put('/:id', sekolahController.updateSekolah);
router.delete('/:id', sekolahController.deleteSekolah);

module.exports = router;
