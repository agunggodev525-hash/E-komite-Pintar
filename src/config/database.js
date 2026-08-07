// ============================================
// Prisma Client Singleton
// ============================================
// Mencegah multiple instance PrismaClient saat hot-reload (nodemon)

const { PrismaClient } = require('@prisma/client');

let prisma;

let dbUrl = process.env.DATABASE_URL || '';
// Jika menggunakan pooler Supabase (6543) tapi lupa menambahkan pgbouncer=true
if (dbUrl.includes(':6543') && !dbUrl.includes('pgbouncer=true')) {
  dbUrl += dbUrl.includes('?') ? '&pgbouncer=true' : '?pgbouncer=true';
}

const prismaConfig = {
  datasources: {
    db: {
      url: dbUrl
    }
  }
};

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient(prismaConfig);
} else {
  if (!global.__prisma) {
    global.__prisma = new PrismaClient({
      ...prismaConfig,
      log: ['query', 'info', 'warn', 'error'],
    });
  }
  prisma = global.__prisma;
}

module.exports = prisma;
