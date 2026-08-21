// ============================================
// Controller: Authentication
// ============================================

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/database');
const jwtConfig = require('../config/jwt');
const { successResponse, errorResponse } = require('../utils/response');
const { writeLog } = require('../utils/auditLog');
const axios = require('axios');
const { OAuth2Client } = require('google-auth-library');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID');

// Penyimpanan sementara (In-Memory Map) untuk OTP
// Format: Map<no_whatsapp, { otp: string, expiresAt: number }>
// Catatan: Untuk skala besar (production), gunakan Redis.
const otpStore = new Map();

/**
 * Registrasi user baru
 * POST /api/v1/auth/register
 */
const register = async (req, res, next) => {
  try {
    const { nama_lengkap, email, password, no_whatsapp, role } = req.body;

    // Cek apakah email sudah terdaftar
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return errorResponse(res, 'Email sudah terdaftar.', 409);
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const password_hash = await bcrypt.hash(password, salt);

    // Buat user baru
    const user = await prisma.user.create({
      data: {
        nama_lengkap,
        email,
        password_hash,
        no_whatsapp: no_whatsapp || null,
        role: role || 'ORANG_TUA',
      },
      select: {
        id: true,
        nama_lengkap: true,
        email: true,
        no_whatsapp: true,
        role: true,
        status: true,
        created_at: true,
      },
    });

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      jwtConfig.secret,
      { expiresIn: jwtConfig.expiresIn }
    );

    // Audit Log
    writeLog({
      action: 'REGISTER',
      detail: `User baru terdaftar: ${user.nama_lengkap} (${user.email}) sebagai ${user.role}`,
      userId: user.id,
    });

    return successResponse(
      res,
      'Registrasi berhasil.',
      { user, token },
      201
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Login user
 * POST /api/v1/auth/login
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Cari user berdasarkan email beserta data sekolahnya
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        sekolah: {
          select: { paket_berlangganan: true }
        }
      }
    });

    if (!user) {
      return errorResponse(res, 'Email atau password salah.', 401);
    }

    // Cek apakah akun aktif
    if (!user.status) {
      return errorResponse(res, 'Akun Anda telah dinonaktifkan. Hubungi admin.', 403);
    }

    // Verifikasi password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return errorResponse(res, 'Email atau password salah.', 401);
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      jwtConfig.secret,
      { expiresIn: jwtConfig.expiresIn }
    );

    // Response tanpa password_hash
    const userData = {
      id: user.id,
      nama_lengkap: user.nama_lengkap,
      email: user.email,
      no_whatsapp: user.no_whatsapp,
      role: user.role,
      status: user.status,
      foto_profil: user.foto_profil,
      paket: user.sekolah?.paket_berlangganan || 'BASIC',
    };

    // Audit Log
    writeLog({
      action: 'LOGIN',
      detail: `${userData.nama_lengkap} (${userData.email}) berhasil login sebagai ${userData.role}`,
      userId: user.id,
      sekolahId: user.sekolah_id || null,
    });

    return successResponse(res, 'Login berhasil.', { user: userData, token });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ success: false, message: error.message || error.toString() });
  }
};

/**
 * Request OTP via WhatsApp
 * POST /api/v1/auth/request-otp
 */
