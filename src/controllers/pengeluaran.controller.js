// ============================================
// Controller: Pengeluaran
// ============================================

const prisma = require('../config/database');
const cloudinary = require('../config/cloudinary');
const { successResponse } = require('../utils/response');

/**
 * Helper: Upload buffer ke Cloudinary
 */
const uploadNota = (buffer, mimetype) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'ekomite/nota', resource_type: 'image' },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });
};

/**
 * Buat Pengeluaran Baru
 * POST /api/v1/pengeluaran
 * Akses: SUPER_ADMIN, ADMIN_KOMITE
 */
const createPengeluaran = async (req, res, next) => {
  try {
    const { keterangan, nominal, tanggal, kategori } = req.body;

    // Upload foto nota ke Cloudinary jika ada
    let nota_url = null;
    if (req.file && req.file.buffer) {
      try {
        nota_url = await uploadNota(req.file.buffer, req.file.mimetype);
      } catch (uploadErr) {
        console.error('Cloudinary upload error (nota):', uploadErr);
        // Tidak gagalkan seluruh request hanya karena foto gagal upload
      }
    }

    const newPengeluaran = await prisma.pengeluaran.create({
      data: {
        keterangan,
        nominal: Number(nominal),
        tanggal: new Date(tanggal),
        kategori: kategori || 'Lain-lain',
        nota_url,
        admin_id: req.user.id,
        sekolah_id: req.user.sekolah_id,
      },
    });

    return successResponse(res, 'Pengeluaran berhasil ditambahkan.', newPengeluaran, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Ambil Daftar Pengeluaran
 * GET /api/v1/pengeluaran
 * Akses: SUPER_ADMIN, ADMIN_KOMITE, SEKOLAH, ORANG_TUA
 */
const getPengeluaran = async (req, res, next) => {
  try {
    const pengeluaran = await prisma.pengeluaran.findMany({
      where: { sekolah_id: req.user.sekolah_id },
      include: {
        admin: {
          select: {
            id: true,
            nama_lengkap: true,
          },
        },
      },
      orderBy: { tanggal: 'desc' },
    });

    return successResponse(res, 'Data pengeluaran berhasil diambil.', pengeluaran);
  } catch (error) {
    next(error);
  }
};

/**
 * Update Pengeluaran
 * PUT /api/v1/pengeluaran/:id
 * Akses: SUPER_ADMIN, ADMIN_KOMITE
 */
const updatePengeluaran = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { keterangan, nominal, tanggal, kategori, nota_url } = req.body;
    const sekolah_id = req.user.sekolah_id;

    // Validasi kepemilikan: pastikan pengeluaran milik sekolah admin ini
    const existing = await prisma.pengeluaran.findFirst({
      where: { id, sekolah_id }
    });
    if (!existing) {
      return require('../utils/response').errorResponse(res, 'Pengeluaran tidak ditemukan atau Anda tidak memiliki akses.', 404);
    }

    const updated = await prisma.pengeluaran.update({
      where: { 
        id,
      },
      data: {
        ...(keterangan && { keterangan }),
        ...(nominal && { nominal: Number(nominal) }),
        ...(tanggal && { tanggal: new Date(tanggal) }),
        ...(kategori && { kategori }),
        ...(nota_url !== undefined && { nota_url }),
      },
    });

    return successResponse(res, 'Pengeluaran berhasil diperbarui.', updated);
  } catch (error) {
    next(error);
  }
};

/**
 * Hapus Pengeluaran
 * DELETE /api/v1/pengeluaran/:id
 * Akses: SUPER_ADMIN, ADMIN_KOMITE
 */
const deletePengeluaran = async (req, res, next) => {
  try {
    const { id } = req.params;
    const sekolah_id = req.user.sekolah_id;

    // Validasi kepemilikan: pastikan pengeluaran milik sekolah admin ini
    const existing = await prisma.pengeluaran.findFirst({
      where: { id, sekolah_id }
    });
    if (!existing) {
      return require('../utils/response').errorResponse(res, 'Pengeluaran tidak ditemukan atau Anda tidak memiliki akses.', 404);
    }

    await prisma.pengeluaran.delete({
      where: { 
        id,
      },
    });

    return successResponse(res, 'Pengeluaran berhasil dihapus.');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPengeluaran,
  getPengeluaran,
  updatePengeluaran,
  deletePengeluaran,
};
