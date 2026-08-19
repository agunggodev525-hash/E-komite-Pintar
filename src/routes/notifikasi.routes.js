// ============================================
// Route: Notifikasi
// ============================================

const express = require('express');
const router = express.Router();
const notifikasiController = require('../controllers/notifikasi.controller');
const { authenticate } = require('../middlewares/auth');

// Hanya user yang login yang bisa mengakses
router.use(authenticate);

router.get('/', notifikasiController.getNotifikasi);
router.patch('/read-all', notifikasiController.markAllAsRead);

module.exports = router;
