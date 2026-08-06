// ============================================
// Controller: Pembayaran
// ============================================

const crypto = require('crypto');
const prisma = require('../config/database');
const { successResponse, errorResponse } = require('../utils/response');
const midtransClient = require('midtrans-client');

/**
 * Inisiasi pembayaran (checkout)
 * POST /api/v1/pembayaran/checkout
 * Untuk role ORANG_TUA — membayar tagihan untuk siswa mereka
 */
const checkout = async (req, res, next) => {
  try {
    const { tagihan_id, siswa_id } = req.body;

    const tagihan = await prisma.tagihan.findUnique({
      where: { id: tagihan_id },
    });
    if (!tagihan) return errorResponse(res, 'Tagihan tidak ditemukan.', 404);

    const siswa = await prisma.siswa.findUnique({
      where: { id: siswa_id },
      select: { id: true, nama_siswa: true, orang_tua_id: true, orang_tua: true },
    });
    if (!siswa) return errorResponse(res, 'Siswa tidak ditemukan.', 404);

    if (req.user.role === 'ORANG_TUA' && siswa.orang_tua_id !== req.user.id) {
      return errorResponse(res, 'Anda tidak dapat membayar tagihan untuk siswa ini.', 403);
    }

    const existingPayment = await prisma.pembayaran.findFirst({
      where: { tagihan_id, siswa_id, status: 'LUNAS' },
    });
    if (existingPayment) return errorResponse(res, 'Tagihan ini sudah lunas.', 409);

    // Ambil Midtrans Key dari Setting DB atau ENV
    const settingServerKey = await prisma.appSetting.findFirst({ where: { key: 'MIDTRANS_SERVER_KEY' } });
    const serverKey = settingServerKey?.value || process.env.MIDTRANS_SERVER_KEY || 'SB-Mid-server-DUMMY123';

    // Inisialisasi Midtrans Snap
    const snap = new midtransClient.Snap({
      isProduction: false,
      serverKey: serverKey
    });

    const pendingPayment = await prisma.pembayaran.findFirst({
      where: { tagihan_id, siswa_id, status: { in: ['PENDING', 'GAGAL'] } },
    });

    let pembayaranId = pendingPayment ? pendingPayment.id : crypto.randomUUID();
    const order_id = `ORDER-${pembayaranId}-${Date.now()}`; // Pastikan order_id unik di Midtrans

    if (pendingPayment) {
      await prisma.pembayaran.update({
        where: { id: pendingPayment.id },
        data: { payment_token: order_id }
      });
    } else {
      await prisma.pembayaran.create({
        data: {
          id: pembayaranId,
          tagihan_id,
          siswa_id,
          status: 'PENDING',
          payment_token: order_id,
        }
      });
    }

    // Buat parameter transaksi Midtrans
    const parameter = {
      transaction_details: {
        order_id: order_id,
        gross_amount: Math.round(tagihan.nominal)
      },
      item_details: [{
        id: tagihan.id,
        price: Math.round(tagihan.nominal),
        quantity: 1,
        name: tagihan.judul
      }],
      customer_details: {
        first_name: siswa.nama_siswa,
        email: siswa.orang_tua?.email || "ortu@ekomite.com"
      }
    };

    const transaction = await snap.createTransaction(parameter);
    const snapToken = transaction.token;

    return successResponse(res, 'Berhasil menginisiasi pembayaran Midtrans', {
      snap_token: snapToken,
      order_id: order_id
    }, 201);
    
  } catch (error) {
    console.error("Midtrans Error:", error);
    next(error);
  }
};

/**
 * Ambil semua pembayaran untuk sekolah admin
 * GET /api/v1/pembayaran
 * Akses: ADMIN_KOMITE, SUPER_ADMIN
 */
const getAllPembayaran = async (req, res, next) => {
  try {
    const { status, bulan, limit = 50, page = 1 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const whereClause = {
      tagihan: { sekolah_id: req.user.sekolah_id }
    };
    if (status && status !== 'Semua') {
      whereClause.status = status;
    }
    const pembayaranList = await prisma.pembayaran.findMany({
      where: whereClause,
      skip,
      take: parseInt(limit),
      include: {
        tagihan: true,
        siswa: true
      },
      orderBy: { created_at: 'desc' }
    });
    const total = await prisma.pembayaran.count({ where: whereClause });
    return successResponse(res, 'Daftar tagihan siswa berhasil diambil', {
      pembayaran: pembayaranList,
      total
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Tandai pembayaran LUNAS (manual/tunai)
 * POST /api/v1/pembayaran/:id/lunas
 * Akses: ADMIN_KOMITE, SUPER_ADMIN
 */
const markLunas = async (req, res, next) => {
  try {
    const { id } = req.params;
    const payment = await prisma.pembayaran.findUnique({ where: { id }, include: { tagihan: true } });
    if (!payment) return errorResponse(res, 'Data tagihan tidak ditemukan', 404);
    if (payment.tagihan.sekolah_id !== req.user.sekolah_id) return errorResponse(res, 'Forbidden', 403);
    const updated = await prisma.pembayaran.update({
      where: { id },
      data: { status: 'LUNAS', tanggal_bayar: new Date(), metode_bayar: 'TUNAI_MANUAL' }
    });
    return successResponse(res, 'Pembayaran berhasil ditandai LUNAS', updated);
  } catch (err) {
    next(err);
  }
};

module.exports = { checkout, getAllPembayaran, markLunas };
