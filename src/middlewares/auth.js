// ============================================
// Middleware: JWT Authentication
// ============================================

const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');
const prisma = require('../config/database');
const { errorResponse } = require('../utils/response');

/**
 * Middleware untuk memverifikasi JWT token.
 * - Mengekstrak token dari header Authorization: Bearer <token>
 * - Memverifikasi token dan menambahkan data user ke req.user
 * - Menolak request jika token tidak ada, expired, atau invalid
 */
const authenticate = async (req, res, next) => {
  try {
    // 1. Ambil header Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 'Akses ditolak. Token tidak ditemukan.', 401);
    }

    // 2. Ekstrak token
    const token = authHeader.split(' ')[1];

    // 3. Verifikasi token
    const decoded = jwt.verify(token, jwtConfig.secret);

    // 4. Cari user di database dan pastikan masih aktif
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        nama_lengkap: true,
        email: true,
        role: true,
        status: true,
        sekolah_id: true,
      },
    });

    if (!user) {
      return errorResponse(res, 'Token tidak valid. User tidak ditemukan.', 401);
    }

    if (!user.status) {
      return errorResponse(res, 'Akun Anda telah dinonaktifkan.', 403);
    }

    // 5. Simpan data user di request object
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return errorResponse(res, 'Token telah kedaluwarsa. Silakan login ulang.', 401);
    }
    if (error.name === 'JsonWebTokenError' || error.name === 'NotBeforeError') {
      return errorResponse(res, 'Token tidak valid.', 401);
    }
    
    // Jika error bukan karena JWT (misal: koneksi database gagal saat mencari user),
    // teruskan ke global error handler agar dilog dengan benar.
    next(error);
  }
};

module.exports = { authenticate };
