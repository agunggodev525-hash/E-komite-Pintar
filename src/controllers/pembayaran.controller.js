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
    let { tagihan_id, siswa_id } = req.body;

    const tagihan = await prisma.tagihan.findUnique({
      where: { id: tagihan_id },
    });
    if (!tagihan) return errorResponse(res, 'Tagihan tidak ditemukan.', 404);

    let targetSiswaId = siswa_id;
    if (siswa_id === 'dummy-siswa-id' && req.user.role === 'ORANG_TUA') {
      const anakList = await prisma.siswa.findMany({
        where: { orang_tua_id: req.user.id },
        take: 1
      });
      if (anakList.length > 0) {
        targetSiswaId = anakList[0].id;
      }
    }

    const siswa = await prisma.siswa.findUnique({
      where: { id: targetSiswaId },
      select: { id: true, nama_siswa: true, orang_tua_id: true, orang_tua: true },
    });
    if (!siswa) return errorResponse(res, 'Siswa tidak ditemukan.', 404);

    // Overwrite the siswa_id to the real one for the rest of the function
    siswa_id = targetSiswaId;

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

    // Tentukan mode Production otomatis jika kunci tidak berawalan 'SB-'
    const isProductionKey = !serverKey.startsWith('SB-');

    // Inisialisasi Midtrans Snap
    const snap = new midtransClient.Snap({
      isProduction: isProductionKey,
      serverKey: serverKey
    });

    const pendingPayment = await prisma.pembayaran.findFirst({
      where: { tagihan_id, siswa_id, status: { in: ['PENDING', 'GAGAL'] } },
    });

    let pembayaranId = pendingPayment ? pendingPayment.id : crypto.randomUUID();
    // Midtrans order_id max 50 chars. We use a short slice of UUID to ensure it fits.
    const order_id = `INV-${pembayaranId.substring(0, 8)}-${Date.now()}`; 

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
    // Return explicit error for debugging
    return res.status(500).json({ success: false, message: error.message || error.toString() });
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
 * Pembayaran manual (tunai) atau cicilan
 * POST /api/v1/pembayaran/:id/bayar
 * Akses: ADMIN_KOMITE, SUPER_ADMIN
 */
const bayarManual = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nominal_bayar } = req.body; // nominal yang dibayar saat ini

    const payment = await prisma.pembayaran.findUnique({ where: { id }, include: { tagihan: true } });
    if (!payment) return errorResponse(res, 'Data tagihan tidak ditemukan', 404);
    if (payment.tagihan.sekolah_id !== req.user.sekolah_id) return errorResponse(res, 'Forbidden', 403);

    const bayarSekarang = parseFloat(nominal_bayar || 0);
    const totalDibayar = payment.nominal_dibayar + bayarSekarang;
    const tagihanAkhir = payment.tagihan.nominal - payment.nominal_diskon;

    let status = 'PENDING';
    if (totalDibayar >= tagihanAkhir) {
      status = 'LUNAS';
    } else if (totalDibayar > 0) {
      status = 'DICICIL';
    }

    const updated = await prisma.pembayaran.update({
      where: { id },
      data: {
        nominal_dibayar: totalDibayar,
        status: status,
        tanggal_bayar: new Date(),
        metode_bayar: 'TUNAI_MANUAL'
      }
    });

    return successResponse(res, `Pembayaran berhasil dicatat. Status: ${status}`, updated);
  } catch (err) {
    next(err);
  }
};

/**
 * Set Dispensasi (Diskon/Beasiswa)
 * POST /api/v1/pembayaran/:id/dispensasi
 * Akses: ADMIN_KOMITE, SUPER_ADMIN
 */
const setDispensasi = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nominal_diskon, keterangan } = req.body;

    const payment = await prisma.pembayaran.findUnique({ where: { id }, include: { tagihan: true } });
    if (!payment) return errorResponse(res, 'Data tagihan tidak ditemukan', 404);
    if (payment.tagihan.sekolah_id !== req.user.sekolah_id) return errorResponse(res, 'Forbidden', 403);

    const diskon = parseFloat(nominal_diskon || 0);
    const tagihanAkhir = payment.tagihan.nominal - diskon;

    let status = payment.status;
    if (payment.nominal_dibayar >= tagihanAkhir) {
      status = 'LUNAS';
    }

    const updated = await prisma.pembayaran.update({
      where: { id },
      data: {
        nominal_diskon: diskon,
        status: status
      }
    });

    // Opsional: simpan alasan dispensasi jika ada tabel riwayat atau log, sementara kita biarkan.
    
    return successResponse(res, 'Keringanan biaya berhasil disimpan', updated);
  } catch (err) {
    next(err);
  }
};

/**
 * Kirim Peringatan Massal (WhatsApp Gateway Mock)
 * POST /api/v1/pembayaran/peringatan-massal
 * Akses: ADMIN_KOMITE, SUPER_ADMIN
 */
const kirimPeringatanMassal = async (req, res, next) => {
  try {
    const { pembayaran_ids, pesan } = req.body;
    
    if (!pembayaran_ids || !Array.isArray(pembayaran_ids) || pembayaran_ids.length === 0) {
      return errorResponse(res, 'Daftar ID pembayaran tidak valid', 400);
    }

    const payments = await prisma.pembayaran.findMany({
      where: { 
        id: { in: pembayaran_ids },
        tagihan: { sekolah_id: req.user.sekolah_id }
      },
      include: {
        siswa: {
          include: { orang_tua: true }
        },
        tagihan: true
      }
    });

    // Mock integrasi Notification Service (bisa menggunakan WA Gateway atau Push Notif)
    const { sendPushNotification } = require('../services/notification.service');
    const tokens = [];

    payments.forEach(p => {
      // Mock kirim pesan
      let pesanCustom = pesan.replace('[Nama Siswa]', p.siswa.nama_siswa);
      console.log(`[WA MOCK] To: ${p.siswa.orang_tua?.no_whatsapp || 'No WA'} -> ${pesanCustom}`);
      
      if (p.siswa.orang_tua?.fcm_token) {
        tokens.push(p.siswa.orang_tua.fcm_token);
      }
    });

    if (tokens.length > 0) {
      await sendPushNotification(tokens, "Peringatan Tagihan", "Harap periksa tagihan Anda yang belum lunas.");
    }

    return successResponse(res, `Peringatan massal berhasil dikirim ke ${payments.length} siswa`);
  } catch (err) {
    next(err);
  }
};

module.exports = { checkout, getAllPembayaran, bayarManual, setDispensasi, kirimPeringatanMassal };
