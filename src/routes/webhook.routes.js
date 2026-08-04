// ============================================
// Routes: Webhook Payment
// ============================================

const express = require('express');
const { handleWebhook } = require('../controllers/webhook.controller');

const router = express.Router();

// POST /api/payment/webhook
router.post('/webhook', handleWebhook);

module.exports = router;
