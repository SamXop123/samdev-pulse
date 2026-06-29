const WINDOW_MS = 60000;
const MAX_REQUESTS = 30;

const ipMap = new Map();

export function rateLimiter(req, res, next) {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const now = Date.now();

  if (!ipMap.has(ip)) {
    ipMap.set(ip, []);
  }

  const timestamps = ipMap.get(ip).filter(t => now - t < WINDOW_MS);

  if (timestamps.length >= MAX_REQUESTS) {
    return res.status(429).set('Retry-After', '60').json({ error: 'Too many requests' });
  }

  timestamps.push(now);
  ipMap.set(ip, timestamps);
  next();
}

export function clearRateLimiter() {
  ipMap.clear();
}
