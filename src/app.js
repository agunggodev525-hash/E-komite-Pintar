// ============================================
// Express Application Setup
// ============================================


require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { errorHandler } = require('./middlewares/errorHandler');
const { errorResponse } = require('./utils/response');

// Import routes
const authRoutes = require('./routes/auth.routes');
const tagihanRoutes = require('./routes/tagihan.routes');
const pembayaranRoutes = require('./routes/pembayaran.routes');
const laporanRoutes = require('./routes/laporan.routes');
const webhookRoutes = require('./routes/webhook.routes');
const votingRoutes = require('./routes/voting.routes');
const superadminRoutes = require('./routes/superadmin.routes');
const sekolahRoutes = require('./routes/sekolah.routes');
const siswaRoutes = require('./routes/siswa.routes');
const pengeluaranRoutes = require('./routes/pengeluaran.routes');
const dashboardRoutes = require('./routes/dashboard.routes');

const app = express();

// ============================================
// Global Middlewares
// ============================================

// Security headers
app.use(helmet());

// CORS — sesuaikan origin untuk production
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// HTTP request logger
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Parse JSON body
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static files
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// ============================================
// API Routes
// ============================================

// Health check
app.get('/api/v1/health', (req, res) => {
  res.json({
    success: true,
    message: 'E-Komite Pintar API berjalan dengan baik.',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// Route mounting
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/tagihan', tagihanRoutes);
app.use('/api/v1/pembayaran', pembayaranRoutes);
app.use('/api/v1/laporan', laporanRoutes);
app.use('/api/v1/voting', votingRoutes);
app.use('/api/v1/sekolah', sekolahRoutes);
app.use('/api/v1/superadmin', superadminRoutes);
app.use('/api/v1/siswa', siswaRoutes);
app.use('/api/v1/pengeluaran', pengeluaranRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);

// Webhook dipisah dari v1 untuk memudahkan integrasi eksternal
app.use('/api/payment', webhookRoutes);

// ============================================
// Error Handling
// ============================================

// 404 — Route tidak ditemukan
app.use((req, res) => {
  errorResponse(res, `Route ${req.method} ${req.originalUrl} tidak ditemukan.`, 404);
});

// Global error handler (harus di posisi paling akhir)
app.use(errorHandler);

module.exports = app;
