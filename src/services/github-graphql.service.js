// GitHub GraphQL API Service - Contribution Calendar & Streaks

import { githubCache } from "../utils/cache.js";
import { loadConfig } from "../config/index.js";
import { HttpErrorCode, httpRequest } from "../utils/http-client.js";

const GITHUB_GRAPHQL_URL = "https://api.github.com/graphql";

/* authorization headers for GraphQL API*/
function getHeaders() {
  const config = loadConfig();
  const headers = {
    "Content-Type": "application/json",
    "User-Agent": "samdev-pulse",
  };

  if (config.github.token) {
    headers["Authorization"] = `Bearer ${config.github.token}`;
  }

  return headers;
}

/* GraphQL query for contribution calendar and additional stats */
const CONTRIBUTION_QUERY = `
query($username: String!) {
  user(login: $username) {
    createdAt
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

/* fetch contribution data from GitHub GraphQL API */
async function fetchContributionData(username) {
  if (!loadConfig().github.enabled) {
    throw new Error("GITHUB_TOKEN required for contribution data");
  }

  const response = await httpRequest(GITHUB_GRAPHQL_URL, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({
      query: CONTRIBUTION_QUERY,
      variables: { username },
    }),
  });

  if (!response.success) {
    if (response.error?.code === HttpErrorCode.TIMEOUT) {
      throw new Error("GitHub GraphQL API timeout");
    }
    if (response.error?.code === HttpErrorCode.INVALID_JSON) {
      throw new Error("GitHub GraphQL API returned invalid JSON");
    }
    if (response.status === 403 || response.status === 429) {
      throw new Error("GitHub API rate limit exceeded");
    }
    throw new Error(`GitHub GraphQL API error: ${response.status || 0}`);
  }

  // handles rate limits silently
  const rateLimitRemaining = response.headers?.get("x-ratelimit-remaining");
  if (rateLimitRemaining && parseInt(rateLimitRemaining, 10) < 10) {
    // rate limit warning suppressed for production
  }

  const json = response.data;

  if (json.errors) {
    throw new Error(json.errors[0]?.message || "GraphQL query failed");
  }

  return json.data?.user;
}

/* flatten contribution calendar weeks into a sorted array of days */
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

  // sort by date ascending
  days.sort((a, b) => a.date.localeCompare(b.date));
  return days;
}

/* calculate current streak (consecutive days with contributions ending today or yesterday) */
function calculateCurrentStreak(days) {
  if (days.length === 0) return 0;

  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

  let streak = 0;
  let foundStart = false;

  // backwards from most recent day
  for (let i = days.length - 1; i >= 0; i--) {
    const day = days[i];

    // counts only if today or yesterday has contributions
    if (!foundStart) {
      if (day.date === today || day.date === yesterday) {
        if (day.count > 0) {
          foundStart = true;
          streak = 1;
        } else if (day.date === today) {
          // today has no contributions, check yesterday
          continue;
        } else {
          // yesterday has no contributions, streak is 0
          break;
        }
      }
      continue;
    }

    // continues counting consecutive days
    if (day.count > 0) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

/* longest streak in the contribution history */
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

/* calculate total contribution days */
function calculateTotalContributionDays(days) {
  return days.filter((day) => day.count > 0).length;
}

/* normalize contribution data into a clean object */
function normalizeContributionData(userData) {
  const collection = userData?.contributionsCollection;
  const calendar = collection?.contributionCalendar;
  const days = flattenContributionDays(calendar);

  return {
    totalContributions: calendar?.totalContributions || 0,
    currentStreak: calculateCurrentStreak(days),
    longestStreak: calculateLongestStreak(days),
    totalContributionDays: calculateTotalContributionDays(days),
    totalCommits: collection?.totalCommitContributions || 0,
    totalPRs: collection?.totalPullRequestContributions || 0,
    totalReviews: collection?.totalPullRequestReviewContributions || 0,
    totalIssues: collection?.totalIssueContributions || 0,
    prsMerged: userData?.pullRequests?.totalCount || 0,
    issuesClosed: userData?.issues?.totalCount || 0,
    days,
  };
}

/* Fetch calendars for all years using dynamic aliases */
async function fetchAllYearsData(username, startYear, endYear) {
  let queryFields = "";
  for (let y = startYear; y <= endYear; y++) {
    queryFields += `
      y${y}: contributionsCollection(from: "${y}-01-01T00:00:00Z", to: "${y}-12-31T23:59:59Z") {
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
    `;
  }

  const query = `
    query($username: String!) {
      user(login: $username) {
        ${queryFields}
      }
    }
  `;

  const response = await httpRequest(GITHUB_GRAPHQL_URL, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({
      query,
      variables: { username },
    }),
  });

  if (!response.success) {
    throw new Error(`GitHub GraphQL API error when fetching multi-year data: ${response.status || 0}`);
  }

  const json = response.data;
  if (json.errors) {
    throw new Error(json.errors[0]?.message || "GraphQL query for multi-year data failed");
  }

  return json.data?.user;
}

/* normalize multi-year contribution data */
function normalizeMultiYearData(userData, initialUserData, startYear, currentYear) {
  let totalContributions = 0;
  let totalCommits = 0;
  let totalPRs = 0;
  let totalReviews = 0;
  let totalIssues = 0;
  let allDays = [];

  for (let y = startYear; y <= currentYear; y++) {
    const collection = userData[`y${y}`];
    if (!collection) continue;

    totalCommits += collection.totalCommitContributions || 0;
    totalPRs += collection.totalPullRequestContributions || 0;
    totalReviews += collection.totalPullRequestReviewContributions || 0;
    totalIssues += collection.totalIssueContributions || 0;

    const calendar = collection.contributionCalendar;
    if (calendar) {
      totalContributions += calendar.totalContributions || 0;
      const days = flattenContributionDays(calendar);
      allDays.push(...days);
    }
  }

  // sort days to ensure chronological order for streak calculation
  allDays.sort((a, b) => a.date.localeCompare(b.date));

  return {
    totalContributions,
    currentStreak: calculateCurrentStreak(allDays),
    longestStreak: calculateLongestStreak(allDays),
    totalContributionDays: calculateTotalContributionDays(allDays),
    totalCommits,
    totalPRs,
    totalReviews,
    totalIssues,
    prsMerged: initialUserData?.pullRequests?.totalCount || 0,
    issuesClosed: initialUserData?.issues?.totalCount || 0,
    days: allDays,
  };
}

/* fetch and normalize contribution data for a user */
export async function getContributionData(username, createdAt = null) {
  const cacheKey = `contributions:${username}`;

  // check cache first
  const cached = githubCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const userData = await fetchContributionData(username);

    if (!userData) {
      return {
        success: false,
        error: "User not found or no contribution data",
      };
    }

    const userCreatedAt = createdAt || userData.createdAt;
    const currentYear = new Date().getFullYear();
    const startYear = userCreatedAt ? new Date(userCreatedAt).getFullYear() : null;

    let resultData;

    // if the user has contribution history in previous years, fetch them
    if (userCreatedAt && startYear && startYear < currentYear) {
      const multiYearData = await fetchAllYearsData(username, startYear, currentYear);
      resultData = normalizeMultiYearData(multiYearData, userData, startYear, currentYear);
    } else {
      resultData = normalizeContributionData(userData);
    }

    const result = {
      success: true,
      data: resultData,
    };

    // store in cache
    githubCache.set(cacheKey, result);

    return result;
  } catch (error) {
    return {
      success: false,
      error: error.message || "Failed to fetch contribution data",
    };
  }
}
