import mongoose from 'mongoose';

let isConnected = false;
let connectionAttempted = false;

async function connectToDatabase() {
  if (isConnected) {
    return true;
  }

  if (connectionAttempted) {
    return false;
  }

  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    console.error('❌ MONGODB_URI is not set');
    connectionAttempted = true;
    return false;
  }

  connectionAttempted = true;

  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 5000,
    });
    isConnected = true;
    console.log('✅ MongoDB connected for logging');
    return true;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    isConnected = false;
    connectionAttempted = false; // Reset to retry on next attempt
    return false;
  }
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
    const connected = await connectToDatabase();

    if (!connected) {
      console.error('❌ Failed to connect to MongoDB');
      return;
    }

    const referer = req.headers['referer'] || req.headers['referrer'] || '';
    const userAgent = req.headers['user-agent'] || '';
    const ip = req.ip || req.connection?.remoteAddress || req.socket?.remoteAddress || '';

    const logEntry = new ApiLog({
      timestamp: new Date(),
      githubUsername: extractGitHubUsername(referer),
      referer: referer,
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
        setTimeout(() => reject(new Error('Log save timeout')), 3000)
    );

    await Promise.race([savePromise, timeoutPromise]);
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
