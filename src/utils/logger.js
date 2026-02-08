import mongoose from 'mongoose';

let isConnected = false;
let connectionAttempted = false;
let connectingPromise = null;

async function connectToDatabase() {
  if (mongoose.connection.readyState === 1) {
    return true; // already connected
  }

  if (connectingPromise) {
    return connectingPromise; // reuse in-flight attempt
  }

  const mongoUri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB || undefined; // set a db name to avoid admin/local

  if (!mongoUri) {
    console.error('❌ MONGODB_URI is not set');
    return false;
  }

  console.log(`ℹ️  Connecting to MongoDB (db: ${dbName || 'from-URI'}, state: ${mongoose.connection.readyState})`);

  connectingPromise = mongoose.connect(mongoUri, {
    dbName,
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 10000,
  }).then(() => {
    console.log(`✅ MongoDB connected for logging (db: ${mongoose.connection.db.databaseName})`);
    connectingPromise = null;
    return true;
  }).catch((error) => {
    console.error('❌ MongoDB connection failed:', error?.message || error);
    connectingPromise = null;
    return false;
  });

  return connectingPromise;
}

const logSchema = new mongoose.Schema({
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
    align: String,
  },
}, {
  collection: 'api_logs'
});

const ApiLog = mongoose.models.ApiLog || mongoose.model('ApiLog', logSchema);

function extractGitHubUsername(referer) {
  if (!referer) return 'unknown';
  const match = referer.match(/github\.com\/([a-zA-Z0-9-]+)/);
  return match ? match[1] : 'unknown';
}

export async function logApiAccess(req) {
  if (!process.env.MONGODB_URI) {
    console.warn('⚠️ MONGODB_URI not configured, skipping logs');
    return;
  }

  try {
    console.log('📝 Attempting to log API access...');
    console.log(`🔍 MONGODB_URI present: ${Boolean(process.env.MONGODB_URI)}, DB: ${process.env.MONGODB_DB || 'default-from-URI'}`);
    const connected = await connectToDatabase();

    if (!connected) {
      console.error('❌ Failed to connect to MongoDB');
      return;
    }

    const referer = req.headers['referer'] || req.headers['referrer'] || '';
    const userAgent = req.headers['user-agent'] || '';
    const ip = req.ip || req.connection?.remoteAddress || req.socket?.remoteAddress || '';

    const githubFromReferer = extractGitHubUsername(referer);
    const githubUsername = githubFromReferer !== 'unknown' ? githubFromReferer : (req.query.username || 'unknown');
    const safeReferer = referer || 'direct';

    const logEntry = new ApiLog({
      timestamp: new Date(),
      githubUsername,
      referer: safeReferer,
      userAgent: userAgent,
      ip: ip,
      endpoint: req.path,
      queryParams: {
        username: req.query.username || '',
        theme: req.query.theme || '',
        leetcode: req.query.leetcode || '',
        align: req.query.align || '',
      },
    });

    const savePromise = logEntry.save();
    const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Log save timeout')), 8000)
    );

    await Promise.race([savePromise, timeoutPromise]).catch(err => {
      console.error('Failed to save log:', err.message);
    });
    console.log(`✅ [LOG] Saved: ${logEntry.githubUsername} → ${req.query.username}`);

  } catch (error) {
    console.error('❌ Failed to save log:', error.message);
  }
}

export async function closeDatabase() {
  if (isConnected) {
    await mongoose.connection.close();
    isConnected = false;
    console.log('MongoDB connection closed');
  }
}
