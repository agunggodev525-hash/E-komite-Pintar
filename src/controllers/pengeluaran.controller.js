// ============================================
// Controller: Pengeluaran
// ============================================

const prisma = require('../config/database');
const { successResponse } = require('../utils/response');

/**
 * Buat Pengeluaran Baru
 * POST /api/v1/pengeluaran
 * Akses: SUPER_ADMIN, ADMIN_KOMITE
 */
const createPengeluaran = async (req, res, next) => {
  try {
    const { keterangan, nominal, tanggal, kategori, nota_url } = req.body;

    const newPengeluaran = await prisma.pengeluaran.create({
      data: {
        keterangan,
        nominal: Number(nominal),
        tanggal: new Date(tanggal),
        kategori,
        nota_url: nota_url || null,
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
