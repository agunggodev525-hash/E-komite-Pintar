// ============================================
// Prisma Client Singleton
// ============================================
// Mencegah multiple instance PrismaClient saat hot-reload (nodemon)

const { PrismaClient } = require('@prisma/client');

let prisma;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  // Dalam development, gunakan global variable agar tidak
  // membuat koneksi baru setiap kali nodemon restart
  if (!global.__prisma) {
    global.__prisma = new PrismaClient({
      log: ['query', 'info', 'warn', 'error'],
    });
  }
  prisma = global.__prisma;
}

module.exports = prisma;
