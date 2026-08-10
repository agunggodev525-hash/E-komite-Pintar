// ============================================
// Controller: Tagihan
// ============================================

const prisma = require('../config/database');
const { successResponse, errorResponse } = require('../utils/response');
const { sendPushNotification } = require('../services/notification.service');

/**
 * Buat tagihan baru
 * POST /api/v1/tagihan
 * Hanya SUPER_ADMIN dan ADMIN_KOMITE (dijaga oleh RBAC middleware)
 */
const create = async (req, res, next) => {
  try {
    const { judul, deskripsi, nominal, tenggat_waktu } = req.body;
    const sekolah_id = req.user.sekolah_id;
    const admin_id = req.user.id;

    // Ambil daftar seluruh siswa di sekolah ini beserta fcm_token orang tuanya
    const siswaList = await prisma.siswa.findMany({
      where: { sekolah_id },
      select: { 
        id: true,
        orang_tua: {
          select: { fcm_token: true }
        }
      }
    });

    if (siswaList.length === 0) {
      return errorResponse(res, 'Tidak dapat membuat tagihan karena belum ada data siswa di sekolah ini.', 400);
    }

    // Gunakan Prisma Transaction untuk Tagihan dan Pembayaran massal
    const result = await prisma.$transaction(async (tx) => {
      // 1. Buat record Tagihan
      const tagihan = await tx.tagihan.create({
        data: {
          judul,
          deskripsi: deskripsi || null,
          nominal: parseFloat(nominal),
          tenggat_waktu: new Date(tenggat_waktu),
          admin_id,
          sekolah_id,
        },
        include: {
          admin: { select: { id: true, nama_lengkap: true, email: true } }
        }
      });

      // 2. Siapkan data bulk insert untuk Pembayaran
      const pembayaranData = siswaList.map((siswa) => ({
        tagihan_id: tagihan.id,
        siswa_id: siswa.id,
        status: 'PENDING',
      }));

      // 3. Masukkan record Pembayaran massal
      await tx.pembayaran.createMany({
        data: pembayaranData,
      });

      return tagihan;
    });

    // 4. Kumpulkan FCM Tokens dari orang tua
    const tokens = [];
    siswaList.forEach(siswa => {
      if (siswa.orang_tua && siswa.orang_tua.fcm_token) {
        if (!tokens.includes(siswa.orang_tua.fcm_token)) {
          tokens.push(siswa.orang_tua.fcm_token);
        }
      }
    });

    // 5. Kirim Push Notification
    if (tokens.length > 0) {
      const title = 'Tagihan Baru: ' + judul;
      const body = `Ada tagihan baru sebesar Rp ${nominal} yang perlu dibayar sebelum ${new Date(tenggat_waktu).toLocaleDateString('id-ID')}.`;
      await sendPushNotification(tokens, title, body, { tagihan_id: result.id });
    }

    return successResponse(res, `Tagihan berhasil dibuat. ${siswaList.length} tagihan telah disebarkan ke siswa.`, result, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Ambil semua tagihan
 * GET /api/v1/tagihan
 * Semua role yang terautentikasi bisa mengakses
 */
const getAll = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [tagihan, total] = await Promise.all([
      prisma.tagihan.findMany({
        where: { sekolah_id: req.user.sekolah_id },
        skip,
        take: parseInt(limit),
        orderBy: { created_at: 'desc' },
        include: {
          admin: {
            select: {
              id: true,
              nama_lengkap: true,
            },
          },
          _count: {
            select: { pembayaran: true },
          },
        },
      }),
      prisma.tagihan.count({
        where: { sekolah_id: req.user.sekolah_id }
      }),
    ]);

    return successResponse(res, 'Daftar tagihan berhasil diambil.', {
      tagihan,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        total_pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Ambil detail tagihan berdasarkan ID
 * GET /api/v1/tagihan/:id
 */
const getById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const tagihan = await prisma.tagihan.findFirst({
      where: { 
        id,
        sekolah_id: req.user.sekolah_id 
      },
      include: {
        admin: {
          select: {
            id: true,
            nama_lengkap: true,
            email: true,
          },
        },
        pembayaran: {
          include: {
            siswa: {
              select: {
                id: true,
                nama_siswa: true,
                nisn: true,
                kelas: true,
              },
            },
          },
        },
      },
    });

    if (!tagihan) {
      return errorResponse(res, 'Tagihan tidak ditemukan.', 404);
    }

    return successResponse(res, 'Detail tagihan berhasil diambil.', tagihan);
  } catch (error) {
    next(error);
  }
};

/**
 * Ambil daftar tagihan milik siswa tertentu
 * GET /api/v1/tagihan/siswa/:siswaId
 * Untuk role ORANG_TUA — melihat tagihan anak mereka
 */
const getBySiswaId = async (req, res, next) => {
  try {
    const { siswaId } = req.params;

    let targetSiswaId = siswaId;

    // Otomatis mencari atau membuat anak jika menggunakan dummy ID dari UI purwarupa
    if (siswaId === 'dummy-siswa-id' && req.user.role === 'ORANG_TUA') {
      const anakList = await prisma.siswa.findMany({
        where: { orang_tua_id: req.user.id },
        take: 1
      });
      if (anakList.length > 0) {
        targetSiswaId = anakList[0].id;
      } else {
        // Buat anak bohongan agar UI tidak error 404
        const newAnak = await prisma.siswa.create({
          data: {
            nama_siswa: 'Anak Demo',
            nisn: '1234567890',
            kelas: '10A',
            orang_tua_id: req.user.id,
            sekolah_id: req.user.sekolah_id,
          }
        });
        targetSiswaId = newAnak.id;
      }
    }

    // Pastikan siswa ada
    const siswa = await prisma.siswa.findUnique({
      where: { id: targetSiswaId },
      select: {
        id: true,
        nama_siswa: true,
        nisn: true,
        kelas: true,
        orang_tua_id: true,
      },
    });

    if (!siswa) {
      return errorResponse(res, 'Siswa tidak ditemukan.', 404);
    }


    // Jika role ORANG_TUA, pastikan siswa ini adalah anaknya
    if (req.user.role === 'ORANG_TUA' && siswa.orang_tua_id !== req.user.id) {
      return errorResponse(
        res,
        'Anda tidak memiliki akses ke data siswa ini.',
        403
      );
    }

    // Ambil semua tagihan beserta status pembayaran untuk siswa ini
    const tagihan = await prisma.tagihan.findMany({
      where: { sekolah_id: req.user.sekolah_id },
      orderBy: { created_at: 'desc' },
      include: {
        admin: {
          select: {
            id: true,
            nama_lengkap: true,
          },
        },
        pembayaran: {
          where: { siswa_id: targetSiswaId },
          select: {
            id: true,
            status: true,
            metode_bayar: true,
            tanggal_bayar: true,
          },
        },
      },
    });

    // Enrich: tambahkan status pembayaran per tagihan
    const tagihanWithStatus = tagihan.map((t) => {
      const pembayaran = t.pembayaran[0] || null;
      return {
        ...t,
        status_bayar: pembayaran ? pembayaran.status : 'BELUM_BAYAR',
        pembayaran,
      };
    });

    const summary = {
      total_tagihan: tagihan.length,
      lunas: tagihanWithStatus.filter((t) => t.status_bayar === 'LUNAS').length,
      pending: tagihanWithStatus.filter((t) => t.status_bayar === 'PENDING').length,
      belum_bayar: tagihanWithStatus.filter((t) => t.status_bayar === 'BELUM_BAYAR').length,
    };

    return successResponse(res, 'Daftar tagihan siswa berhasil diambil.', {
      siswa,
      summary,
      tagihan: tagihanWithStatus,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { create, getAll, getById, getBySiswaId };
