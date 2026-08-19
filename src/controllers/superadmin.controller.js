// ============================================
// Controller: Super Admin Analytics
// ============================================

const prisma = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { successResponse, errorResponse } = require('../utils/response');
const { writeLog } = require('../utils/auditLog');

/**
 * Get SaaS Analytics
 * GET /api/v1/superadmin/analytics
 * Hanya dapat diakses oleh role SUPER_ADMIN
 */
const getAnalytics = async (req, res, next) => {
  try {
    // 1. Total Klien Aktif (Sekolah)
    const totalKlien = await prisma.sekolah.count({
      where: { status: 'AKTIF' },
    });

    // 2. Total Pengguna Keseluruhan (Admin + Orang Tua)
    const totalPengguna = await prisma.user.count({
      where: { role: { in: ['ADMIN_KOMITE', 'ORANG_TUA'] } }
    });

    // 3. Estimasi Transaksi (Bulan Ini)
    // Filter transaksi yang LUNAS pada bulan berjalan
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    // Kita hitung manual karena nominal ada di tabel tagihan
    const lunasPayments = await prisma.pembayaran.findMany({
      where: {
        status: 'LUNAS',
        tanggal_bayar: {
          gte: startOfMonth
        }
      },
      include: {
        tagihan: {
          select: { nominal: true }
        }
      }
    });

    const estimasiTransaksi = lunasPayments.reduce((acc, pay) => acc + (pay.tagihan?.nominal || 0), 0);

    // 4. Status Sistem
    const statusSistem = "Berjalan Normal";

    return successResponse(res, 'Berhasil mengambil data analitik SaaS', {
      totalKlien,
      totalPengguna,
      estimasiTransaksi,
      statusSistem,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Semua Tenant (Sekolah)
 * GET /api/v1/superadmin/tenants
 */
const getTenants = async (req, res, next) => {
  try {
    const tenants = await prisma.sekolah.findMany({
      orderBy: { created_at: 'desc' },
      include: {
        _count: {
          select: { users: true, siswa: true, tagihan: true }
        },
        users: {
          where: { role: 'ADMIN_KOMITE' },
          select: { id: true, nama_lengkap: true, email: true },
          take: 1
        },
        paket: {
          select: { nama_paket: true, batas_siswa: true }
        }
      }
    });

    return successResponse(res, 'Berhasil mengambil daftar tenant', tenants);
  } catch (error) {
    next(error);
  }
};

/**
 * Create Tenant Baru + Admin Perdana (DB Transaction)
 * POST /api/v1/superadmin/tenants
 */
const createTenant = async (req, res, next) => {
  try {
    const { nama_sekolah, alamat, admin_nama, admin_email, admin_password, paket_berlangganan } = req.body;

    if (!nama_sekolah || !admin_nama || !admin_email || !admin_password) {
      return errorResponse(res, 'Semua field wajib diisi.', 400);
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: admin_email },
    });
    if (existingUser) {
      return errorResponse(res, 'Email admin sudah digunakan.', 400);
    }

    const password_hash = await bcrypt.hash(admin_password, 10);

    // DB Transaction: Create Sekolah & 2 User (Admin & Kepala Sekolah)
    const newTenant = await prisma.$transaction(async (tx) => {
      const sekolah = await tx.sekolah.create({
        data: {
          nama_sekolah,
          alamat,
          paket_id: paket_berlangganan || null,
          paket_berlangganan: 'DYNAMIC',
        }
      });

      // Buat Admin Komite
      await tx.user.create({
        data: {
          nama_lengkap: admin_nama,
          email: admin_email,
          password_hash,
          role: 'ADMIN_KOMITE',
          sekolah_id: sekolah.id
        }
      });

      // Buat Kepala Sekolah Otomatis
      const emailDomain = admin_email.split('@')[1];
      const ksEmail = `kepalasekolah@${emailDomain}`;
      const ksPassword = await bcrypt.hash('Password123!', 10);
      
      const existingKs = await tx.user.findUnique({ where: { email: ksEmail } });
      if (!existingKs) {
        await tx.user.create({
          data: {
            nama_lengkap: `Kepala Sekolah ${nama_sekolah}`,
            email: ksEmail,
            password_hash: ksPassword,
            role: 'SEKOLAH',
            sekolah_id: sekolah.id
          }
        });
      }

      return sekolah;
    });

    // Audit Log
    writeLog({
      action: 'CREATE_TENANT',
      detail: `Membuat sekolah baru: ${nama_sekolah} (Admin: ${admin_email})`,
      userId: req.user.id,
    });

    return successResponse(res, 'Tenant baru dan akun Admin Komite berhasil dibuat.', newTenant, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Toggle Status Tenant (Aktif/Nonaktif)
 * PATCH /api/v1/superadmin/tenants/:id/status
 */
const toggleTenantStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const sekolah = await prisma.sekolah.findUnique({ where: { id } });
    if (!sekolah) {
      return errorResponse(res, 'Tenant tidak ditemukan', 404);
    }

    const newStatus = sekolah.status === 'AKTIF' ? 'NONAKTIF' : 'AKTIF';
    
    const updated = await prisma.sekolah.update({
      where: { id },
      data: { status: newStatus }
    });

    // Audit Log
    writeLog({
      action: 'UPDATE_STATUS',
      detail: `Mengubah status sekolah "${sekolah.nama_sekolah}" menjadi ${newStatus}`,
      userId: req.user.id,
      sekolahId: id,
    });

    return successResponse(res, `Status tenant berhasil diubah menjadi ${newStatus}`, updated);
  } catch (error) {
    next(error);
  }
};


/**
 * Impersonate Tenant (Login as Admin Komite)
 * POST /api/v1/superadmin/tenants/:id/impersonate
 */
const impersonateTenant = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Cari admin komite untuk sekolah ini
    const admin = await prisma.user.findFirst({
      where: { sekolah_id: id, role: 'ADMIN_KOMITE' }
    });

    if (!admin) {
      return errorResponse(res, 'Admin Komite untuk sekolah ini tidak ditemukan', 404);
    }

    // Generate JWT khusus untuk admin ini
    const token = jwt.sign(
      { id: admin.id, role: admin.role, sekolahId: admin.sekolah_id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' } // Token impersonate cukup 1 jam
    );

    // Audit Log
    writeLog({
      action: 'IMPERSONATE',
      detail: `Super Admin masuk sebagai ${admin.nama_lengkap} (${admin.email})`,
      userId: req.user.id,
      sekolahId: id,
    });

    return successResponse(res, 'Impersonate berhasil', {
      token,
      user: {
        id: admin.id,
        nama_lengkap: admin.nama_lengkap,
        email: admin.email,
        role: admin.role,
        sekolah_id: admin.sekolah_id
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reset Password Klien
 * POST /api/v1/superadmin/tenants/:id/reset-password
 */
const resetPasswordTenant = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const admin = await prisma.user.findFirst({
      where: { sekolah_id: id, role: 'ADMIN_KOMITE' }
    });

    if (!admin) {
      return errorResponse(res, 'Admin Komite untuk sekolah ini tidak ditemukan', 404);
    }

    const defaultPassword = 'komite' + '1234';
    const password_hash = await bcrypt.hash(defaultPassword, 10);

    await prisma.user.update({
      where: { id: admin.id },
      data: { password_hash }
    });

    // Audit Log
    writeLog({
      action: 'RESET_PASSWORD',
      detail: `Mereset password admin ${admin.nama_lengkap} (${admin.email}) ke default`,
      userId: req.user.id,
      sekolahId: id,
    });

    return successResponse(res, `Password berhasil direset ke default (${defaultPassword})`, null);
  } catch (error) {
    next(error);
  }
};

/**
 * Get System Logs (Audit Trail)
 * GET /api/v1/superadmin/logs
 */
const getSystemLogs = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      prisma.systemLog.findMany({
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: {
          user: { select: { nama_lengkap: true } },
          sekolah: { select: { nama_sekolah: true } }
        }
      }),
      prisma.systemLog.count()
    ]);

    return successResponse(res, 'Berhasil mengambil log sistem', {
      logs,
      pagination: {
        total,
        page,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get App Settings
 * GET /api/v1/superadmin/settings
 */
const getSettings = async (req, res, next) => {
  try {
    const settings = await prisma.appSetting.findMany();
    // Konversi array of {key, value} menjadi object map
    const map = {};
    settings.forEach(s => map[s.key] = s.value);
    
    return successResponse(res, 'Berhasil mengambil pengaturan sistem', map);
  } catch (error) {
    next(error);
  }
};

/**
 * Update App Settings
 * POST /api/v1/superadmin/settings
 */
const updateSettings = async (req, res, next) => {
  try {
    const data = req.body; // { midtrans_server_key: 'xxx', wa_token: 'yyy' }
    
    // Upsert setiap setting dalam transaksi
    await prisma.$transaction(
      Object.entries(data).map(([key, value]) => {
        return prisma.appSetting.upsert({
          where: { key },
          update: { value: String(value) },
          create: { key, value: String(value) }
        });
      })
    );

    // Audit Log
    writeLog({
      action: 'UPDATE_SETTINGS',
      detail: `Memperbarui pengaturan sistem: ${Object.keys(data).join(', ')}`,
      userId: req.user.id,
    });

    return successResponse(res, 'Pengaturan sistem berhasil disimpan', null);
  } catch (error) {
    next(error);
  }
};

/**
 * Update Tenant (Ubah Paket Berlangganan, dll)
 * PUT /api/v1/superadmin/tenants/:id
 */
const updateTenant = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { paket_berlangganan, nama_sekolah, alamat } = req.body;

    const sekolah = await prisma.sekolah.findUnique({ where: { id } });
    if (!sekolah) {
      return errorResponse(res, 'Tenant tidak ditemukan', 404);
    }

    const updateData = {};
    if (paket_berlangganan) {
      updateData.paket_id = paket_berlangganan;
      updateData.paket_berlangganan = 'DYNAMIC';
    }
    if (nama_sekolah) updateData.nama_sekolah = nama_sekolah;
    if (alamat !== undefined) updateData.alamat = alamat;

    const updated = await prisma.sekolah.update({
      where: { id },
      data: updateData,
    });

    // Audit Log
    writeLog({
      action: 'UPDATE_TENANT',
      detail: `Memperbarui data sekolah "${sekolah.nama_sekolah}"`,
      userId: req.user.id,
      sekolahId: id,
    });

    return successResponse(res, 'Tenant berhasil diperbarui.', updated);
  } catch (error) {
    next(error);
  }
};

/**
 * ==========================================
 * Manajemen Paket SaaS
 * ==========================================
 */

const getPaketList = async (req, res, next) => {
  try {
    const paket = await prisma.paketSaaS.findMany({
      orderBy: { harga: 'asc' }
    });
    return successResponse(res, 'Berhasil mengambil daftar paket', paket);
  } catch (error) {
    next(error);
  }
};

const createPaket = async (req, res, next) => {
  try {
    const { nama_paket, harga, durasi, batas_siswa } = req.body;
    const newPaket = await prisma.paketSaaS.create({
      data: {
        nama_paket,
        harga: Number(harga),
        durasi,
        batas_siswa: Number(batas_siswa) || 999999
      }
    });
    // Audit Log
    writeLog({
      action: 'CREATE_PAKET',
      detail: `Membuat paket baru: ${nama_paket} (Rp ${Number(harga).toLocaleString('id-ID')})`,
      userId: req.user.id,
    });

    return successResponse(res, 'Berhasil membuat paket baru', newPaket, 201);
  } catch (error) {
    if (error.code === 'P2002') {
      return errorResponse(res, 'Nama paket sudah ada', 400);
    }
    next(error);
  }
};

const updatePaket = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nama_paket, harga, durasi, batas_siswa } = req.body;
    const updated = await prisma.paketSaaS.update({
      where: { id },
      data: {
        nama_paket,
        harga: Number(harga),
        durasi,
        batas_siswa: Number(batas_siswa) || 999999
      }
    });
    // Audit Log
    writeLog({
      action: 'UPDATE_PAKET',
      detail: `Memperbarui paket: ${nama_paket}`,
      userId: req.user.id,
    });

    return successResponse(res, 'Berhasil memperbarui paket', updated);
  } catch (error) {
    next(error);
  }
};

const deletePaket = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.paketSaaS.delete({ where: { id } });

    // Audit Log
    writeLog({
      action: 'DELETE_PAKET',
      detail: `Menghapus paket dengan ID: ${id}`,
      userId: req.user.id,
    });

    return successResponse(res, 'Berhasil menghapus paket', null);
  } catch (error) {
    next(error);
  }
};

const togglePaketStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const paket = await prisma.paketSaaS.findUnique({ where: { id } });
    if (!paket) return errorResponse(res, 'Paket tidak ditemukan', 404);
    
    const updated = await prisma.paketSaaS.update({
      where: { id },
      data: { status: paket.status === 'AKTIF' ? 'NONAKTIF' : 'AKTIF' }
    });
    return successResponse(res, 'Berhasil mengubah status paket', updated);
  } catch (error) {
    next(error);
  }
};

const getSaaSTransactions = async (req, res, next) => {
  try {
    const transactions = await prisma.saaSTransaction.findMany({
      orderBy: { tanggal: 'desc' },
      include: {
        sekolah: { select: { nama_sekolah: true } },
        paket: { select: { nama_paket: true } }
      }
    });
    return successResponse(res, 'Berhasil mengambil daftar transaksi SaaS', transactions);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAnalytics,
  getTenants,
  createTenant,
  toggleTenantStatus,
  impersonateTenant,
  resetPasswordTenant,
  updateTenant,
  getSystemLogs,
  getSettings,
  updateSettings,
  getPaketList,
  createPaket,
  updatePaket,
  deletePaket,
  togglePaketStatus,
  getSaaSTransactions
};
