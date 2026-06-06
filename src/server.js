import express from 'express';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { inject } from '@vercel/analytics';
import profileRoute from './routes/profile.route.js';
import { initializeAnalytics } from './services/analytics.service.js';
import { githubCache } from './utils/cache.js';

dotenv.config();
inject();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

// render html file
app.use(express.static(join(__dirname, '..', 'public')));

// validates env on startup
function validateEnv() {
  const warnings = [];

  if (!process.env.GITHUB_TOKEN) {
    warnings.push('GITHUB_TOKEN not set - streak stats will be unavailable');
  }

  if (warnings.length > 0) {
    warnings.forEach(w => console.warn(`⚠️  ${w}`));
  }
}

validateEnv();
void initializeAnalytics();

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Cache stats endpoint — restricted to callers that supply the configured
// ADMIN_API_KEY in the Authorization header (Bearer scheme). This is an
// internal operations endpoint; exposing hit/miss/eviction counts publicly
// leaks implementation details useful for timing attacks.
app.get('/api/cache/stats', (req, res) => {
  const adminKey = process.env.ADMIN_API_KEY;

  if (adminKey) {
    const authHeader = req.headers['authorization'] || '';
    const supplied = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
    if (supplied !== adminKey) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  }

  res.json(githubCache.getStats());
});

app.use('/api/profile', profileRoute);

const server = app.listen(PORT, () => {
  if (!IS_PRODUCTION) {
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
