// LeetCode Service

import { githubCache } from '../utils/cache.js';
import { HttpErrorCode, httpRequest } from '../utils/http-client.js';

const LEETCODE_GRAPHQL_URL = 'https://leetcode.com/graphql';

/* graphQL query for LC user stats */
const USER_STATS_QUERY = `
query getUserProfile($username: String!) {
  matchedUser(username: $username) {
    username
    profile {
      ranking
    }
    submitStats {
      acSubmissionNum {
        difficulty
        count
      }
    }
  }
  userContestRanking(username: $username) {
    rating
    globalRanking
    attendedContestsCount
  }
}
`;

/* fetch LC stats using graphQL api */
async function fetchLeetCodeStats(username) {
  const response = await httpRequest(LEETCODE_GRAPHQL_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Origin': 'https://leetcode.com',
      'Referer': 'https://leetcode.com',
    },
    body: JSON.stringify({
      query: USER_STATS_QUERY,
      variables: { username },
    }),
  });

  if (!response.success) {
    if (response.error?.code === HttpErrorCode.TIMEOUT) {
      throw new Error('LeetCode API timeout');
    }
    if (response.error?.code === HttpErrorCode.INVALID_JSON) {
      throw new Error('LeetCode API returned invalid JSON');
    }
    throw new Error(`LeetCode API error: ${response.status || 0}`);
  }

  const json = response.data;

  if (json.errors) {
    throw new Error(json.errors[0]?.message || 'GraphQL query failed');
  }

  if (!json.data?.matchedUser) {
    throw new Error('LeetCode user not found');
  }

  return json.data;
}

/* normalize LC data into a clean object */
function normalizeLeetCodeData(data) {
  const user = data.matchedUser;
  const contestData = data.userContestRanking;

  // extract solved counts by difficulty
  const submissions = user?.submitStats?.acSubmissionNum || [];
  const getCount = (difficulty) => {
    const item = submissions.find(s => s.difficulty === difficulty);
    return item?.count || 0;
  };

  const easySolved = getCount('Easy');
  const mediumSolved = getCount('Medium');
  const hardSolved = getCount('Hard');
  const totalSolved = getCount('All');

  return {
    totalSolved,
    easySolved,
    mediumSolved,
    hardSolved,
    ranking: user?.profile?.ranking || 0,
    // contest data
    contestRating: contestData?.rating ? Math.round(contestData.rating) : null,
    globalRanking: contestData?.globalRanking || null,
    contestsAttended: contestData?.attendedContestsCount || 0,
  };
}

/* fetch and normalize LC data for a user */
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

    // store in cache
    githubCache.set(cacheKey, result);

    return result;
  } catch (error) {
    // return failure without error so that dashboard do not block
    return {
      success: false,
      error: error.message || 'Failed to fetch LeetCode data',
    };
  }
}
