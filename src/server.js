// ============================================
// Server Entry Point
// ============================================

const app = require('./app');
const prisma = require('./config/database');
const { startScheduler } = require('./jobs/reminder.job');

const PORT = process.env.PORT || 3000;

async function main() {
  try {
    // Test koneksi database
    await prisma.$connect();
    console.log('✅ Database PostgreSQL terhubung.');

    // Nyalakan Robot Cron Job Reminder WA
    startScheduler();

    // Start server
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 E-Komite Pintar API berjalan di http://localhost:${PORT}`);
      console.log(`📋 Health check: http://localhost:${PORT}/api/v1/health`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('❌ Gagal memulai server:', error.message);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🔄 Menutup koneksi database...');
  await prisma.$disconnect();
  console.log('👋 Server dihentikan.');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

main();
