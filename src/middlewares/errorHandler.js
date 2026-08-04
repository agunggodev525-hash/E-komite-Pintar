// ============================================
// Middleware: Global Error Handler
// ============================================

const { errorResponse } = require('../utils/response');

/**
 * Global error handler — tangkap semua error yang tidak tertangani.
 * Harus diletakkan SETELAH semua route definitions di app.js.
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, _next) => {
  console.error('🔴 Error:', err.message);
  console.error(err.stack);

  // Prisma: Unique constraint violation
  if (err.code === 'P2002') {
    const field = err.meta?.target?.join(', ') || 'field';
    return errorResponse(
      res,
      `Data dengan ${field} tersebut sudah terdaftar.`,
      409
    );
  }

  // Prisma: Record not found
  if (err.code === 'P2025') {
    return errorResponse(res, 'Data tidak ditemukan.', 404);
  }

  // Prisma: Foreign key constraint violation
  if (err.code === 'P2003') {
    return errorResponse(
      res,
      'Operasi gagal karena data terkait tidak ditemukan.',
      400
    );
  }

  // Express JSON parse error
  if (err.type === 'entity.parse.failed') {
    return errorResponse(res, 'Format JSON tidak valid.', 400);
  }

  // Default: Internal Server Error
  const statusCode = err.statusCode || 500;
  const message =
    process.env.NODE_ENV === 'production'
      ? 'Terjadi kesalahan pada server.'
      : err.message;

  return errorResponse(res, message, statusCode);
};

module.exports = { errorHandler };
