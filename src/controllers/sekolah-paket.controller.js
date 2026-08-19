// ============================================
// Controller: Sekolah Paket (SaaS Subscription)
// ============================================

const prisma = require('../config/database');
const { successResponse, errorResponse } = require('../utils/response');
const { writeLog } = require('../utils/auditLog');
const midtransClient = require('midtrans-client');

/**
 * GET /api/v1/sekolah/paket
 * Mendapatkan daftar paket SaaS yang aktif
 */
const getAvailablePaket = async (req, res, next) => {
  try {
    const paket = await prisma.paketSaaS.findMany({
      where: { status: 'AKTIF' },
      orderBy: { harga: 'asc' }
    });
    
    // Ambil info langganan sekolah saat ini
    const sekolah = await prisma.sekolah.findUnique({
      where: { id: req.user.sekolah_id },
      include: {
        paket: true
      }
    });

    return successResponse(res, 'Berhasil mengambil daftar paket SaaS', {
      tersedia: paket,
      langganan_saat_ini: sekolah?.paket || null,
      status_sekolah: sekolah?.status || 'NONAKTIF'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/sekolah/paket/checkout
 * Checkout pembelian paket SaaS menggunakan Midtrans Snap
 */
const checkoutPaket = async (req, res, next) => {
  try {
    const { paket_id } = req.body;
    
    if (!paket_id) {
      return errorResponse(res, 'ID paket wajib diisi', 400);
    }

    const paket = await prisma.paketSaaS.findUnique({
      where: { id: paket_id }
    });

    if (!paket || paket.status !== 'AKTIF') {
      return errorResponse(res, 'Paket tidak ditemukan atau tidak aktif', 404);
    }

    const sekolah_id = req.user.sekolah_id;
    if (!sekolah_id) {
      return errorResponse(res, 'Akses ditolak. Anda tidak terikat dengan sekolah mana pun.', 403);
    }

    const sekolah = await prisma.sekolah.findUnique({ where: { id: sekolah_id } });

    // Buat record SaaSTransaction
    const transaksi = await prisma.saaSTransaction.create({
      data: {
        sekolah_id,
        paket_id,
        nominal: paket.harga,
        status: 'PENDING'
      }
    });

    // Generate Order ID
    const order_id = `SAAS-${transaksi.id}`;

    // Ambil Midtrans Key dari DB atau ENV
    const settingServerKey = await prisma.appSetting.findFirst({ where: { key: 'midtrans_server_key' } });
    const serverKey = settingServerKey?.value || process.env.MIDTRANS_SERVER_KEY || 'SB-Mid-server-DUMMY123';
    const settingIsProd = await prisma.appSetting.findFirst({ where: { key: 'midtrans_is_production' } });
    const isProductionKey = settingIsProd?.value === 'true';

    // Inisialisasi Midtrans Snap
    const snap = new midtransClient.Snap({
      isProduction: isProductionKey,
      serverKey: serverKey
    });

    const parameter = {
      transaction_details: {
        order_id: order_id,
        gross_amount: Math.round(paket.harga),
      },
      customer_details: {
        first_name: sekolah.nama_sekolah,
        email: req.user.email,
      },
      item_details: [
        {
          id: paket.id,
          price: Math.round(paket.harga),
          quantity: 1,
          name: `Langganan ${paket.nama_paket} (${paket.durasi})`,
        }
      ]
    };

    const transaction = await snap.createTransaction(parameter);

    // Update payment_token
    await prisma.saaSTransaction.update({
      where: { id: transaksi.id },
      data: { payment_token: transaction.token }
    });

    writeLog({
      action: 'SAAS_CHECKOUT',
      detail: `Mulai checkout paket ${paket.nama_paket} seharga ${paket.harga}`,
      userId: req.user.id,
      sekolahId: sekolah_id
    });

    return successResponse(res, 'Berhasil membuat transaksi checkout', {
      snapToken: transaction.token,
      redirectUrl: transaction.redirect_url
    }, 201);

  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/sekolah/paket/riwayat
 * Mendapatkan riwayat transaksi SaaS sekolah ini
 */
const getRiwayatTransaksi = async (req, res, next) => {
  try {
    const transaksi = await prisma.saaSTransaction.findMany({
      where: { sekolah_id: req.user.sekolah_id },
      orderBy: { tanggal: 'desc' },
      include: {
        paket: true
      }
    });
    
    return successResponse(res, 'Berhasil mengambil riwayat transaksi', transaksi);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAvailablePaket,
  checkoutPaket,
  getRiwayatTransaksi
};
