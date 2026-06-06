import mongoose from 'mongoose';

const ENABLED_VALUES = new Set(['true', '1', 'yes']);

let analyticsState = 'uninitialized';
let connectingPromise = null;

function analyticsDisabledByEnv() {
  return ENABLED_VALUES.has(String(process.env.ANALYTICS_DISABLED || '').toLowerCase())
    || ENABLED_VALUES.has(String(process.env.DISABLE_ANALYTICS || '').toLowerCase());
}

function getQueryValue(query, key) {
  const value = query?.[key];
  if (Array.isArray(value)) {
    return value[0] || '';
  }
  return typeof value === 'string' ? value : '';
}

const apiLogSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now, index: true },
  githubUsername: { type: String, index: true },
  referer: String,
  userAgent: String,
  ip: String,
  endpoint: String,
  queryParams: {
    username: String,
    theme: String,
    leetcode: String,
    codeforces: String,
    codechef: String,
    align: String,
    hide_trophies: String,
  },
}, {
  collection: 'api_logs',
});

const ApiLog = mongoose.models.ApiLog || mongoose.model('ApiLog', apiLogSchema);

function extractGitHubUsername(referer) {
  if (!referer) return 'unknown';
  const match = referer.match(/github\.com\/([a-zA-Z0-9-]+)/);
  return match ? match[1] : 'unknown';
}

function maskIpAddress(rawIp) {
  return rawIp
    .replace(/(\d+\.\d+\.\d+)\.\d+/, '$1.0')
    .replace(/(:[0-9a-fA-F]{0,4}){2}$/, ':0000:0000');
}

export function buildProfileAnalyticsPayload(req) {
  const referer = req.headers?.referer || req.headers?.referrer || '';
  const githubFromReferer = extractGitHubUsername(referer);
  const username = getQueryValue(req.query, 'username');
  const rawIp = req.ip || req.connection?.remoteAddress || req.socket?.remoteAddress || '';

  return {
    timestamp: new Date(),
    githubUsername: githubFromReferer !== 'unknown' ? githubFromReferer : (username || 'unknown'),
    referer: referer || 'direct',
    userAgent: req.headers?.['user-agent'] || '',
    ip: maskIpAddress(rawIp),
    endpoint: req.path,
    queryParams: {
      username,
      theme: getQueryValue(req.query, 'theme'),
      leetcode: getQueryValue(req.query, 'leetcode'),
      codeforces: getQueryValue(req.query, 'codeforces'),
      codechef: getQueryValue(req.query, 'codechef'),
      align: getQueryValue(req.query, 'align'),
      hide_trophies: getQueryValue(req.query, 'hide_trophies'),
    },
  };
}

export function isAnalyticsAvailable() {
  return analyticsState === 'ready';
}

export async function initializeAnalytics() {
  if (analyticsState !== 'uninitialized') {
    return isAnalyticsAvailable();
  }

  if (analyticsDisabledByEnv()) {
    analyticsState = 'disabled';
    console.info('Analytics disabled by configuration.');
    return false;
  }

  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    analyticsState = 'disabled';
    console.info('Analytics disabled: MONGODB_URI is not configured.');
    return false;
  }

  const dbName = process.env.MONGODB_DB || undefined;
  analyticsState = 'connecting';

  connectingPromise = mongoose.connect(mongoUri, {
    dbName,
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 10000,
  }).then(() => {
    analyticsState = 'ready';
    connectingPromise = null;
    console.info(`Analytics enabled (MongoDB db: ${mongoose.connection.db.databaseName}).`);
    return true;
  }).catch((error) => {
    analyticsState = 'unavailable';
    connectingPromise = null;
    console.error('Analytics unavailable:', error?.message || error);
    return false;
  });

  return connectingPromise;
}

export async function trackProfileRequest(req) {
  try {
    const payload = buildProfileAnalyticsPayload(req);

    if (analyticsState === 'uninitialized') {
      await initializeAnalytics();
    } else if (connectingPromise) {
      await connectingPromise;
    }

    if (!isAnalyticsAvailable()) {
      return;
    }

    const savePromise = new ApiLog(payload).save();
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Analytics save timeout')), 8000);
    });

    await Promise.race([savePromise, timeoutPromise]);
  } catch (error) {
    console.error('Analytics write failed:', error?.message || error);
  }
}

export async function closeAnalytics() {
  if (mongoose.connection.readyState === 1) {
    await mongoose.connection.close();
    analyticsState = 'uninitialized';
  }
}
