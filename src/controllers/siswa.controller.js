const prisma = require('../config/database');
const bcrypt = require('bcryptjs');
const { successResponse, errorResponse } = require('../utils/response');
const { writeLog } = require('../utils/auditLog');
const cloudinary = require('../config/cloudinary');

/**
 * Helper: Upload buffer (dari multer memoryStorage) ke Cloudinary
 * @returns {Promise<string>} Secure URL dari Cloudinary
 */
const uploadToCloudinary = (buffer, mimetype) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'ekomite/profil', resource_type: 'image' },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });
};

/**
 * Helper function to generate default password for Orang Tua
 */
const generateDefaultPassword = (phoneOrEmail) => {
  // Misalnya password default adalah nomor telp atau email yang dibersihkan
  return 'orangtua1234'; 
};

/**
 * POST /api/v1/siswa
 * Tambah siswa baru & auto-generate akun orang tua
 */
const create = async (req, res, next) => {
  try {
    const { nama_siswa, nisn, kelas, nama_orang_tua, email_orang_tua, whatsapp_orang_tua } = req.body;
    const sekolah_id = req.user.sekolah_id;

    // Upload foto ke Cloudinary jika ada (buffer dari memoryStorage)
    let fotoUrl = null;
    if (req.file && req.file.buffer) {
      try {
        fotoUrl = await uploadToCloudinary(req.file.buffer, req.file.mimetype);
      } catch (uploadErr) {
        console.error('Cloudinary upload error:', uploadErr);
        // Tidak gagalkan seluruh request hanya karena foto gagal upload
      }
    }

    // Cek limitasi paket
    const sekolah = await prisma.sekolah.findUnique({
      where: { id: sekolah_id },
      include: { 
        _count: { select: { siswa: true } },
        paket: true
      }
    });
    
    if (sekolah && sekolah.paket) {
      const paketName = sekolah.paket.nama_paket;
      const currentCount = sekolah._count.siswa;
      const limit = sekolah.paket.batas_siswa;

      if (limit !== 999999 && currentCount >= limit) {
        return errorResponse(res, `Batas maksimal siswa untuk paket ${paketName} telah tercapai (${limit} siswa). Silakan upgrade paket Anda.`, 403);
      }
    }

    // 1. Cek apakah NISN sudah terdaftar di sistem
    const existingSiswa = await prisma.siswa.findUnique({
      where: { nisn },
    });
    
    if (existingSiswa) {
      return errorResponse(res, 'Siswa dengan NISN tersebut sudah terdaftar.', 400);
    }

    // Gunakan Prisma Transaction agar Siswa & OrangTua konsisten
    const result = await prisma.$transaction(async (tx) => {
      // 2. Cari atau Buat Akun Orang Tua
      let orangTua = null;

      if (email_orang_tua) {
        orangTua = await tx.user.findUnique({
          where: { email: email_orang_tua },
        });
      }

      if (!orangTua) {
        // Buat akun orang tua baru
        const defaultPassword = generateDefaultPassword();
        const hashedPassword = await bcrypt.hash(defaultPassword, 10);

        // Jika email kosong, generate email dummy dari nama untuk keperluan login
        // Di sistem ideal, no_wa bisa jadi unique identifier, namun schema saat ini menggunakan email sebagai unique constraint.
        const safeEmail = email_orang_tua || `ortu.${nisn}@ekomite.com`;

        // Check again if safeEmail exists (edge case)
        const checkEmail = await tx.user.findUnique({ where: { email: safeEmail } });
        if (checkEmail) {
           throw new Error('Email orang tua sudah digunakan oleh user lain.');
        }

        orangTua = await tx.user.create({
          data: {
            nama_lengkap: nama_orang_tua,
            email: safeEmail,
            password_hash: hashedPassword,
            role: 'ORANG_TUA',
            sekolah_id: sekolah_id,
            ...(fotoUrl && { foto_profil: fotoUrl }),
            ...(whatsapp_orang_tua && { no_whatsapp: whatsapp_orang_tua }),
          },
        });
      }

      // 3. Buat Data Siswa
      const newSiswa = await tx.siswa.create({
        data: {
          nama_siswa,
          nisn,
          kelas,
          orang_tua_id: orangTua.id,
          sekolah_id,
        },
        include: {
          orang_tua: {
            select: {
              nama_lengkap: true,
              email: true,
            }
          }
        }
      });

      return newSiswa;
    });

    // Audit Log
    writeLog({
      action: 'CREATE_SISWA',
      detail: `Menambahkan siswa: ${nama_siswa} (NISN: ${nisn}, Kelas: ${kelas})`,
      userId: req.user.id,
      sekolahId: sekolah_id,
    });

    return successResponse(res, 'Siswa berhasil ditambahkan.', result, 201);
  } catch (error) {
    if (error.message === 'Email orang tua sudah digunakan oleh user lain.') {
      return errorResponse(res, error.message, 400);
    }
    next(error);
  }
};

