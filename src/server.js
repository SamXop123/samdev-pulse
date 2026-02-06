import express from 'express';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { inject } from '@vercel/analytics';
import { track } from '@vercel/analytics/server';
import profileRoute from './routes/profile.route.js';

dotenv.config();

// Initialize Vercel Analytics
inject();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

// Serve static files from public directory
app.use(express.static(join(__dirname, '..', 'public')));

// Validate environment on startup
function validateEnv() {
  const warnings = [];

  if (!process.env.GITHUB_TOKEN) {
    warnings.push('GITHUB_TOKEN not set - streak stats will be unavailable');
  }

  if (!IS_PRODUCTION && warnings.length > 0) {
    warnings.forEach(w => console.warn(`⚠️  ${w}`));
  }
}

validateEnv();

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Analytics tracking middleware for profile requests
app.use('/api/profile', (req, res, next) => {
  track('github_stats_request', {
    username: req.query.username || 'unknown',
    theme: req.query.theme || 'dark',
    leetcode: req.query.leetcode || 'not_specified',
    align: req.query.align || 'left',
  });

  next();
}, profileRoute);

app.listen(PORT, () => {
  if (!IS_PRODUCTION) {
    console.log(`Server running on http://localhost:${PORT}`);
  }
});
