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

// create model
const ApiLog = mongoose.models.ApiLog || mongoose.model('ApiLog', logSchema);

// extract GitHub username from referer URL
function extractGitHubUsername(referer) {
  if (!referer) return 'unknown';

  // match github profile URLs
  const match = referer.match(/github\.com\/([a-zA-Z0-9-]+)/);
  return match ? match[1] : 'unknown';
}

// main logging function
export async function logApiAccess(req) {
  if (!process.env.MONGODB_URI) {
    return;
  }

  try {
    const connected = await connectToDatabase();

    if (!connected) {
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

    // set a timeout for the save operation to prevent buffering issues
    const savePromise = logEntry.save();
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Log save timeout')), 3000)
    );

    await Promise.race([savePromise, timeoutPromise]).catch(err => {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Failed to save log:', err.message);
      }
    });

    if (process.env.NODE_ENV !== 'production') {
      console.log(`[LOG] API Access: ${logEntry.githubUsername} → ${req.query.username}`);
    }
  } catch (error) {
    // silently fail - logging should never break main functionality
  }
}

// cleanup function for graceful shutdown
export async function closeDatabase() {
  if (isConnected) {
    await mongoose.connection.close();
    isConnected = false;
    console.log('MongoDB connection closed');
  }
}
