// ============================================
// Controller: Dashboard Utama
// ============================================

const prisma = require('../config/database');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * Mengambil ringkasan data Dashboard Admin Komite
 * GET /api/v1/dashboard/admin
 */
const getAdminDashboard = async (req, res, next) => {
  try {
    const sekolah_id = req.user.sekolah_id;

    // 1. Saldo Kas (Pemasukan LUNAS - Pengeluaran)
    const pemasukanAggregate = await prisma.pembayaran.aggregate({
      where: { 
        tagihan: { sekolah_id },
        status: 'LUNAS' 
      },
      _sum: {
        nominal_dibayar: true
      }
    });

    const pengeluaranAggregate = await prisma.pengeluaran.aggregate({
      where: { sekolah_id },
      _sum: {
        nominal: true
      }
    });

    const totalPemasukan = pemasukanAggregate._sum.nominal_dibayar || 0;
    const totalPengeluaran = pengeluaranAggregate._sum.nominal || 0;
    const saldoKas = totalPemasukan - totalPengeluaran;

    // 2. Total Siswa Menunggak (punya tagihan BELUM_BAYAR atau PENDING yang sudah lewat jatuh tempo, atau sekadar belum bayar)
    // Untuk sederhana: Hitung jumlah siswa unik yang memiliki tagihan dengan status BELUM_BAYAR
    const siswaMenunggak = await prisma.pembayaran.findMany({
      where: {
        tagihan: { sekolah_id },
        status: 'BELUM_BAYAR'
      },
      distinct: ['siswa_id'],
      select: { siswa_id: true }
    });
    const totalMenunggak = siswaMenunggak.length;

    // 3. Dana Cair / Settlement (Total pembayaran via Midtrans dengan status LUNAS)
    // Asumsi: Semua yang masuk via payment_token dan status LUNAS adalah Midtrans
    const midtransAggregate = await prisma.pembayaran.aggregate({
      where: {
        tagihan: { sekolah_id },
        status: 'LUNAS',
        payment_token: { not: null }
      },
      _sum: {
        nominal_dibayar: true
      }
    });
    const danaCair = midtransAggregate._sum.nominal_dibayar || 0;

    // 4. 5 Transaksi Masuk Terakhir
    const recentTransactions = await prisma.pembayaran.findMany({
      where: {
        tagihan: { sekolah_id },
        status: 'LUNAS'
      },
      orderBy: {
        updated_at: 'desc'
      },
      take: 5,
      include: {
        siswa: {
          select: {
            nama_siswa: true,
            kelas: true
          }
        },
        tagihan: {
          select: {
            judul: true
          }
        }
      }
    });

    // Format recent transactions untuk frontend
    const formattedRecent = recentTransactions.map(trx => ({
      id: trx.id,
      siswa: trx.siswa.nama_siswa,
      tagihan: trx.tagihan.judul,
      nominal: trx.nominal_dibayar,
      tanggal: trx.updated_at,
      status: trx.status,
      metode: trx.payment_token ? "Midtrans" : "Tunai / Manual"
    }));

    return successResponse(res, 'Berhasil memuat data dashboard', {
      saldoKas,
      totalMenunggak,
      danaCair,
      recentTransactions: formattedRecent
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdminDashboard
};
