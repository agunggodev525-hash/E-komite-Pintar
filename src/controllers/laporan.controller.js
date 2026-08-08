// ============================================
// Controller: Laporan Keuangan
// ============================================

const prisma = require('../config/database');
const { successResponse } = require('../utils/response');

/**
 * Laporan keuangan — total pemasukan dari pembayaran LUNAS
 * GET /api/v1/laporan/keuangan
 * Akses: SUPER_ADMIN, ADMIN_KOMITE, SEKOLAH
 */
const getKeuangan = async (req, res, next) => {
  try {
    const { bulan, tahun } = req.query;

    // Base filter: pembayaran LUNAS atau DICICIL dari sekolah terkait
    const whereClause = {
      status: { in: ['LUNAS', 'DICICIL'] },
      tagihan: { sekolah_id: req.user.sekolah_id }
    };

    // Filter opsional berdasarkan bulan/tahun
    if (tahun) {
      const year = parseInt(tahun);
      const month = bulan ? parseInt(bulan) : null;

      const startDate = month
        ? new Date(year, month - 1, 1)
        : new Date(year, 0, 1);
      const endDate = month
        ? new Date(year, month, 0, 23, 59, 59, 999)
        : new Date(year, 11, 31, 23, 59, 59, 999);

      whereClause.tanggal_bayar = {
        gte: startDate,
        lte: endDate,
      };
    }

    // 1. Hitung jumlah pembayaran lunas
    const totalLunas = await prisma.pembayaran.count({
      where: whereClause,
    });

    // 2. Ambil detail pembayaran lunas dengan nominal tagihan
    const pembayaranLunas = await prisma.pembayaran.findMany({
      where: whereClause,
      include: {
        tagihan: {
          select: {
            id: true,
            judul: true,
            nominal: true,
          },
        },
        siswa: {
          select: {
            id: true,
            nama_siswa: true,
            kelas: true,
          },
        },
      },
      orderBy: { tanggal_bayar: 'desc' },
    });

    const transaksiList = pembayaranLunas.map((p) => {
      const actualPaid = p.nominal_dibayar > 0 ? p.nominal_dibayar : (p.tagihan.nominal - p.nominal_diskon);
      return {
        id: p.id,
        tanggal: p.tanggal_bayar,
        siswa: p.siswa.nama_siswa,
        kelas: p.siswa.kelas,
        keterangan: p.tagihan.judul + (p.status === 'DICICIL' ? ' (Cicilan)' : ''),
        nominal: Number(actualPaid),
      };
    });

    // 3. Hitung total pemasukan dari nominal yang benar-benar dibayar
    const totalPemasukan = pembayaranLunas.reduce((sum, p) => {
      const actualPaid = p.nominal_dibayar > 0 ? p.nominal_dibayar : (p.tagihan.nominal - p.nominal_diskon);
      return sum + Number(actualPaid);
    }, 0);

    // 4. Ringkasan per tagihan
    const perTagihan = {};
    pembayaranLunas.forEach((p) => {
      const key = p.tagihan.id;
      if (!perTagihan[key]) {
        perTagihan[key] = {
          tagihan_id: p.tagihan.id,
          judul: p.tagihan.judul,
          nominal_per_siswa: Number(p.tagihan.nominal),
          jumlah_lunas: 0,
          subtotal: 0,
        };
      }
      const actualPaid = p.nominal_dibayar > 0 ? p.nominal_dibayar : (p.tagihan.nominal - p.nominal_diskon);
      if (p.status === 'LUNAS') {
        perTagihan[key].jumlah_lunas += 1;
      }
      perTagihan[key].subtotal += Number(actualPaid);
    });

    // 5. Hitung total tagihan dan berapa persen sudah lunas
    const totalSemuaTagihan = await prisma.tagihan.count({
      where: { sekolah_id: req.user.sekolah_id }
    });
    const totalSemuaPembayaran = await prisma.pembayaran.count({
      where: { tagihan: { sekolah_id: req.user.sekolah_id } }
    });

    // 6. Hitung Total Pengeluaran pada periode yang sama
    const wherePengeluaran = {
      sekolah_id: req.user.sekolah_id
    };
    
    if (tahun) {
      wherePengeluaran.tanggal = whereClause.tanggal_bayar; // reuse the same date filter
    }

    const pengeluaranList = await prisma.pengeluaran.findMany({
      where: wherePengeluaran
    });

    const totalPengeluaran = pengeluaranList.reduce((sum, p) => sum + Number(p.nominal), 0);
    const sisaKas = totalPemasukan - totalPengeluaran;

    return successResponse(res, 'Laporan keuangan berhasil diambil.', {
      total_pemasukan: totalPemasukan,
      total_pengeluaran: totalPengeluaran,
      sisa_kas: sisaKas,
      total_pemasukan_formatted: `Rp ${totalPemasukan.toLocaleString('id-ID')}`,
      jumlah_transaksi_lunas: totalLunas,
      filter: {
        bulan: bulan || 'semua',
        tahun: tahun || 'semua',
      },
      ringkasan_per_tagihan: Object.values(perTagihan),
      statistik: {
        total_tagihan_dibuat: totalSemuaTagihan,
        total_pembayaran: totalSemuaPembayaran,
        total_lunas: totalLunas,
        persentase_lunas: totalSemuaPembayaran > 0
          ? `${((totalLunas / totalSemuaPembayaran) * 100).toFixed(1)}%`
          : '0%',
      },
      detail_transaksi: transaksiList
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Laporan Transparansi — Total Pemasukan vs Pengeluaran (Saldo)
 * GET /api/v1/laporan/transparansi
 * Akses: SUPER_ADMIN, ADMIN_KOMITE, SEKOLAH, ORANG_TUA
 */
const getTransparansi = async (req, res, next) => {
  try {
    const sekolah_id = req.user.sekolah_id;
    const { bulan, tahun } = req.query;

    const wherePembayaran = { status: { in: ['LUNAS', 'DICICIL'] }, tagihan: { sekolah_id } };
    const wherePengeluaran = { sekolah_id };

    if (tahun) {
      const year = parseInt(tahun);
      const month = bulan ? parseInt(bulan) : null;
      const startDate = month ? new Date(year, month - 1, 1) : new Date(year, 0, 1);
      const endDate = month ? new Date(year, month, 0, 23, 59, 59, 999) : new Date(year, 11, 31, 23, 59, 59, 999);

      wherePembayaran.tanggal_bayar = { gte: startDate, lte: endDate };
      wherePengeluaran.tanggal = { gte: startDate, lte: endDate };
    }

    // 1. Ambil semua pembayaran lunas dan cicilan (Pemasukan)
    const pemasukan = await prisma.pembayaran.findMany({
      where: wherePembayaran,
      include: { tagihan: { select: { judul: true, nominal: true } } },
      orderBy: { tanggal_bayar: 'asc' },
    });

    const totalPemasukan = pemasukan.reduce((sum, p) => {
      const actualPaid = p.nominal_dibayar > 0 ? p.nominal_dibayar : (p.tagihan.nominal - p.nominal_diskon);
      return sum + Number(actualPaid);
    }, 0);
    
    const detailPemasukan = pemasukan.map(p => {
      const actualPaid = p.nominal_dibayar > 0 ? p.nominal_dibayar : (p.tagihan.nominal - p.nominal_diskon);
      return {
        id: p.id,
        jenis: 'PEMASUKAN',
        tanggal: p.tanggal_bayar,
        keterangan: `Pembayaran: ${p.tagihan.judul}` + (p.status === 'DICICIL' ? ' (Cicilan)' : ''),
        nominal: Number(actualPaid)
      };
    });

    // 2. Ambil semua pengeluaran
    const pengeluaran = await prisma.pengeluaran.findMany({
      where: wherePengeluaran,
      orderBy: { tanggal: 'asc' },
    });

    const totalPengeluaran = pengeluaran.reduce((sum, p) => sum + Number(p.nominal), 0);
    const detailPengeluaran = pengeluaran.map(p => ({
      id: p.id,
      jenis: 'PENGELUARAN',
      tanggal: p.tanggal,
      keterangan: p.keterangan,
      nominal: Number(p.nominal)
    }));

    // 3. Gabungkan history dan hitung saldo
    const history = [...detailPemasukan, ...detailPengeluaran].sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal)); // Descending

    const saldo = totalPemasukan - totalPengeluaran;

    return successResponse(res, 'Laporan transparansi berhasil diambil.', {
      total_pemasukan: totalPemasukan,
      total_pengeluaran: totalPengeluaran,
      saldo_akhir: saldo,
      history,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getKeuangan, getTransparansi };
