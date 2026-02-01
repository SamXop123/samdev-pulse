// GitHub GraphQL API Service - Contribution Calendar & Streaks

import { githubCache } from '../utils/cache.js';

const GITHUB_GRAPHQL_URL = 'https://api.github.com/graphql';

/**
 * Get authorization headers for GraphQL API (token required)
 */
function getHeaders() {
  const headers = {
    'Content-Type': 'application/json',
    'User-Agent': 'samdev-pulse',
  };

  if (process.env.GITHUB_TOKEN) {
    headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  return headers;
}

/**
 * GraphQL query for contribution calendar and additional stats
 */
const CONTRIBUTION_QUERY = `
query($username: String!) {
  user(login: $username) {
    contributionsCollection {
      totalCommitContributions
      totalPullRequestContributions
      totalPullRequestReviewContributions
      totalIssueContributions
      restrictedContributionsCount
      contributionCalendar {
        totalContributions
        weeks {
          contributionDays {
            contributionCount
            date
          }
        }
      }
    }
    pullRequests(states: MERGED) {
      totalCount
    }
    issues(states: CLOSED) {
      totalCount
    }
  }
}
`;

/**
 * Fetch contribution data from GitHub GraphQL API
 */
async function fetchContributionData(username) {
  if (!process.env.GITHUB_TOKEN) {
    throw new Error('GITHUB_TOKEN required for contribution data');
  }

  const response = await fetch(GITHUB_GRAPHQL_URL, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({
      query: CONTRIBUTION_QUERY,
      variables: { username },
    }),
  });

  // Handle rate limits silently (no console noise in production)
  const rateLimitRemaining = response.headers.get('x-ratelimit-remaining');
  if (rateLimitRemaining && parseInt(rateLimitRemaining, 10) < 10) {
    // Rate limit warning suppressed for production
  }

  if (!response.ok) {
    if (response.status === 403) {
      throw new Error('GitHub API rate limit exceeded');
    }
    throw new Error(`GitHub GraphQL API error: ${response.status}`);
  }

  const json = await response.json();

  if (json.errors) {
    throw new Error(json.errors[0]?.message || 'GraphQL query failed');
  }

  return json.data?.user;
}

/**
 * Flatten contribution calendar weeks into a sorted array of days
 */
function flattenContributionDays(calendar) {
  if (!calendar?.weeks) return [];

  const days = [];
  for (const week of calendar.weeks) {
    for (const day of week.contributionDays) {
      days.push({
        date: day.date,
        count: day.contributionCount,
      });
    }
  }

  // Sort by date ascending
  days.sort((a, b) => a.date.localeCompare(b.date));
  return days;
}

/**
 * Calculate current streak (consecutive days with contributions ending today or yesterday)
 */
function calculateCurrentStreak(days) {
  if (days.length === 0) return 0;

  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  let streak = 0;
  let foundStart = false;

  // Iterate backwards from most recent day
  for (let i = days.length - 1; i >= 0; i--) {
    const day = days[i];

    // Start counting only if today or yesterday has contributions
    if (!foundStart) {
      if (day.date === today || day.date === yesterday) {
        if (day.count > 0) {
          foundStart = true;
          streak = 1;
        } else if (day.date === today) {
          // Today has no contributions, check yesterday
          continue;
        } else {
          // Yesterday has no contributions, streak is 0
          break;
        }
      }
      continue;
    }

    // Continue counting consecutive days
    if (day.count > 0) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Calculate longest streak in the contribution history
 */
function calculateLongestStreak(days) {
  if (days.length === 0) return 0;

  let longest = 0;
  let current = 0;

  for (const day of days) {
    if (day.count > 0) {
      current++;
      longest = Math.max(longest, current);
    } else {
      current = 0;
    }
  }

  return longest;
}

/**
 * Calculate total contribution days
 */
function calculateTotalContributionDays(days) {
  return days.filter((day) => day.count > 0).length;
}

/**
 * Normalize contribution data into a clean object
 */
function normalizeContributionData(userData) {
  const collection = userData?.contributionsCollection;
  const calendar = collection?.contributionCalendar;
  const days = flattenContributionDays(calendar);

  return {
    totalContributions: calendar?.totalContributions || 0,
    currentStreak: calculateCurrentStreak(days),
    longestStreak: calculateLongestStreak(days),
    totalContributionDays: calculateTotalContributionDays(days),
    // Additional stats
    totalCommits: collection?.totalCommitContributions || 0,
    totalPRs: collection?.totalPullRequestContributions || 0,
    totalIssues: collection?.totalIssueContributions || 0,
    prsMerged: userData?.pullRequests?.totalCount || 0,
    issuesClosed: userData?.issues?.totalCount || 0,
    days,
  };
}

/**
 * Fetch and normalize contribution data for a user
 */
export async function getContributionData(username) {
  const cacheKey = `contributions:${username}`;

  // Check cache first
  const cached = githubCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const userData = await fetchContributionData(username);

    if (!userData) {
      return {
        success: false,
        error: 'User not found or no contribution data',
      };
    }

    const result = {
      success: true,
      data: normalizeContributionData(userData),
    };

    // Store in cache
    githubCache.set(cacheKey, result);

    return result;
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to fetch contribution data',
    };
  }
}

