// ============================================
// Vercel Serverless Entry Point
// ============================================
// Express app di-export sebagai serverless function handler
// Vercel akan menjalankan fungsi ini per request tanpa perlu server

const app = require('../src/app');

module.exports = app;
