import rateLimit from 'express-rate-limit';
import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { inject } from '@vercel/analytics';
import config, { logStartupDiagnostics, validateConfig } from './config/index.js';
import profileRoute from './routes/profile.route.js';
import themeComparisonRoute from './routes/theme-comparison.route.js';
import { initializeAnalytics } from './services/analytics.service.js';
import { githubCache } from './utils/cache.js';
import { renderGracefulError } from './renderers/error.renderer.js';

inject();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.set('trust proxy', 1);
const PORT = config.port;

// render html file
app.use(express.static(join(__dirname, '..', 'public')));

validateConfig(config);
logStartupDiagnostics(config);
void initializeAnalytics();

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Cache stats endpoint - restricted to callers that supply the configured
// ADMIN_API_KEY in the Authorization header (Bearer scheme). This is an
// internal operations endpoint; exposing hit/miss/eviction counts publicly
// leaks implementation details useful for timing attacks.
app.get('/api/cache/stats', (req, res) => {
  const adminKey = config.admin.apiKey;

  if (adminKey) {
    const authHeader = req.headers['authorization'] || '';
    const supplied = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
    if (supplied !== adminKey) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  }

  res.json(githubCache.getStats());
});

function sendRateLimitSvg(req, res) {
  res.setHeader('Content-Type', 'image/svg+xml');
  const svg = renderGracefulError({
    code: 'RATE_LIMIT',
    detail: 'Too many requests. Please try again in 15 seconds.',
  });
  res.status(429).send(svg);
}

const globalLimiter = rateLimit({
  windowMs: 15 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: sendRateLimitSvg,
  skip: () => !config.isProduction,
});

const usernameLimiter = rateLimit({
  windowMs: 15 * 1000,
  max: 10,
  keyGenerator: (req) => {
    const username = typeof req.query.username === 'string' ? req.query.username.trim().toLowerCase() : '';
    return username || req.ip;
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: sendRateLimitSvg,
  skip: () => !config.isProduction,
});

app.use('/api/profile', globalLimiter, usernameLimiter, profileRoute);
app.use('/api/theme-preview', themeComparisonRoute);

// Theme Comparison page
app.get('/theme-comparison', (req, res) => {
  res.sendFile(join(__dirname, '..', 'public', 'theme-comparison.html'));
});

const server = app.listen(PORT, () => {
  if (!config.isProduction) {
    console.log(`Server running on http://localhost:${PORT}`);
  }
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Stop the other process or set PORT to a different value in .env`);
    process.exit(1);
  }
  throw err;
});
