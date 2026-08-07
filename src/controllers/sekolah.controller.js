// ============================================
// Controller: Sekolah (Tenant)
// ============================================

const prisma = require('../config/database');
const bcrypt = require('bcryptjs');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * Mendaftarkan Sekolah Baru & Akun Admin Pertamanya
 * POST /api/v1/sekolah
 * Akses: Khusus SUPER_ADMIN
 */
const createSekolah = async (req, res, next) => {
  try {
    const { nama_sekolah, alamat, admin_nama, admin_email, admin_password, paket_berlangganan = 'BASIC' } = req.body;

    if (!nama_sekolah || !admin_nama || !admin_email || !admin_password) {
      return errorResponse(res, 'Semua field wajib diisi.', 400);
    }

    // Cek apakah email sudah dipakai
    const existingUser = await prisma.user.findUnique({
      where: { email: admin_email },
    });
    if (existingUser) {
      return errorResponse(res, 'Email admin sudah digunakan.', 400);
    }

    // Buat Sekolah dan Akun ADMIN_KOMITE dalam 1 transaksi
    const password_hash = await bcrypt.hash(admin_password, 10);

    const sekolah = await prisma.sekolah.create({
      data: {
        nama_sekolah,
        alamat,
        paket_berlangganan,
        users: {
          create: {
            nama_lengkap: admin_nama,
            email: admin_email,
            password_hash,
            role: 'ADMIN_KOMITE',
          },
        },
      },
      include: {
        users: {
          select: {
            id: true,
            nama_lengkap: true,
            email: true,
            role: true,
          }
        }
      }
    });

    return successResponse(res, 'Sekolah baru dan akun Admin Komite berhasil dibuat.', sekolah, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Melihat daftar semua Sekolah
 * GET /api/v1/sekolah
 * Akses: Khusus SUPER_ADMIN
 */
const getAllSekolah = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [sekolah, total] = await Promise.all([
      prisma.sekolah.findMany({
        skip,
        take: parseInt(limit),
        orderBy: { created_at: 'desc' },
        include: {
          _count: {
            select: { users: true, siswa: true, tagihan: true }
          }
        }
      }),
      prisma.sekolah.count()
    ]);

    return successResponse(res, 'Daftar sekolah berhasil diambil.', {
      sekolah,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        total_pages: Math.ceil(total / parseInt(limit)),
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mengubah Paket Berlangganan Sekolah
 * PUT /api/v1/sekolah/:id
 * Akses: Khusus SUPER_ADMIN
 */
const updateSekolah = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { paket_berlangganan } = req.body;

    if (!paket_berlangganan) {
      return errorResponse(res, 'Paket berlangganan wajib diisi.', 400);
    }

    const sekolah = await prisma.sekolah.update({
      where: { id },
      data: { paket_berlangganan },
    });

    return successResponse(res, 'Paket berlangganan sekolah berhasil diubah.', sekolah);
  } catch (error) {
    if (error.code === 'P2025') {
      return errorResponse(res, 'Sekolah tidak ditemukan.', 404);
    }
    next(error);
  }
};

/**
 * Menghapus Klien Sekolah
 * DELETE /api/v1/sekolah/:id
 * Akses: Khusus SUPER_ADMIN
 */
const deleteSekolah = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Penghapusan ini akan otomatis menghapus (Cascade) data lain 
    // seperti user, siswa, tagihan, pembayaran terkait.
    await prisma.sekolah.delete({
      where: { id },
    });

    return successResponse(res, 'Sekolah berhasil dihapus beserta seluruh data terkait.');
  } catch (error) {
    if (error.code === 'P2025') {
      return errorResponse(res, 'Sekolah tidak ditemukan.', 404);
    }
    next(error);
  }
};

module.exports = { createSekolah, getAllSekolah, updateSekolah, deleteSekolah };
