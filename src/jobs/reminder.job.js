const cron = require('node-cron');
const prisma = require('../config/database');
const { sendWhatsAppMessage } = require('../services/whatsapp.service');

// Format mata uang sederhana
const formatRupiah = (angka) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(angka);
};

/**
 * Logika inti untuk mencari dan mengingatkan tagihan
 */
const runReminderJob = async () => {
  console.log('⏰ [CRON JOB] Memulai proses pengecekan tagihan untuk Auto-Reminder WhatsApp...');
  try {
    // 1. Ambil semua pembayaran PENDING
    const pendingPayments = await prisma.pembayaran.findMany({
      where: {
        status: 'PENDING'
      },
      include: {
        tagihan: true,
        siswa: {
          include: {
            orang_tua: true,
            sekolah: true
          }
        }
      }
    });

    const now = new Date();
    let sentCount = 0;

    // 2. Loop melalui pembayaran, periksa jarak hari
    for (const payment of pendingPayments) {
      if (!payment.tagihan || !payment.tagihan.tenggat_waktu) continue;
      
      const dueDate = new Date(payment.tagihan.tenggat_waktu);
      
      // Hitung selisih hari (mengabaikan waktu/jam)
      const diffTime = dueDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // Kirim pengingat jika H-3, H-1, atau telat 1 hari (H+1)
      if (diffDays === 3 || diffDays === 1 || diffDays === -1) {
        const ortu = payment.siswa.orang_tua;
        if (!ortu || !ortu.no_whatsapp) continue; // Skip jika tidak ada nomor WA

        // Susun template pesan berdasarkan kondisi
        let titleAlert = '';
        if (diffDays === 3) titleAlert = '⚠️ PENGINGAT H-3';
        if (diffDays === 1) titleAlert = '🚨 PENGINGAT H-1 (BESOK)';
        if (diffDays === -1) titleAlert = '⛔ TAGIHAN LEWAT JATUH TEMPO';

        const message = `*${titleAlert}*\n\nHalo Bapak/Ibu *${ortu.nama_lengkap}*,\n\nKami dari *${payment.siswa.sekolah.nama_sekolah}* ingin mengingatkan bahwa terdapat tagihan yang belum dilunasi untuk siswa:\n\n🧑‍🎓 Nama: *${payment.siswa.nama_siswa}*\n🏷️ Tagihan: *${payment.tagihan.judul}*\n💰 Nominal: *${formatRupiah(payment.tagihan.nominal)}*\n⏳ Jatuh Tempo: *${dueDate.toLocaleDateString('id-ID')}*\n\nSilakan abaikan pesan ini jika Anda sudah melakukan pembayaran. Anda dapat membayar tagihan ini secara instan (GoPay/VA/QRIS) melalui Portal E-Komite Pintar.\n\nTerima kasih. 🙏`;

        // Kirim WA
        const success = await sendWhatsAppMessage(ortu.no_whatsapp, message);
        if (success) sentCount++;
      }
    }

    console.log(`⏰ [CRON JOB] Selesai. Total ${sentCount} pesan reminder WA telah ditembakkan.`);
  } catch (error) {
    console.error('❌ [CRON JOB] Gagal menjalankan reminder:', error);
  }
};

/**
 * Inisialisasi dan jalankan scheduler
 * Format: Menit Jam Tanggal Bulan Hari-Dalam-Minggu
 * Contoh "0 8 * * *" = Setiap hari jam 08:00 Pagi
 */
const startScheduler = () => {
  console.log('🤖 Cron Job Auto-Reminder WA didaftarkan (Berjalan setiap jam 08:00 Pagi)');
  
  // Jalan otomatis jam 08:00 tiap pagi
  cron.schedule('0 8 * * *', () => {
    runReminderJob();
  }, {
    scheduled: true,
    timezone: "Asia/Jakarta"
  });

  // Untuk masa development/testing, kita bisa aktifkan hook manual agar kita bisa mengetesnya saat server menyala
  // setTimeout(() => runReminderJob(), 3000); 
};

module.exports = {
  startScheduler,
  runReminderJob // Diekspor jika sewaktu-waktu ingin ditrigger manual via endpoint API
};