const requestOtp = async (req, res, next) => {
  try {
    const { no_whatsapp } = req.body;

    if (!no_whatsapp) {
      return errorResponse(res, 'Nomor WhatsApp wajib diisi.', 400);
    }

    // Cek apakah nomor WA terdaftar di database
    const user = await prisma.user.findFirst({
      where: { no_whatsapp },
    });

    if (!user) {
      return errorResponse(res, 'Nomor WhatsApp tidak terdaftar di sistem kami.', 404);
    }

    // Cek apakah akun aktif
    if (!user.status) {
      return errorResponse(res, 'Akun Anda telah dinonaktifkan. Hubungi admin.', 403);
    }

    // Ambil Kredensial WA dari DB
    const [dbWaToken, dbWaUrl] = await Promise.all([
      prisma.appSetting.findFirst({ where: { key: 'wa_api_token' } }),
      prisma.appSetting.findFirst({ where: { key: 'wa_api_url' } })
    ]);

    const waToken = dbWaToken?.value || process.env.WA_API_TOKEN;
    const waUrlRaw = dbWaUrl?.value || process.env.WA_API_URL || 'https://api.fonnte.com/send';

    // Generate 6 digit OTP acak, atau gunakan 123456 jika token WA belum diatur (Mode Testing)
    const otp = waToken ? Math.floor(100000 + Math.random() * 900000).toString() : '123456';
    
    // Simpan ke memory Map (masa aktif 5 menit = 300.000 ms)
    otpStore.set(no_whatsapp, {
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000,
    });
    const pesan = `Kode OTP E-Komite Pintar Anda adalah *${otp}*.\n\nJangan berikan kode ini kepada siapapun. Berlaku 5 menit.`;

    if (waToken) {
      try {
        const waUrl = waUrlRaw;
        
        // Sesuaikan payload berdasarkan penyedia layanan (Fonnte vs Wablas)
        let payload = {};
        if (waUrl.toLowerCase().includes('wablas')) {
          payload = { phone: no_whatsapp, message: pesan };
        } else {
          payload = { target: no_whatsapp, message: pesan };
        }

        await axios.post(waUrl, payload, {
          headers: {
            Authorization: waToken
          }
        });
        console.log(`✅ [WHATSAPP API] OTP berhasil dikirim ke ${no_whatsapp}`);
      } catch (waError) {
        console.error('❌ Gagal mengirim pesan WhatsApp via API:', waError.response ? waError.response.data : waError.message);
        return errorResponse(res, 'Gagal mengirim pesan WhatsApp. Silakan coba lagi nanti.', 500);
      }
    } else {
      // Dummy pengiriman jika token belum dipasang
      console.log(`\n======================================================`);
      console.log(`📱 [DUMMY WHATSAPP GATEWAY] (WA_API_TOKEN kosong)`);
      console.log(`Kepada: ${no_whatsapp}`);
      console.log(`Pesan: ${pesan}`);
      console.log(`======================================================\n`);
    }

    return successResponse(res, 'Kode OTP berhasil diproses.');
  } catch (error) {
    next(error);
  }
};

/**
 * Verifikasi OTP
 * POST /api/v1/auth/verify-otp
 */
const verifyOtp = async (req, res, next) => {
  try {
    const { no_whatsapp, otp } = req.body;

    if (!no_whatsapp || !otp) {
      return errorResponse(res, 'Nomor WhatsApp dan OTP wajib diisi.', 400);
    }

    // Cek di memori
    const storedData = otpStore.get(no_whatsapp);

    if (!storedData) {
      return errorResponse(res, 'OTP tidak valid atau belum diminta.', 400);
    }

    // Cek kedaluwarsa
    if (Date.now() > storedData.expiresAt) {
      otpStore.delete(no_whatsapp);
      return errorResponse(res, 'Kode OTP telah kedaluwarsa. Silakan minta ulang.', 400);
    }

    // Cocokkan OTP
    if (storedData.otp !== otp) {
      return errorResponse(res, 'Kode OTP salah.', 401);
    }

    // Jika valid, hapus dari memori
    otpStore.delete(no_whatsapp);

    // Ambil data user
    const user = await prisma.user.findFirst({
      where: { no_whatsapp },
      include: {
        sekolah: {
          select: { paket_berlangganan: true }
        }
      }
    });

    if (!user) {
      return errorResponse(res, 'User tidak ditemukan.', 404);
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      jwtConfig.secret,
      { expiresIn: jwtConfig.expiresIn }
    );

    const userData = {
      id: user.id,
      nama_lengkap: user.nama_lengkap,
      email: user.email,
      no_whatsapp: user.no_whatsapp,
      role: user.role,
      status: user.status,
      foto_profil: user.foto_profil,
      paket: user.sekolah?.paket_berlangganan || 'BASIC',
    };

    return successResponse(res, 'Verifikasi OTP berhasil. Anda telah masuk.', { user: userData, token });
  } catch (error) {
    next(error);
  }
};

