// ============================================
// Utility: Audit Log (System Log Writer)
// ============================================
// Fungsi helper untuk mencatat aktivitas penting ke tabel SystemLog.
// Berjalan secara async (fire-and-forget) agar tidak memperlambat response.

const prisma = require('../config/database');

/**
 * Catat aktivitas ke SystemLog
 * @param {Object} params
 * @param {string} params.action - Jenis aksi (LOGIN, CREATE, UPDATE, DELETE, dll)
 * @param {string} params.detail - Deskripsi detail aktivitas
 * @param {string|null} params.userId - ID user yang melakukan aksi
 * @param {string|null} params.sekolahId - ID sekolah terkait (nullable)
 */
const writeLog = async ({ action, detail, userId = null, sekolahId = null }) => {
  try {
    await prisma.systemLog.create({
      data: {
        action,
        detail,
        user_id: userId,
        sekolah_id: sekolahId,
      }
    });
  } catch (error) {
    // Jangan sampai logging error meng-crash aplikasi utama
    console.error('[AuditLog] Gagal menulis log:', error.message);
  }
};

module.exports = { writeLog };
