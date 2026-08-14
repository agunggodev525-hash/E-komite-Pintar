// ============================================
// Utils: Simple In-Memory Cache
// ============================================
// Cache ringan tanpa dependency tambahan.
// Data otomatis expire setelah TTL (Time To Live).

const cache = new Map();

/**
 * Simpan data ke cache dengan TTL (detik).
 */
const setCache = (key, data, ttlSeconds = 300) => {
  cache.set(key, {
    data,
    expiresAt: Date.now() + ttlSeconds * 1000,
  });
};

/**
 * Ambil data dari cache. Return null jika tidak ada atau sudah expired.
 */
const getCache = (key) => {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  return entry.data;
};

/**
 * Hapus satu key dari cache (misal: setelah data berubah).
 */
const invalidateCache = (key) => {
  cache.delete(key);
};

/**
 * Hapus semua cache yang key-nya mengandung prefix tertentu.
 */
const invalidateCacheByPrefix = (prefix) => {
  for (const key of cache.keys()) {
    if (key.startsWith(prefix)) {
      cache.delete(key);
    }
  }
};

/**
 * Middleware Express: otomatis cache GET response.
 * Usage: router.get('/path', cacheMiddleware(300), handler)
 */
const cacheMiddleware = (ttlSeconds = 300) => (req, res, next) => {
  // Hanya cache GET request
  if (req.method !== 'GET') return next();

  const cacheKey = `route:${req.user?.id || 'anon'}:${req.originalUrl}`;
  const cached = getCache(cacheKey);

  if (cached) {
    return res.json(cached);
  }

  // Intercept res.json untuk menyimpan response ke cache
  const originalJson = res.json.bind(res);
  res.json = (body) => {
    if (res.statusCode === 200 && body?.success) {
      setCache(cacheKey, body, ttlSeconds);
    }
    return originalJson(body);
  };

  next();
};

module.exports = { setCache, getCache, invalidateCache, invalidateCacheByPrefix, cacheMiddleware };