/**
 * Update FCM Token for current user
 * POST /api/v1/auth/fcm-token
 */
const updateFcmToken = async (req, res) => {
  try {
    const { fcm_token } = req.body;
    if (!fcm_token) {
      return errorResponse(res, 'FCM Token tidak boleh kosong', 400);
    }

    await prisma.user.update({
      where: { id: req.user.id },
      data: { fcm_token },
    });

    return successResponse(res, 'FCM Token berhasil diperbarui');
  } catch (error) {
    return errorResponse(res, 'Gagal memperbarui FCM Token', 500, error.message);
  }
};

/**
 * Update Foto Profil for current user
 * POST /api/v1/auth/foto-profil
 */
const updateFotoProfil = async (req, res) => {
  try {
    if (!req.file) {
      return errorResponse(res, 'File foto tidak ditemukan.', 400);
    }

    // Upload ke Cloudinary menggunakan buffer dari memoryStorage
    const cloudinary = require('../config/cloudinary');
    const fotoUrl = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'ekomite/profil', resource_type: 'image' },
        (error, result) => {
          if (error) return reject(error);
          resolve(result.secure_url);
        }
      );
      stream.end(req.file.buffer);
    });

    await prisma.user.update({
      where: { id: req.user.id },
      data: { foto_profil: fotoUrl },
    });

    return successResponse(res, 'Foto profil berhasil diperbarui', { foto_profil: fotoUrl });
  } catch (error) {
    return errorResponse(res, 'Gagal memperbarui foto profil', 500, error.message);
  }
};

/**
 * Login dengan Google
 * POST /api/v1/auth/google
 */
const googleLogin = async (req, res, next) => {
  try {
    const { accessToken } = req.body;

    if (!accessToken) {
      return errorResponse(res, 'Token Google wajib disertakan.', 400);
    }

    // Ambil data user dari Google menggunakan accessToken
    const googleResponse = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    
    const payload = googleResponse.data;
    const email = payload['email'];
    const name = payload['name'];
    const picture = payload['picture'];

    // Cari user di database
    let user = await prisma.user.findUnique({
      where: { email },
      include: {
        sekolah: {
          select: { paket_berlangganan: true }
        }
      }
    });

    // Jika belum ada, buat user baru
    if (!user) {
      // Buat password acak karena daftar via Google
      const randomPassword = Math.random().toString(36).slice(-8);
      const salt = await bcrypt.genSalt(12);
      const password_hash = await bcrypt.hash(randomPassword, salt);

      user = await prisma.user.create({
        data: {
          nama_lengkap: name,
          email,
          password_hash,
          role: 'ORANG_TUA', // Default role
          foto_profil: picture,
          status: true,
        },
        include: {
          sekolah: {
            select: { paket_berlangganan: true }
          }
        }
      });
      
      writeLog({
        action: 'REGISTER_GOOGLE',
        detail: `User baru mendaftar via Google: ${user.nama_lengkap} (${user.email})`,
        userId: user.id,
      });
    }

    // Cek status aktif
    if (!user.status) {
      return errorResponse(res, 'Akun Anda telah dinonaktifkan. Hubungi admin.', 403);
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      jwtConfig.secret,
      { expiresIn: jwtConfig.expiresIn }
    );

    const userData = {
      id: user.id,
      nama_lengkap: user.nama_lengkap,
      email: user.email,
      no_whatsapp: user.no_whatsapp,
      role: user.role,
      status: user.status,
      foto_profil: user.foto_profil,
      paket: user.sekolah?.paket_berlangganan || 'BASIC',
    };

    writeLog({
      action: 'LOGIN_GOOGLE',
      detail: `${userData.nama_lengkap} (${userData.email}) berhasil login via Google`,
      userId: user.id,
      sekolahId: user.sekolah_id || null,
    });

    return successResponse(res, 'Login dengan Google berhasil.', { user: userData, token });
  } catch (error) {
    console.error("Google Login Error:", error);
    return res.status(500).json({ success: false, message: 'Autentikasi Google gagal.' });
  }
};

module.exports = { register, login, requestOtp, verifyOtp, updateFcmToken, updateFotoProfil, googleLogin };
