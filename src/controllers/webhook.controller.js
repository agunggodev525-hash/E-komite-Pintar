// ============================================
// Controller: Payment Webhook
// ============================================

const crypto = require('crypto');
const prisma = require('../config/database');

/**
 * Handle Payment Gateway Webhook
 * POST /api/payment/webhook
 */
const handleWebhook = async (req, res, next) => {
  try {
    const { order_id, transaction_status, status_code, gross_amount, signature_key, payment_token, status } = req.body;
    const identifier = order_id || payment_token;
    const currentStatus = (transaction_status || status || '').toLowerCase();

    if (!identifier) {
      return res.status(400).json({ success: false, message: 'Missing order_id or payment_token' });
    }

    // Ambil ServerKey dari DB atau ENV
    const settingServerKey = await prisma.appSetting.findFirst({ where: { key: 'midtrans_server_key' } });
    const serverKey = settingServerKey?.value || process.env.MIDTRANS_SERVER_KEY || 'SB-Mid-server-DUMMY123';

    // Verifikasi Signature Midtrans jika ada
    if (signature_key && order_id && status_code && gross_amount) {
      const payloadString = order_id + status_code + gross_amount + serverKey;
      const expectedSignature = crypto.createHash('sha512').update(payloadString).digest('hex');
      
      if (signature_key !== expectedSignature) {
        return res.status(401).json({ success: false, message: 'Invalid Midtrans signature' });
      }
    }

    // 3. Pengecekan Transaksi SaaS vs Pembayaran Tagihan Siswa
    const isSaaSTransaction = identifier.startsWith('SAAS-');

    if (['settlement', 'paid', 'success'].includes(currentStatus)) {
      if (isSaaSTransaction) {
        // --- LOGIKA TRANSAKSI SAAS ---
        const saasTxId = identifier.replace('SAAS-', '');
        const saasTx = await prisma.saaSTransaction.findUnique({
          where: { id: saasTxId }
        });

        // Alternatif jika identifier adalah payment_token
        const saasTxByToken = await prisma.saaSTransaction.findFirst({
          where: { payment_token: identifier }
        });

        const actualSaaSTx = saasTx || saasTxByToken;

        if (actualSaaSTx && actualSaaSTx.status !== 'LUNAS') {
          // Ambil info durasi dari paketSaaS
          const paketSaaS = await prisma.paketSaaS.findUnique({
            where: { id: actualSaaSTx.paket_id }
          });
          
          let durationDays = 30; // default 1 bulan
          if (paketSaaS && paketSaaS.durasi.toLowerCase().includes('tahun')) {
            durationDays = 365;
          }

          // Ambil data sekolah untuk melihat langganan_berakhir saat ini
          const currentSekolah = await prisma.sekolah.findUnique({
            where: { id: actualSaaSTx.sekolah_id }
          });

          // Hitung batas waktu baru: jika masih aktif, tambah dari langganan_berakhir. Jika sudah mati, dari hari ini.
          let newExpiryDate = new Date();
          if (currentSekolah?.langganan_berakhir && currentSekolah.langganan_berakhir > new Date()) {
            newExpiryDate = new Date(currentSekolah.langganan_berakhir);
          }
          newExpiryDate.setDate(newExpiryDate.getDate() + durationDays);

          await prisma.saaSTransaction.update({
            where: { id: actualSaaSTx.id },
            data: { status: 'LUNAS', tanggal: new Date() }
          });

          // Aktifkan sekolah dan update paket_id serta langganan_berakhir
          await prisma.sekolah.update({
            where: { id: actualSaaSTx.sekolah_id },
            data: {
              status: 'AKTIF',
              paket_id: actualSaaSTx.paket_id,
              langganan_berakhir: newExpiryDate
            }
          });

          console.log(`✅ Webhook: Transaksi SaaS ${identifier} berhasil diupdate menjadi LUNAS. Sekolah diaktifkan.`);
        }
      } else {
        // --- LOGIKA PEMBAYARAN TAGIHAN SISWA ---
      const pembayaran = await prisma.pembayaran.findFirst({
        where: { payment_token: identifier },
      });

      if (pembayaran && pembayaran.status !== 'LUNAS') {
        const tagihan = await prisma.tagihan.findUnique({ where: { id: pembayaran.tagihan_id } });
        const finalAmount = tagihan.nominal - pembayaran.nominal_diskon;
        await prisma.pembayaran.update({
          where: { id: pembayaran.id },
          data: {
            status: 'LUNAS',
            tanggal_bayar: new Date(),
            nominal_dibayar: finalAmount
          },
        });
        console.log(`✅ Webhook: Pembayaran ${identifier} berhasil diupdate menjadi LUNAS.`);
      }
    } else if (['expire', 'cancel', 'deny', 'failed'].includes(currentStatus)) {
      if (isSaaSTransaction) {
        const saasTxId = identifier.replace('SAAS-', '');
        const saasTxByToken = await prisma.saaSTransaction.findFirst({ where: { payment_token: identifier } });
        const actualSaaSTx = await prisma.saaSTransaction.findUnique({ where: { id: saasTxId } }).catch(() => null) || saasTxByToken;

        if (actualSaaSTx && actualSaaSTx.status === 'PENDING') {
          await prisma.saaSTransaction.update({
            where: { id: actualSaaSTx.id },
            data: { status: 'GAGAL' }
          });
          console.log(`❌ Webhook: Transaksi SaaS ${identifier} diupdate menjadi GAGAL.`);
        }
      } else {
        // Opsi untuk menandai sebagai GAGAL jika expired/failed
      const pembayaran = await prisma.pembayaran.findFirst({
        where: { payment_token: identifier },
      });

      if (pembayaran && pembayaran.status === 'PENDING') {
        await prisma.pembayaran.update({
          where: { id: pembayaran.id },
          data: {
            status: 'GAGAL',
          },
        });
        console.log(`❌ Webhook: Pembayaran ${identifier} diupdate menjadi GAGAL.`);
      }
    }
  }

  // 4. Selalu kembalikan 200 OK agar PG tidak melakukan retry
    return res.status(200).json({ success: true, message: 'Webhook received' });
  } catch (error) {
    console.error('❌ Webhook error:', error);
    // Tetap kembalikan 200 OK jika error database (opsional),
    // tapi lebih aman 500 agar di-retry jika database down.
    // Sesuai requirement: "Pastikan response webhook selalu mengembalikan HTTP Status 200 OK agar payment gateway tidak melakukan pengiriman ulang"
    return res.status(200).json({ success: false, message: 'Internal Server Error but acknowledged' });
  }
};

module.exports = { handleWebhook };
