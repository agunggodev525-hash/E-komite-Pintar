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

/**
 * Mengambil data tren arus kas bulanan untuk chart
 * GET /api/v1/dashboard/admin/chart-trend?bulan=2026-08
 */
const getChartTrend = async (req, res, next) => {
  try {
    const sekolah_id = req.user.sekolah_id;
    const bulanParam = req.query.bulan; // format: "2026-08"

    // Parse bulan (default: bulan sekarang)
    let year, month;
    if (bulanParam && /^\d{4}-\d{2}$/.test(bulanParam)) {
      [year, month] = bulanParam.split('-').map(Number);
    } else {
      const now = new Date();
      year = now.getFullYear();
      month = now.getMonth() + 1;
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999); // akhir bulan
    const daysInMonth = new Date(year, month, 0).getDate();

    // Ambil semua pembayaran LUNAS di bulan ini
    const pembayaranList = await prisma.pembayaran.findMany({
      where: {
        tagihan: { sekolah_id },
        status: 'LUNAS',
        updated_at: {
          gte: startDate,
          lte: endDate
        }
      },
      select: {
        nominal_dibayar: true,
        updated_at: true
      }
    });

    // Ambil semua pengeluaran di bulan ini
    const pengeluaranList = await prisma.pengeluaran.findMany({
      where: {
        sekolah_id,
        tanggal: {
          gte: startDate,
          lte: endDate
        }
      },
      select: {
        nominal: true,
        tanggal: true
      }
    });

    // Buat array kumulatif per hari
    const pemasukanPerHari = new Array(daysInMonth).fill(0);
    const pengeluaranPerHari = new Array(daysInMonth).fill(0);

    pembayaranList.forEach(p => {
      const day = new Date(p.updated_at).getDate();
      pemasukanPerHari[day - 1] += p.nominal_dibayar;
    });

    pengeluaranList.forEach(p => {
      const day = new Date(p.tanggal).getDate();
      pengeluaranPerHari[day - 1] += p.nominal;
    });

    // Kumulatif
    const pemasukanKumulatif = [];
    const pengeluaranKumulatif = [];
    let sumPemasukan = 0;
    let sumPengeluaran = 0;

    for (let i = 0; i < daysInMonth; i++) {
      sumPemasukan += pemasukanPerHari[i];
      sumPengeluaran += pengeluaranPerHari[i];
      pemasukanKumulatif.push(sumPemasukan);
      pengeluaranKumulatif.push(sumPengeluaran);
    }

    // Sample 7 titik data: hari 1, 5, 10, 15, 20, 25, dan hari terakhir
    const sampleDays = [1, 5, 10, 15, 20, 25, daysInMonth];
    const chartData = sampleDays.map(day => ({
      day,
      pemasukan: pemasukanKumulatif[day - 1] || 0,
      pengeluaran: pengeluaranKumulatif[day - 1] || 0
    }));

    return successResponse(res, 'Berhasil memuat data tren arus kas', {
      bulan: `${year}-${String(month).padStart(2, '0')}`,
      daysInMonth,
      chartData
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdminDashboard,
  getChartTrend
};
