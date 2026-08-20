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

    // Filter tanggal untuk periode saat ini
    let startDate = null;
    let endDate = null;
    if (tahun) {
      const year = parseInt(tahun);
      const month = bulan && bulan !== 'semua' ? parseInt(bulan) : null;
      startDate = month ? new Date(year, month - 1, 1) : new Date(year, 0, 1);
      endDate = month ? new Date(year, month, 0, 23, 59, 59, 999) : new Date(year, 11, 31, 23, 59, 59, 999);
    }

    const wherePembayaranCurrent = {
      status: { in: ['LUNAS', 'DICICIL'] },
      tagihan: { sekolah_id: req.user.sekolah_id }
    };
    const wherePengeluaranCurrent = {
      sekolah_id: req.user.sekolah_id
    };

    if (startDate) {
      wherePembayaranCurrent.tanggal_bayar = { gte: startDate, lte: endDate };
      wherePengeluaranCurrent.tanggal = { gte: startDate, lte: endDate };
    }

    // 1. Ambil data PEMASUKAN periode ini
    const pembayaranLunas = await prisma.pembayaran.findMany({
      where: wherePembayaranCurrent,
      include: {
        tagihan: { select: { id: true, judul: true, nominal: true } },
        siswa: { select: { id: true, nama_siswa: true, kelas: true } },
      },
      orderBy: { tanggal_bayar: 'asc' },
    });

    const totalLunas = await prisma.pembayaran.count({ where: wherePembayaranCurrent });

    const totalPemasukan = pembayaranLunas.reduce((sum, p) => {
      const actualPaid = p.nominal_dibayar > 0 ? p.nominal_dibayar : (p.tagihan.nominal - p.nominal_diskon);
      return sum + Number(actualPaid);
    }, 0);

    const dataPemasukan = pembayaranLunas.map((p) => {
      const actualPaid = p.nominal_dibayar > 0 ? p.nominal_dibayar : (p.tagihan.nominal - p.nominal_diskon);
      return {
        id: p.id,
        tipe: 'PEMASUKAN',
        tanggal: p.tanggal_bayar,
        siswa: p.siswa.nama_siswa,
        kelas: p.siswa.kelas,
        keterangan: p.tagihan.judul + (p.status === 'DICICIL' ? ' (Cicilan)' : ''),
        nominal: Number(actualPaid),
        is_flagged: p.is_flagged || false,
        audit_note: p.audit_note || null
      };
    });

    // 2. Ambil data PENGELUARAN periode ini
    const pengeluaranList = await prisma.pengeluaran.findMany({
      where: wherePengeluaranCurrent,
      orderBy: { tanggal: 'asc' }
    });

    const totalPengeluaran = pengeluaranList.reduce((sum, p) => sum + Number(p.nominal), 0);

    const dataPengeluaran = pengeluaranList.map((p) => ({
      id: p.id,
      tipe: 'PENGELUARAN',
      tanggal: p.tanggal,
      siswa: '-', // Tidak ada siswa
      kelas: '-',
      keterangan: p.keterangan,
      nominal: Number(p.nominal),
      is_flagged: p.is_flagged || false,
      audit_note: p.audit_note || null
    }));

    // 3. Hitung SALDO AWAL (sebelum startDate)
    let saldoAwal = 0;
    if (startDate) {
      const wherePembayaranPast = {
        status: { in: ['LUNAS', 'DICICIL'] },
        tagihan: { sekolah_id: req.user.sekolah_id },
        tanggal_bayar: { lt: startDate }
      };
      const wherePengeluaranPast = {
        sekolah_id: req.user.sekolah_id,
        tanggal: { lt: startDate }
      };

      const pastPembayaran = await prisma.pembayaran.findMany({
        where: wherePembayaranPast,
        include: { tagihan: { select: { nominal: true } } }
      });
      const sumPastPembayaran = pastPembayaran.reduce((sum, p) => sum + (p.nominal_dibayar > 0 ? p.nominal_dibayar : p.tagihan.nominal - p.nominal_diskon), 0);

      const pastPengeluaran = await prisma.pengeluaran.aggregate({
        where: wherePengeluaranPast,
        _sum: { nominal: true }
      });
      const sumPastPengeluaran = pastPengeluaran._sum.nominal || 0;

      saldoAwal = sumPastPembayaran - sumPastPengeluaran;
    }

    // 4. Gabungkan dan urutkan Ascending untuk menghitung Saldo Berjalan
    let arusKas = [...dataPemasukan, ...dataPengeluaran].sort((a, b) => new Date(a.tanggal) - new Date(b.tanggal));

    let runningBalance = saldoAwal;
    arusKas = arusKas.map((item) => {
      if (item.tipe === 'PEMASUKAN') {
        runningBalance += item.nominal;
      } else {
        runningBalance -= item.nominal;
      }
      return {
        ...item,
        saldo_berjalan: runningBalance
      };
    });

    // Urutkan kembali ke descending agar yg terbaru di atas
    arusKas.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));

    // 5. Statistik
    const totalSemuaTagihan = await prisma.tagihan.count({
      where: { sekolah_id: req.user.sekolah_id }
    });
    const totalSemuaPembayaran = await prisma.pembayaran.count({
      where: { tagihan: { sekolah_id: req.user.sekolah_id } }
    });

    // 6. Ringkasan Pertumbuhan (Sederhana)
    const sisaKas = totalPemasukan - totalPengeluaran;
    let pertumbuhan = 0;
    
    if(startDate) {
      const firstDayPrevMonth = new Date(startDate.getFullYear(), startDate.getMonth() - 1, 1);
      const lastDayPrevMonth = new Date(startDate.getFullYear(), startDate.getMonth(), 0, 23, 59, 59, 999);
      
      const prevIn = await prisma.pembayaran.findMany({
        where: {
          status: { in: ['LUNAS', 'DICICIL'] },
          tagihan: { sekolah_id: req.user.sekolah_id },
          tanggal_bayar: { gte: firstDayPrevMonth, lte: lastDayPrevMonth }
        },
        include: { tagihan: { select: { nominal: true } } }
      });
      const sumPrevIn = prevIn.reduce((sum, p) => sum + (p.nominal_dibayar > 0 ? p.nominal_dibayar : p.tagihan.nominal - p.nominal_diskon), 0);
      
      const prevOut = await prisma.pengeluaran.aggregate({
        where: { sekolah_id: req.user.sekolah_id, tanggal: { gte: firstDayPrevMonth, lte: lastDayPrevMonth } },
        _sum: { nominal: true }
      });
      const sumPrevOut = prevOut._sum.nominal || 0;
      
      const prevSaldo = sumPrevIn - sumPrevOut;
      if (prevSaldo > 0) {
        pertumbuhan = ((sisaKas - prevSaldo) / prevSaldo) * 100;
      } else if (prevSaldo < 0 && sisaKas > 0) {
        pertumbuhan = 100;
      }
    }

    return successResponse(res, 'Laporan keuangan berhasil diambil.', {
      total_pemasukan: totalPemasukan,
      total_pengeluaran: totalPengeluaran,
      saldo_awal: saldoAwal,
      sisa_kas: sisaKas,
      pertumbuhan_persen: pertumbuhan.toFixed(1),
      total_pemasukan_formatted: `Rp ${totalPemasukan.toLocaleString('id-ID')}`,
      jumlah_transaksi_lunas: totalLunas,
      filter: {
        bulan: bulan || 'semua',
        tahun: tahun || 'semua',
      },
      statistik: {
        total_tagihan_dibuat: totalSemuaTagihan,
        total_pembayaran: totalSemuaPembayaran,
        total_lunas: totalLunas,
        persentase_lunas: totalSemuaPembayaran > 0
          ? `${((totalLunas / totalSemuaPembayaran) * 100).toFixed(1)}%`
          : '0%',
      },
      detail_transaksi: arusKas
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

/**
 * Tambah Catatan Audit pada Transaksi (Pemasukan/Pengeluaran)
 * POST /api/v1/laporan/audit/:tipe/:id
 * Akses: SUPER_ADMIN, ADMIN_KOMITE, SEKOLAH
 */
const addAuditNote = async (req, res, next) => {
  try {
    const { tipe, id } = req.params;
    const { audit_note, is_flagged } = req.body;

    if (tipe === 'pemasukan') {
      const updated = await prisma.pembayaran.update({
        where: { id },
        data: { audit_note, is_flagged }
      });
      return successResponse(res, 'Catatan audit pemasukan disimpan.', updated);
    } else if (tipe === 'pengeluaran') {
      const updated = await prisma.pengeluaran.update({
        where: { id },
        data: { audit_note, is_flagged }
      });
      return successResponse(res, 'Catatan audit pengeluaran disimpan.', updated);
    } else {
      return res.status(400).json({ success: false, message: 'Tipe transaksi tidak valid.' });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = { getKeuangan, getTransparansi, addAuditNote };
