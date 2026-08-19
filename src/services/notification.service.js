// ============================================
// Service: Notification 
// ============================================

const prisma = require('../config/database');

/**
 * Mengirim notifikasi ke satu pengguna tertentu
 */
const sendNotificationToUser = async (userId, judul, pesan, tipe = 'INFO') => {
  try {
    return await prisma.notifikasi.create({
      data: {
        user_id: userId,
        judul,
        pesan,
        tipe
      }
    });
  } catch (error) {
    console.error('[NotificationService] Gagal mengirim ke user:', error);
    return null;
  }
};

/**
 * Mengirim notifikasi ke semua ADMIN_KOMITE pada sebuah sekolah
 */
const sendNotificationToSekolahAdmins = async (sekolahId, judul, pesan, tipe = 'INFO') => {
  try {
    const admins = await prisma.user.findMany({
      where: {
        sekolah_id: sekolahId,
        role: 'ADMIN_KOMITE'
      }
    });

    const notifData = admins.map(admin => ({
      user_id: admin.id,
      judul,
      pesan,
      tipe
    }));

    if (notifData.length > 0) {
      await prisma.notifikasi.createMany({
        data: notifData
      });
    }
  } catch (error) {
    console.error('[NotificationService] Gagal mengirim ke admin sekolah:', error);
  }
};

module.exports = {
  sendNotificationToUser,
  sendNotificationToSekolahAdmins
};
