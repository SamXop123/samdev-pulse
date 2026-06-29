import { afterEach, beforeEach, describe, expect, jest, test } from '@jest/globals';
import { getLeetCodeData } from '../leetcode.service.js';
import { githubCache } from '../../utils/cache.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function jsonResponse(data, init = {}) {
  const status = init.status ?? 200;
  return {
    ok: status >= 200 && status < 300,
    status,
    url: init.url || 'https://leetcode.com/graphql',
    headers: init.headers || { get: () => null },
    json: async () => data,
    text: async () => JSON.stringify(data),
    arrayBuffer: async () => new ArrayBuffer(0),
  };
}

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const FULL_RESPONSE = {
  data: {
    matchedUser: {
      username: 'leet-user',
      profile: { ranking: 12345 },
      submitStats: {
        acSubmissionNum: [
          { difficulty: 'All', count: 150 },
          { difficulty: 'Easy', count: 80 },
          { difficulty: 'Medium', count: 60 },
          { difficulty: 'Hard', count: 10 },
        ],
      },
    },
    userContestRanking: {
      rating: 1650.3,
      globalRanking: 5000,
      attendedContestsCount: 12,
    },
  },
};

const MINIMAL_RESPONSE = {
  data: {
    matchedUser: {
      username: 'leet-min',
      profile: { ranking: 0 },
      submitStats: {
        acSubmissionNum: [],
      },
    },
    // no userContestRanking
  },
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('leetcode.service.js', () => {
  beforeEach(() => {
    githubCache.clear();
  });

  afterEach(() => {
    delete globalThis.fetch;
  });

  // --- Happy path ---

  test('returns normalized data on successful response', async () => {
    globalThis.fetch = jest.fn().mockResolvedValueOnce(jsonResponse(FULL_RESPONSE));

    const result = await getLeetCodeData('leet-user');

    expect(result).toEqual({
      success: true,
      data: {
        totalSolved: 150,
        easySolved: 80,
        mediumSolved: 60,
        hardSolved: 10,
        ranking: 12345,
        contestRating: 1650,
        globalRanking: 5000,
        contestsAttended: 12,
      },
    });
  });

  test('handles missing contest data gracefully', async () => {
    globalThis.fetch = jest.fn().mockResolvedValueOnce(jsonResponse(MINIMAL_RESPONSE));

    const result = await getLeetCodeData('leet-min');

    expect(result).toEqual({
      success: true,
      data: {
        totalSolved: 0,
        easySolved: 0,
        mediumSolved: 0,
        hardSolved: 0,
        ranking: 0,
        contestRating: null,
        globalRanking: null,
        contestsAttended: 0,
      },
    });
  });

  test('handles missing submissions array', async () => {
    globalThis.fetch = jest.fn().mockResolvedValueOnce(jsonResponse({
      data: {
        matchedUser: {
          username: 'no-subs',
          profile: { ranking: 999 },
          // no submitStats
        },
        userContestRanking: null,
      },
    }));

    const result = await getLeetCodeData('no-subs');

    expect(result.success).toBe(true);
    expect(result.data.totalSolved).toBe(0);
    expect(result.data.ranking).toBe(999);
  });

  // --- Error paths ---

  test('returns error when username is not provided', async () => {
    const result = await getLeetCodeData('');
    expect(result).toEqual({
      success: false,
      error: 'LeetCode username not provided',
    });
  });

  test('returns error when username is null', async () => {
    const result = await getLeetCodeData(null);
    expect(result).toEqual({
      success: false,
      error: 'LeetCode username not provided',
    });
  });

  test('returns error when user is not found (matchedUser is null)', async () => {
    globalThis.fetch = jest.fn().mockResolvedValueOnce(jsonResponse({
      data: {
        matchedUser: null,
        userContestRanking: null,
      },
    }));

    const result = await getLeetCodeData('unknown');
    expect(result).toEqual({
      success: false,
      error: 'LeetCode user not found',
    });
  });

  test('returns error on GraphQL errors', async () => {
    globalThis.fetch = jest.fn().mockResolvedValueOnce(jsonResponse({
      errors: [{ message: 'Something went wrong' }],
    }));

    const result = await getLeetCodeData('error-user');
    expect(result).toEqual({
      success: false,
      error: 'Something went wrong',
    });
  });

  test('returns error on HTTP failure', async () => {
    globalThis.fetch = jest.fn().mockResolvedValueOnce(jsonResponse(
      { errors: [{ message: 'Not Found' }] },
      { status: 404 },
    ));

    const result = await getLeetCodeData('missing');
    expect(result.success).toBe(false);
  });

  test('returns error on network failure', async () => {
    globalThis.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

    const result = await getLeetCodeData('anyone');
    expect(result.success).toBe(false);
    expect(result.error).toBe('LeetCode API error: 0');
  });

  test('returns timeout error on AbortError', async () => {
    const abortError = new Error('The operation was aborted');
    abortError.name = 'AbortError';
    globalThis.fetch = jest.fn().mockRejectedValue(abortError);

    const result = await getLeetCodeData('anyone');
    expect(result).toEqual({
      success: false,
      error: 'LeetCode API timeout',
    });
  });

  test('returns error on invalid JSON response', async () => {
    globalThis.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      status: 200,
      url: 'https://leetcode.com/graphql',
      headers: { get: () => null },
      json: async () => { throw new SyntaxError('Unexpected token'); },
      text: async () => 'not json',
      arrayBuffer: async () => new ArrayBuffer(0),
    });

    const result = await getLeetCodeData('bad-json');
    expect(result).toEqual({
      success: false,
      error: 'LeetCode API returned invalid JSON',
    });
  });

  // --- Caching ---

  test('caches successful result and returns cached data on repeated call', async () => {
    const mockFetch = jest.fn().mockResolvedValueOnce(jsonResponse(FULL_RESPONSE));
    globalThis.fetch = mockFetch;

    // First call — should hit the API
    const first = await getLeetCodeData('leet-user');
    expect(first.success).toBe(true);
    expect(mockFetch).toHaveBeenCalledTimes(1);

    // Second call — should come from cache
    const second = await getLeetCodeData('leet-user');
    expect(second).toEqual(first);
    expect(mockFetch).toHaveBeenCalledTimes(1); // no additional fetch
  });

  test('does not cache error responses', async () => {
    globalThis.fetch = jest.fn()
      .mockResolvedValueOnce(jsonResponse({
        data: { matchedUser: null, userContestRanking: null },
      }))
      .mockResolvedValueOnce(jsonResponse(FULL_RESPONSE));

    const first = await getLeetCodeData('unknown');
    expect(first.success).toBe(false);

    // If error were cached, a second call with wrong user would also fail
    // But since errors aren't cached, we can't test that directly.
    // Instead verify cache does NOT contain the key.
    expect(githubCache.get('leetcode:unknown')).toBeNull();
  });

  test('caches different users separately', async () => {
    globalThis.fetch = jest.fn()
      .mockResolvedValueOnce(jsonResponse(FULL_RESPONSE))
      .mockResolvedValueOnce(jsonResponse(MINIMAL_RESPONSE));

    const user1 = await getLeetCodeData('leet-user');
    const user2 = await getLeetCodeData('leet-min');

    expect(user1.success).toBe(true);
    expect(user2.success).toBe(true);

    // Verify cache keys are separate
    expect(githubCache.get('leetcode:leet-user')).not.toBeNull();
    expect(githubCache.get('leetcode:leet-min')).not.toBeNull();
    expect(user1.data.totalSolved).toBe(150);
    expect(user2.data.totalSolved).toBe(0);
  });
});
