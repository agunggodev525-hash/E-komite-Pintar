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
    console.warn('⚠️ FCM tidak aktif atau token kosong, notifikasi tidak dikirim.');
    return false;
  }

  const tokens = Array.isArray(fcmTokens) ? fcmTokens : [fcmTokens];

  // Pastikan semua nilai dalam data adalah string (requirement FCM)
  const stringData = {};
  for (const [key, val] of Object.entries(data)) {
    stringData[key] = String(val);
  }

  try {
    const message = {
      tokens: tokens,
      // notification payload: agar muncul di tray HP meski app di background/killed
      notification: {
        title: title || 'E-Komite Pintar',
        body: body || 'Ada pembaruan data'
      },
      // data payload: agar app bisa handle action-nya saat foreground
      data: {
        title: title || 'E-Komite Pintar',
        body: body || 'Ada pembaruan data',
        ...stringData,
      },
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
          channel_id: 'tagihan_channel',
          notification_priority: 'PRIORITY_HIGH',
          visibility: 'PUBLIC',
          default_vibrate_timings: true,
          default_sound: true
        }
      }
    };

    const response = await getMessaging().sendEachForMulticast(message);
    console.log(`📩 Notifikasi FCM berhasil dikirim ke ${response.successCount} perangkat. Gagal: ${response.failureCount}`);

    // Log detail error jika ada token yang gagal
    if (response.failureCount > 0) {
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          console.error(`  ❌ Token [${idx}] gagal: ${resp.error?.message}`);
        }
      });
    }

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
