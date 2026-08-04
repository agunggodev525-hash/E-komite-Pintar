const axios = require('axios');
const prisma = require('../config/database');

/**
 * ============================================
 * Service: WhatsApp Integration (Fonnte API)
 * ============================================
 */

/**
 * Format nomor handphone lokal menjadi standar WhatsApp internasional (62)
 * Contoh: 0812345678 -> 62812345678
 */
const formatPhoneNumber = (phone) => {
  if (!phone) return null;
  let formatted = phone.replace(/\D/g, ''); // Hapus semua karakter non-digit
  if (formatted.startsWith('0')) {
    formatted = '62' + formatted.substring(1);
  }
  return formatted;
};

/**
 * Mengirim pesan WhatsApp ke nomor tujuan via Fonnte
 * @param {string} target - Nomor WA tujuan
 * @param {string} message - Isi pesan
 * @returns {Promise<boolean>} Status keberhasilan
 */
const sendWhatsAppMessage = async (target, message) => {
  try {
    const formattedTarget = formatPhoneNumber(target);
    if (!formattedTarget) {
      console.error('❌ Gagal kirim WA: Nomor tidak valid');
      return false;
    }

    // Ambil Fonnte API Key dari AppSettings atau Env
    const settingToken = await prisma.appSetting.findFirst({
      where: { key: 'FONNTE_API_TOKEN' }
    });
    const token = settingToken?.value || process.env.FONNTE_API_TOKEN;

    if (!token) {
      console.warn(`⚠️ [SIMULASI WA] Token Fonnte tidak ditemukan. Membatalkan pengiriman asli.`);
      console.log(`[WA Simulator] Ke: ${formattedTarget}`);
      console.log(`[WA Simulator] Pesan: \n${message}\n`);
      return true; // Return true as simulation success
    }

    // Eksekusi pemanggilan HTTP POST ke Fonnte
    const response = await axios.post(
      'https://api.fonnte.com/send',
      {
        target: formattedTarget,
        message: message,
      },
      {
        headers: {
          'Authorization': token,
        },
      }
    );

    if (response.data?.status) {
      console.log(`✅ Pesan WA berhasil dikirim ke ${formattedTarget}`);
      return true;
    } else {
      console.error(`❌ Pesan WA gagal dikirim: ${response.data?.reason}`);
      return false;
    }
  } catch (error) {
    console.error('❌ Terjadi kesalahan pada layanan WhatsApp:', error.message);
    return false;
  }
};

module.exports = {
  sendWhatsAppMessage,
  formatPhoneNumber,
};
