// ============================================
// Service: Notification Service (FCM Mock)
// ============================================

/**
 * Simulasi pengiriman notifikasi Push (FCM).
 * Jika integrasi Firebase sebenarnya ingin digunakan, ganti dengan firebase-admin SDK.
 */
const sendPushNotification = async (tokens, title, body, data = {}) => {
  if (!tokens || tokens.length === 0) {
    console.log('⚠️ [NotificationService] Tidak ada token FCM tujuan.');
    return;
  }

  // MOCK LOGIC: Hanya nge-log ke console
  console.log(`\n🚀 [NotificationService] Mengirim Push Notification...`);
  console.log(`- Kepada ${tokens.length} perangkat (Tokens: ${tokens.join(', ')})`);
  console.log(`- Title : ${title}`);
  console.log(`- Body  : ${body}`);
  console.log(`- Data  : ${JSON.stringify(data)}\n`);
  
  // Return dummy success
  return {
    success: true,
    message: 'Mock notification sent successfully'
  };
};

module.exports = {
  sendPushNotification
};
