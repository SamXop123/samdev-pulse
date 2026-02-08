import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Log Schema (same as in logger.js)
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

const ApiLog = mongoose.model('ApiLog', logSchema);

// Connect to MongoDB
async function connectToDatabase() {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    console.error('❌ MONGODB_URI not set in .env file');
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected\n');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
}

// Query functions
async function showRecentLogs(limit = 20) {
  console.log(`\n📊 Recent ${limit} API Accesses:\n`);
  const logs = await ApiLog.find()
    .sort({ timestamp: -1 })
    .limit(limit);

  if (logs.length === 0) {
    console.log('No logs found.');
    return;
  }

  logs.forEach((log, index) => {
    console.log(`${index + 1}. [${log.timestamp.toISOString()}]`);
    console.log(`   GitHub User: ${log.githubUsername}`);
    console.log(`   Requested: ${log.queryParams.username || 'N/A'}`);
    console.log(`   Theme: ${log.queryParams.theme || 'default'}`);
    console.log(`   LeetCode: ${log.queryParams.leetcode || 'N/A'}`);
    console.log(`   Referer: ${log.referer || 'Direct'}`);
    console.log('');
  });
}

async function showUniqueUsers() {
  console.log('\n👥 Unique GitHub Users Using Your SVG:\n');

  const users = await ApiLog.aggregate([
    { $match: { githubUsername: { $ne: 'unknown' } } },
    {
      $group: {
        _id: '$githubUsername',
        count: { $sum: 1 },
        lastAccess: { $max: '$timestamp' }
      }
    },
    { $sort: { count: -1 } }
  ]);

  if (users.length === 0) {
    console.log('No users found yet.');
    return;
  }

  users.forEach((user, index) => {
    console.log(`${index + 1}. ${user._id}`);
    console.log(`   Requests: ${user.count}`);
    console.log(`   Last Access: ${user.lastAccess.toISOString()}`);
    console.log('');
  });

  console.log(`\nTotal unique users: ${users.length}`);
}

async function showThemeStats() {
  console.log('\n🎨 Theme Usage Statistics:\n');

  const themes = await ApiLog.aggregate([
    {
      $group: {
        _id: '$queryParams.theme',
        count: { $sum: 1 }
      }
    },
    { $sort: { count: -1 } }
  ]);

  themes.forEach((theme, index) => {
    const themeName = theme._id || 'default (dark)';
    console.log(`${index + 1}. ${themeName}: ${theme.count} requests`);
  });
}

async function showTotalStats() {
  console.log('\n📈 Overall Statistics:\n');

  const totalRequests = await ApiLog.countDocuments();
  const uniqueUsers = await ApiLog.distinct('githubUsername');
  const uniqueUserCount = uniqueUsers.filter(u => u !== 'unknown').length;

  const oldestLog = await ApiLog.findOne().sort({ timestamp: 1 });
  const newestLog = await ApiLog.findOne().sort({ timestamp: -1 });

  console.log(`Total API Requests: ${totalRequests}`);
  console.log(`Unique Users: ${uniqueUserCount}`);

  if (oldestLog && newestLog) {
    console.log(`First Request: ${oldestLog.timestamp.toISOString()}`);
    console.log(`Latest Request: ${newestLog.timestamp.toISOString()}`);
  }
}

// Main function
async function main() {
  await connectToDatabase();

  const command = process.argv[2] || 'stats';

  switch (command) {
    case 'recent':
      const limit = parseInt(process.argv[3]) || 20;
      await showRecentLogs(limit);
      break;

    case 'users':
      await showUniqueUsers();
      break;

    case 'themes':
      await showThemeStats();
      break;

    case 'stats':
      await showTotalStats();
      await showThemeStats();
      break;

    default:
      console.log('\nUsage:');
      console.log('  node src/utils/view-logs.js stats    - Show overall statistics');
      console.log('  node src/utils/view-logs.js recent [n] - Show recent n logs (default 20)');
      console.log('  node src/utils/view-logs.js users    - Show unique users');
      console.log('  node src/utils/view-logs.js themes   - Show theme usage');
  }

  await mongoose.connection.close();
  console.log('\n✅ Done\n');
  process.exit(0);
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