/**
 * GET /api/v1/siswa
 * Ambil daftar siswa untuk sekolah admin yang sedang login
 */
const getAll = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = '', kelas = '', sortBy = 'created_at', sortOrder = 'desc' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sekolah_id = req.user.sekolah_id;

    const whereClause = {
      sekolah_id,
      ...(kelas && { kelas }),
      ...(search && {
        OR: [
          { nama_siswa: { contains: search, mode: 'insensitive' } },
          { nisn: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const validSortFields = ['nama_siswa', 'kelas', 'created_at'];
    const actualSortBy = validSortFields.includes(sortBy) ? sortBy : 'created_at';
    const actualSortOrder = sortOrder === 'asc' ? 'asc' : 'desc';

    const [siswa, total] = await Promise.all([
      prisma.siswa.findMany({
        where: whereClause,
        skip,
        take: parseInt(limit),
        orderBy: { [actualSortBy]: actualSortOrder },
        include: {
          orang_tua: {
            select: {
              nama_lengkap: true,
              email: true,
            },
          },
        },
      }),
      prisma.siswa.count({ where: whereClause }),
    ]);

    return successResponse(res, 'Berhasil mengambil daftar siswa.', {
      data: siswa,
      meta: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/siswa/:id/reset-password
 * Reset password orang tua siswa ke default
 */
const resetPassword = async (req, res, next) => {
  try {
    const { id } = req.params;
    const sekolah_id = req.user.sekolah_id;

    // Pastikan siswa ada & milik sekolah admin
    const siswa = await prisma.siswa.findFirst({
      where: { id, sekolah_id },
      include: { orang_tua: true }
    });

    if (!siswa) {
      return errorResponse(res, 'Data siswa tidak ditemukan.', 404);
    }

    if (!siswa.orang_tua) {
      return errorResponse(res, 'Siswa ini belum memiliki data orang tua.', 400);
    }

    // Reset password ke default
    const defaultPassword = generateDefaultPassword();
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    await prisma.user.update({
      where: { id: siswa.orang_tua_id },
      data: { password_hash: hashedPassword }
    });

    return successResponse(res, 'Password orang tua berhasil direset ke default.');
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/v1/siswa/:id
 */
const remove = async (req, res, next) => {
  try {
    const { id } = req.params;
    const sekolah_id = req.user.sekolah_id;

    // Pastikan siswa ada & milik sekolah admin
    const siswa = await prisma.siswa.findFirst({
      where: { id, sekolah_id },
    });

    if (!siswa) {
      return errorResponse(res, 'Data siswa tidak ditemukan.', 404);
    }

    await prisma.siswa.delete({
      where: { id },
    });

    // Audit Log
    writeLog({
      action: 'DELETE_SISWA',
      detail: `Menghapus siswa: ${siswa.nama_siswa} (NISN: ${siswa.nisn})`,
      userId: req.user.id,
      sekolahId: sekolah_id,
    });

    return successResponse(res, 'Siswa berhasil dihapus.');
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/siswa/bulk
 * Tambah banyak siswa dari Excel
 */
const bulkCreate = async (req, res, next) => {
  try {
    const { data } = req.body;
    const sekolah_id = req.user.sekolah_id;

    if (!Array.isArray(data) || data.length === 0) {
      return errorResponse(res, 'Data tidak valid atau kosong.', 400);
    }

    // Cek limitasi paket
    const sekolah = await prisma.sekolah.findUnique({
      where: { id: sekolah_id },
      include: { 
        _count: { select: { siswa: true } },
        paket: true
      }
    });
    
    if (sekolah && sekolah.paket) {
      const paketName = sekolah.paket.nama_paket;
      const currentCount = sekolah._count.siswa;
      const limit = sekolah.paket.batas_siswa;

      if (limit !== 999999 && (currentCount + data.length) > limit) {
        return errorResponse(res, `Gagal import: Batas maksimal siswa untuk paket ${paketName} adalah ${limit} siswa. (Saat ini: ${currentCount}, Anda mencoba menambah: ${data.length}). Silakan upgrade paket.`, 403);
      }
    }

    let successCount = 0;
    let failedCount = 0;
    let errors = [];

    for (const [index, row] of data.entries()) {
      const { nama_siswa, nisn, kelas, nama_orang_tua, email_orang_tua, whatsapp_orang_tua } = row;
      
      try {
        if (!nama_siswa || !nisn || !kelas || !nama_orang_tua) {
           throw new Error('Data wajib tidak lengkap.');
        }

        const existingSiswa = await prisma.siswa.findUnique({ where: { nisn: nisn.toString() } });
        if (existingSiswa) {
           throw new Error('NISN sudah terdaftar.');
        }

        await prisma.$transaction(async (tx) => {
          let orangTua = null;

          if (email_orang_tua) {
            orangTua = await tx.user.findUnique({ where: { email: email_orang_tua } });
          }

          if (!orangTua) {
            const defaultPassword = generateDefaultPassword();
            const hashedPassword = await bcrypt.hash(defaultPassword, 10);
            const safeEmail = email_orang_tua || `ortu.${nisn}@ekomite.com`;

            const checkEmail = await tx.user.findUnique({ where: { email: safeEmail } });
            if (checkEmail) {
               throw new Error('Email orang tua sudah digunakan.');
            }

            orangTua = await tx.user.create({
              data: {
                nama_lengkap: nama_orang_tua,
                email: safeEmail,
                password_hash: hashedPassword,
                role: 'ORANG_TUA',
                sekolah_id: sekolah_id,
              },
            });
          }

          await tx.siswa.create({
            data: {
              nama_siswa,
              nisn: nisn.toString(),
              kelas: kelas.toString(),
              orang_tua_id: orangTua.id,
              sekolah_id,
            }
          });
        });

        successCount++;
      } catch (err) {
        failedCount++;
        errors.push(`Baris ${index + 2} (${nama_siswa || 'Unknown'}): ${err.message}`);
      }
    }

    // Audit Log
    writeLog({
      action: 'BULK_UPLOAD_SISWA',
      detail: `Upload massal siswa: ${successCount} berhasil, ${failedCount} gagal`,
      userId: req.user.id,
      sekolahId: req.user.sekolah_id,
    });

    return successResponse(res, `Upload selesai. ${successCount} sukses, ${failedCount} gagal.`, {
      successCount,
      failedCount,
      errors
    }, 201);

  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/v1/siswa/:id
 * Update data siswa
 */
const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nama_siswa, nisn, kelas, nama_orang_tua, email_orang_tua, whatsapp_orang_tua } = req.body;
    const sekolah_id = req.user.sekolah_id;

    // Upload foto ke Cloudinary jika ada (buffer dari memoryStorage)
    let fotoUrl = null;
    if (req.file && req.file.buffer) {
      try {
        fotoUrl = await uploadToCloudinary(req.file.buffer, req.file.mimetype);
      } catch (uploadErr) {
        console.error('Cloudinary upload error:', uploadErr);
        // Tidak gagalkan seluruh request hanya karena foto gagal upload
      }
    }

    // Cek keberadaan siswa & hak akses
    const siswa = await prisma.siswa.findFirst({
      where: { id, sekolah_id }
    });

    if (!siswa) {
      return errorResponse(res, 'Siswa tidak ditemukan.', 404);
    }

    const updatedSiswa = await prisma.$transaction(async (tx) => {
      // Update orang tua
      // PENTING: email hanya diupdate jika nilainya tidak kosong, untuk menghindari unique constraint error
      const emailUpdate = email_orang_tua && email_orang_tua.trim() !== '' ? { email: email_orang_tua.trim() } : {};

      if (nama_orang_tua || whatsapp_orang_tua || fotoUrl || Object.keys(emailUpdate).length > 0) {
        await tx.user.update({
          where: { id: siswa.orang_tua_id },
          data: {
            ...(nama_orang_tua && { nama_lengkap: nama_orang_tua }),
            ...emailUpdate,
            ...(whatsapp_orang_tua && { no_whatsapp: whatsapp_orang_tua }),
            ...(fotoUrl && { foto_profil: fotoUrl })
          }
        });
      }

      // Update siswa
      return await tx.siswa.update({
        where: { id },
        data: {
          ...(nama_siswa && { nama_siswa }),
          ...(nisn && { nisn: nisn.toString() }),
          ...(kelas && { kelas: kelas.toString() })
        }
      });
    });

    return successResponse(res, 'Data siswa berhasil diperbarui.', updatedSiswa);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/siswa/anakku
 * Ambil daftar anak untuk orang tua yang login
 */
const getAnakku = async (req, res, next) => {
  try {
    const orang_tua_id = req.user.id;

    const anakList = await prisma.siswa.findMany({
      where: { orang_tua_id },
      select: {
        id: true,
        nama_siswa: true,
        nisn: true,
        kelas: true
      }
    });

    return successResponse(res, 'Berhasil mengambil daftar anak', anakList);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  create,
  getAll,
  resetPassword,
  remove,
  bulkCreate,
  update,
  getAnakku
};
