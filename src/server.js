import express from 'express';
import dotenv from 'dotenv';
import profileRoute from './routes/profile.route.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

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

app.use('/api/profile', profileRoute);

app.listen(PORT, () => {
  if (!IS_PRODUCTION) {
    console.log(`Server running on http://localhost:${PORT}`);
  }
});
