const express = require('express');
const { body } = require('express-validator');
const { validate } = require('../middlewares/validate');
const { authenticate } = require('../middlewares/auth');
const votingController = require('../controllers/voting.controller');

const router = express.Router();

// Semua rute voting harus melewati autentikasi
router.use(authenticate);

/**
 * GET /api/v1/voting
 * Mengambil daftar voting aktif beserta kandidatnya
 */
router.get('/', votingController.getActiveVoting);

/**
 * POST /api/v1/voting/vote
 * Menyimpan pilihan user ke dalam voting (dengan validasi role Orang Tua di-handle di app atau via logic jika perlu)
 * Di sini diasumsikan semua role yang diautentikasi (khususnya ORANG_TUA) bisa submit.
 */
router.post(
  '/vote',
  [
    body('voting_id').notEmpty().withMessage('voting_id wajib diisi'),
    body('kandidat_id').notEmpty().withMessage('kandidat_id wajib diisi'),
  ],
  validate,
  votingController.submitVote
);

// ============================================
// Fitur Admin (Khusus ADMIN_KOMITE)
// ============================================
const { authorize } = require('../middlewares/rbac');

router.get(
  '/admin',
  authorize('ADMIN_KOMITE', 'SEKOLAH'),
  votingController.getVotingAdmin
);

router.post(
  '/admin',
  authorize('ADMIN_KOMITE'),
  votingController.createVoting
);

router.delete(
  '/admin/:id',
  authorize('ADMIN_KOMITE'),
  votingController.deleteVoting
);

module.exports = router;
