const { initializeApp, cert } = require('firebase-admin/app');
const { getMessaging } = require('firebase-admin/messaging');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin (Only if service account exists)
let isFcmInitialized = false;

try {
  const serviceAccountPath = path.resolve(process.cwd(), process.env.FIREBASE_SERVICE_ACCOUNT_PATH || 'firebase-service-account.json');
  
  if (fs.existsSync(serviceAccountPath)) {
    const serviceAccount = require(serviceAccountPath);
    initializeApp({
      credential: cert(serviceAccount)
    });
    isFcmInitialized = true;
    console.log('✅ Firebase Admin SDK berhasil diinisialisasi.');
  } else {
    console.warn('⚠️ File kredensial Firebase Admin tidak ditemukan. Notifikasi Push dinonaktifkan.');
  }
} catch (error) {
  console.error('❌ Gagal menginisialisasi Firebase Admin:', error.message);
}

/**
 * Mengirim notifikasi push ke satu atau beberapa perangkat
 * @param {string|string[]} fcmTokens Token perangkat FCM (bisa array atau string tunggal)
 * @param {string} title Judul notifikasi
 * @param {string} body Isi notifikasi
 * @param {object} data Data tambahan (opsional), berguna untuk silent update
 * @returns {Promise<boolean>} Status keberhasilan
 */
const sendNotification = async (fcmTokens, title, body, data = {}) => {
  if (!isFcmInitialized || !fcmTokens || fcmTokens.length === 0) {
    return false;
  }

  const tokens = Array.isArray(fcmTokens) ? fcmTokens : [fcmTokens];

  try {
    const message = {
      tokens: tokens,
      data: {
        ...data,
      },
      android: {
        notification: {
          sound: 'default',
          priority: 'high' // pastikan prioritas tinggi agar bunyi
        }
      }
    };

    // Tambahkan objek notification hanya jika title atau body ada isinya (bukan silent update)
    if (title || body) {
      message.notification = {
        title: title || 'Notifikasi',
        body: body || ''
      };
    }

    const response = await getMessaging().sendEachForMulticast(message);
    console.log(`📩 Notifikasi FCM berhasil dikirim ke ${response.successCount} perangkat. Gagal: ${response.failureCount}`);
    return true;
  } catch (error) {
    console.error('❌ Gagal mengirim notifikasi FCM:', error.message);
    return false;
  }
};

module.exports = {
  sendNotification,
  isFcmInitialized
};
