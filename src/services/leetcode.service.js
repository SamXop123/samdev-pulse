// LeetCode Service - Fetch competitive coding stats

import { githubCache } from '../utils/cache.js';

const LEETCODE_API_URL = 'https://leetcode-stats-api.herokuapp.com';

/**
 * Fetch LeetCode stats for a user
 * Uses a public stats API that doesn't require authentication
 */
async function fetchLeetCodeStats(username) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000); // 5 second timeout

  try {
    const response = await fetch(`${LEETCODE_API_URL}/${username}`, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'samdev-pulse',
      },
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('LeetCode user not found');
      }
      throw new Error(`LeetCode API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.status === 'error') {
      throw new Error(data.message || 'Failed to fetch LeetCode data');
    }

    return data;
  } catch (error) {
    clearTimeout(timeout);
    if (error.name === 'AbortError') {
      throw new Error('LeetCode API timeout');
    }
    throw error;
  }
}

/**
 * Normalize LeetCode data into a clean object
 */
function normalizeLeetCodeData(data) {
  return {
    totalSolved: data.totalSolved || 0,
    easySolved: data.easySolved || 0,
    mediumSolved: data.mediumSolved || 0,
    hardSolved: data.hardSolved || 0,
    acceptanceRate: data.acceptanceRate ? parseFloat(data.acceptanceRate) : 0,
    ranking: data.ranking || 0,
    contributionPoints: data.contributionPoints || 0,
  };
}

/**
 * Fetch and normalize LeetCode data for a user
 * Returns graceful failure if API is down
 */
export async function getLeetCodeData(username) {
  if (!username) {
    return {
      success: false,
      error: 'LeetCode username not provided',
    };
  }

  const cacheKey = `leetcode:${username}`;

  // Check cache first
  const cached = githubCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const data = await fetchLeetCodeStats(username);

    const result = {
      success: true,
      data: normalizeLeetCodeData(data),
    };

    // Store in cache
    githubCache.set(cacheKey, result);

    return result;
  } catch (error) {
    // Return graceful failure - don't block dashboard
    return {
      success: false,
      error: error.message || 'Failed to fetch LeetCode data',
    };
  }
}

