// ============================================
// Controller: Authentication
// ============================================

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/database');
const jwtConfig = require('../config/jwt');
const { successResponse, errorResponse } = require('../utils/response');

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
      paket: user.sekolah?.paket_berlangganan || 'BASIC',
    };

    return successResponse(res, 'Login berhasil.', { user: userData, token });
  } catch (error) {
    next(error);
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

    // Generate 6 digit OTP acak
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Simpan ke memory Map (masa aktif 5 menit = 300.000 ms)
    otpStore.set(no_whatsapp, {
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000,
    });

    // Dummy pengiriman ke WhatsApp Gateway
    console.log(`\n======================================================`);
    console.log(`📱 [DUMMY WHATSAPP GATEWAY]`);
    console.log(`Kepada: ${no_whatsapp}`);
    console.log(`Pesan: Kode OTP E-Komite Pintar Anda adalah *${otp}*.`);
    console.log(`Jangan berikan kode ini kepada siapapun. Berlaku 5 menit.`);
    console.log(`======================================================\n`);

    return successResponse(res, 'Kode OTP berhasil dikirim ke nomor WhatsApp Anda.');
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

module.exports = { register, login, requestOtp, verifyOtp, updateFcmToken };
