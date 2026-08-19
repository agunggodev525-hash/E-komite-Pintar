// ============================================
// Controller: Notifikasi
// ============================================

const prisma = require('../config/database');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * Mendapatkan daftar notifikasi untuk user yang sedang login
 */
const getNotifikasi = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const notifikasi = await prisma.notifikasi.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
      take: 20 // Ambil maksimal 20 notifikasi terbaru
    });

    return successResponse(res, 'Berhasil mengambil notifikasi', notifikasi);
  } catch (error) {
    next(error);
  }
};

/**
 * Menandai semua notifikasi milik user menjadi "Sudah Dibaca"
 */
const markAllAsRead = async (req, res, next) => {
  try {
    const userId = req.user.id;
    await prisma.notifikasi.updateMany({
      where: { 
        user_id: userId,
        is_read: false
      },
      data: { is_read: true }
    });

    return successResponse(res, 'Semua notifikasi ditandai sudah dibaca');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotifikasi,
  markAllAsRead
};
