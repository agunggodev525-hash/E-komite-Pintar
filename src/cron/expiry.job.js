// ============================================
// Cron Job: Memeriksa Kedaluwarsa Langganan SaaS
// ============================================

const cron = require('node-cron');
const prisma = require('../config/database');

const startExpiryCron = () => {
  // Berjalan setiap hari pada jam 00:00 (Tengah Malam)
  cron.schedule('0 0 * * *', async () => {
    console.log('[CRON] Memulai pengecekan langganan SaaS yang kedaluwarsa...');
    
    try {
      const now = new Date();
      
      // Cari sekolah yang masih AKTIF namun tanggal langganan sudah lewat
      const expiredSekolah = await prisma.sekolah.findMany({
        where: {
          status: 'AKTIF',
          langganan_berakhir: {
            lt: now
          }
        }
      });

      if (expiredSekolah.length > 0) {
        console.log(`[CRON] Ditemukan ${expiredSekolah.length} sekolah yang masa aktifnya telah habis.`);

        // Update status menjadi NONAKTIF
        for (const sekolah of expiredSekolah) {
          await prisma.sekolah.update({
            where: { id: sekolah.id },
            data: { status: 'NONAKTIF' }
          });
          
          console.log(`[CRON] ❌ Akses sekolah "${sekolah.nama_sekolah}" telah dinonaktifkan (Kedaluwarsa: ${sekolah.langganan_berakhir.toISOString()}).`);
        }
      } else {
        console.log('[CRON] Tidak ada sekolah yang kedaluwarsa hari ini.');
      }
    } catch (error) {
      console.error('[CRON] Terjadi kesalahan saat memeriksa kedaluwarsa:', error);
    }
  });

  console.log('✅ Cron Job Expiry SaaS berhasil diaktifkan.');
};

module.exports = { startExpiryCron };
