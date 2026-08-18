// ============================================
// Controller: Donasi
// ============================================

const prisma = require('../config/database');
const { successResponse, errorResponse } = require('../utils/response');
const midtransClient = require('midtrans-client');

/**
 * Buat invoice donasi dan dapatkan link Midtrans
 * POST /api/v1/pembayaran/donasi
 */
const checkoutDonasi = async (req, res, next) => {
  try {
    const { nominal, siswa_id } = req.body;
    let targetSiswaId = siswa_id;
    const sekolah_id = req.user.sekolah_id;

    if (!nominal || nominal <= 0) {
      return errorResponse(res, 'Nominal donasi tidak valid.', 400);
    }

    // Resolusi dummy-siswa-id
    if (siswa_id === 'dummy-siswa-id' && req.user.role === 'ORANG_TUA') {
      const anakList = await prisma.siswa.findMany({
        where: { orang_tua_id: req.user.id },
        take: 1
      });
      if (anakList.length > 0) {
        targetSiswaId = anakList[0].id;
      } else {
        return errorResponse(res, 'Tidak dapat memproses donasi, data siswa tidak ditemukan.', 404);
      }
    }

    const siswa = await prisma.siswa.findUnique({
      where: { id: targetSiswaId },
      include: { orang_tua: true, sekolah: true }
    });

    if (!siswa) {
      return errorResponse(res, 'Siswa tidak ditemukan.', 404);
    }

    // Ambil admin_id untuk tagihan donasi (gunakan id user yang login jika admin, atau admin pertama sekolah)
    let admin_id = req.user.role !== 'ORANG_TUA' ? req.user.id : null;
    if (!admin_id) {
      const adminFirst = await prisma.user.findFirst({
        where: { sekolah_id, role: 'ADMIN_KOMITE' }
      });
      if (adminFirst) admin_id = adminFirst.id;
      else return errorResponse(res, 'Tidak ada Admin Komite di sekolah ini.', 400);
    }

    // Buat Tagihan dan Pembayaran secara atomik
    const result = await prisma.$transaction(async (tx) => {
      const tagihanDonasi = await tx.tagihan.create({
        data: {
          judul: 'Donasi Sukarela',
          deskripsi: 'Partisipasi donasi sukarela untuk komite sekolah.',
          nominal: parseFloat(nominal),
          tenggat_waktu: new Date(new Date().setFullYear(new Date().getFullYear() + 1)), // 1 tahun
          admin_id: admin_id,
          sekolah_id: sekolah_id,
        }
      });

      const pembayaran = await tx.pembayaran.create({
        data: {
          tagihan_id: tagihanDonasi.id,
          siswa_id: targetSiswaId,
          status: 'PENDING',
          metode_bayar: 'MIDTRANS',
          nominal_dibayar: parseFloat(nominal)
        }
      });

      return { tagihan: tagihanDonasi, pembayaran };
    });

    // Ambil Midtrans Key dari Setting DB atau ENV
    const settingServerKey = await prisma.appSetting.findFirst({ where: { key: 'midtrans_server_key' } });
    const serverKey = settingServerKey?.value || process.env.MIDTRANS_SERVER_KEY || 'SB-Mid-server-DUMMY123';
    
    const settingIsProd = await prisma.appSetting.findFirst({ where: { key: 'midtrans_is_production' } });
    const isProductionKey = settingIsProd?.value === 'true';

    const snap = new midtransClient.Snap({
      isProduction: isProductionKey,
      serverKey: serverKey,
      clientKey: process.env.MIDTRANS_CLIENT_KEY || 'SB-Mid-client-DUMMY123'
    });

    // Panggil Midtrans
    const parameter = {
      transaction_details: {
        order_id: result.pembayaran.id,
        gross_amount: parseFloat(nominal)
      },
      item_details: [{
        id: result.tagihan.id,
        price: parseFloat(nominal),
        quantity: 1,
        name: 'Donasi Sukarela'
      }],
      customer_details: {
        first_name: siswa.orang_tua.nama_lengkap,
        email: siswa.orang_tua.email,
        phone: siswa.orang_tua.no_whatsapp || ''
      }
    };

    const transaction = await snap.createTransaction(parameter);

    // Update payment_token
    await prisma.pembayaran.update({
      where: { id: result.pembayaran.id },
      data: { payment_token: transaction.token }
    });

    return successResponse(res, 'Berhasil membuat invoice donasi.', {
      snap_token: transaction.token,
      order_id: result.pembayaran.id,
      redirect_url: transaction.redirect_url
    });

  } catch (error) {
    next(error);
  }
};

module.exports = { checkoutDonasi };
