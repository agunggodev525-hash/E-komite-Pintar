// ============================================
// Middleware: Role-Based Access Control (RBAC)
// ============================================

const { errorResponse } = require('../utils/response');

/**
 * Higher-order middleware untuk membatasi akses berdasarkan role.
 *
 * @param  {...string} allowedRoles - Daftar role yang diizinkan
 * @returns {function} Express middleware
 *
 * @example
 * // Hanya SUPER_ADMIN dan ADMIN_KOMITE yang boleh mengakses
 * router.post('/tagihan', authenticate, authorize('SUPER_ADMIN', 'ADMIN_KOMITE'), controller);
 *
 * // ORANG_TUA akan mendapat 403 Forbidden
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    // Pastikan middleware authenticate sudah dijalankan terlebih dahulu
    if (!req.user) {
      return errorResponse(
        res,
        'Akses ditolak. Autentikasi diperlukan.',
        401
      );
    }

    // Cek apakah role user termasuk dalam daftar yang diizinkan
    if (!allowedRoles.includes(req.user.role)) {
      return errorResponse(
        res,
        `Akses ditolak. Role '${req.user.role}' tidak memiliki izin untuk mengakses resource ini.`,
        403
      );
    }

    next();
  };
};

module.exports = { authorize };
