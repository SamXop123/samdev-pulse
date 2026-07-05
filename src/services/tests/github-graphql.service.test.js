import { afterEach, beforeEach, describe, expect, jest, test } from '@jest/globals';
import { getContributionData } from '../github-graphql.service.js';
import { githubCache } from '../../utils/cache.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function jsonResponse(data, init = {}) {
  const status = init.status ?? 200;
  return {
    ok: status >= 200 && status < 300,
    status,
    url: init.url || 'https://api.github.com/graphql',
    headers: init.headers || { get: () => null },
    json: async () => data,
    text: async () => JSON.stringify(data),
    arrayBuffer: async () => new ArrayBuffer(0),
  };
}

// ---------------------------------------------------------------------------
// Fixtures — using fixed date 2026-06-13 (today) so streaks are deterministic
// ---------------------------------------------------------------------------

// Build a contribution calendar with 4 weeks of data ending 2026-06-13
function buildCalendar(dailyCounts, startDate = '2026-05-16') {
  const weeks = [];
  let currentDate = new Date(startDate);
  let weekDays = [];

  for (const count of dailyCounts) {
    const dateStr = currentDate.toISOString().split('T')[0];
    weekDays.push({ contributionCount: count, date: dateStr });
    currentDate.setDate(currentDate.getDate() + 1);

    // Group into weeks (Sunday = 0, but we just chunk by 7)
    if (weekDays.length === 7) {
      weeks.push({ contributionDays: weekDays });
      weekDays = [];
    }
  }

  // Push remaining days as a partial week
  if (weekDays.length > 0) {
    weeks.push({ contributionDays: weekDays });
  }

  return { totalContributions: dailyCounts.reduce((a, b) => a + b, 0), weeks };
}

const FULL_CONTRIBUTION_RESPONSE = {
  data: {
    user: {
      contributionsCollection: {
        totalCommitContributions: 250,
        totalPullRequestContributions: 30,
        totalPullRequestReviewContributions: 15,
        totalIssueContributions: 8,
        restrictedContributionsCount: 2,
        contributionCalendar: (() => {
          const days = [];
          for (let i = 0; i < 28; i++) {
            const d = new Date('2026-05-17');
            d.setDate(d.getDate() + i);
            days.push({ contributionCount: 1, date: d.toISOString().split('T')[0] });
          }
          return buildCalendar(days.map(d => d.contributionCount));
        })(),
      },
      pullRequests: { totalCount: 28 },
      issues: { totalCount: 42 },
    },
  },
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('github-graphql.service.js', () => {
  const originalToken = process.env.GITHUB_TOKEN;

  beforeAll(() => {
    // Required for the service to make API calls
    process.env.GITHUB_TOKEN = process.env.GITHUB_TOKEN || 'test-token';
  });

  afterAll(() => {
    if (originalToken === undefined) {
      delete process.env.GITHUB_TOKEN;
    } else {
      process.env.GITHUB_TOKEN = originalToken;
    }
  });

  beforeEach(() => {
    githubCache.clear();
    jest.useFakeTimers({ now: new Date('2026-06-13T12:00:00Z') });
  });

  afterEach(() => {
    delete globalThis.fetch;
    jest.useRealTimers();
  });

  // --- Happy path ---

  test('returns normalized contribution data on successful response', async () => {
    globalThis.fetch = jest.fn().mockResolvedValueOnce(jsonResponse(FULL_CONTRIBUTION_RESPONSE));

    const result = await getContributionData('octocat');

    expect(result.success).toBe(true);
    expect(result.data).toMatchObject({
      totalContributions: expect.any(Number),
      currentStreak: expect.any(Number),
      longestStreak: expect.any(Number),
      totalContributionDays: expect.any(Number),
      totalCommits: 250,
      totalPRs: 30,
      totalReviews: 15,
      totalIssues: 8,
      prsMerged: 28,
      issuesClosed: 42,
    });
    expect(Array.isArray(result.data.days)).toBe(true);
  });

  test('returns accurate streak and contribution calculations', async () => {
    // Build a 28-day calendar ending 2026-06-13
    // Days 0-22:  count = 0
    // Days 23-27: count = 1 (Jun 9 - Jun 13) → current streak of 5
    const dailyCounts = Array.from({ length: 28 }, (_, i) => (i >= 23 ? 1 : 0));
    const totalWithContribs = 5;

    const response = {
      data: {
        user: {
          contributionsCollection: {
            totalCommitContributions: 5,
            totalPullRequestContributions: 0,
            totalPullRequestReviewContributions: 0,
            totalIssueContributions: 0,
            restrictedContributionsCount: 0,
            contributionCalendar: buildCalendar(dailyCounts),
          },
          pullRequests: { totalCount: 0 },
          issues: { totalCount: 0 },
        },
      },
    };

    globalThis.fetch = jest.fn().mockResolvedValueOnce(jsonResponse(response));
    const result = await getContributionData('streak-user');

    expect(result.success).toBe(true);
    // Current streak: last 5 consecutive contributing days (Jun 9-13)
    expect(result.data.currentStreak).toBe(5);
    // Longest streak: same as current since only one block of non-zero
    expect(result.data.longestStreak).toBe(5);
    // Total contributing days
    expect(result.data.totalContributionDays).toBe(totalWithContribs);
  });

  test('returns zero streak when today and yesterday have no contributions', async () => {
    // Build calendar where today (Jun 13) and yesterday (Jun 12) have 0 contributions
    const days = [];
    for (let i = 0; i < 28; i++) {
      const d = new Date('2026-05-17');
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      // Both Jun 12 (index 26) and Jun 13 (index 27) have 0
      days.push({ contributionCount: i >= 26 ? 0 : 1, date: dateStr });
    }

    const response = {
      data: {
        user: {
          contributionsCollection: {
            totalCommitContributions: 26,
            totalPullRequestContributions: 0,
            totalPullRequestReviewContributions: 0,
            totalIssueContributions: 0,
            restrictedContributionsCount: 0,
            contributionCalendar: {
              totalContributions: 26,
              weeks: [{ contributionDays: days }],
            },
          },
          pullRequests: { totalCount: 0 },
          issues: { totalCount: 0 },
        },
      },
    };

    globalThis.fetch = jest.fn().mockResolvedValueOnce(jsonResponse(response));
    const result = await getContributionData('no-streak');

    expect(result.success).toBe(true);
    expect(result.data.currentStreak).toBe(0);
    expect(result.data.totalContributions).toBe(26);
  });

  // --- Error paths ---

  test('throws when GITHUB_TOKEN is not set', async () => {
    const token = process.env.GITHUB_TOKEN;
    delete process.env.GITHUB_TOKEN;

    const result = await getContributionData('anyone');
    expect(result).toEqual({
      success: false,
      error: 'GITHUB_TOKEN required for contribution data',
    });

    process.env.GITHUB_TOKEN = token;
  });

  test('returns error on HTTP failure', async () => {
    globalThis.fetch = jest.fn().mockResolvedValueOnce(jsonResponse(
      { message: 'Not Found' },
      { status: 404 },
    ));

    const result = await getContributionData('unknown');
    expect(result.success).toBe(false);
  });

  test('returns error on GraphQL errors', async () => {
    globalThis.fetch = jest.fn().mockResolvedValueOnce(jsonResponse({
      errors: [{ message: 'Could not resolve to a User' }],
    }));

    const result = await getContributionData('ghost');
    expect(result).toEqual({
      success: false,
      error: 'Could not resolve to a User',
    });
  });

  test('returns error on network failure', async () => {
    globalThis.fetch = jest.fn().mockRejectedValue(new Error('Network failure'));

    const result = await getContributionData('anyone');
    expect(result.success).toBe(false);
    expect(result.error).toBe('GitHub GraphQL API error: 0');
  });

  test('returns timeout error on AbortError', async () => {
    const abortError = new Error('The operation was aborted');
    abortError.name = 'AbortError';
    globalThis.fetch = jest.fn().mockRejectedValue(abortError);

    const result = await getContributionData('anyone');
    expect(result.success).toBe(false);
    expect(result.error).toBe('GitHub GraphQL API timeout');
  });

  test('returns error on rate limit (403)', async () => {
    globalThis.fetch = jest.fn().mockResolvedValueOnce(jsonResponse(
      { message: 'API rate limit exceeded' },
      { status: 403 },
    ));

    const result = await getContributionData('anyone');
    expect(result.success).toBe(false);
    expect(result.error).toBe('GitHub API rate limit exceeded');
  });

  test('returns error on rate limit (429)', async () => {
    globalThis.fetch = jest.fn().mockResolvedValueOnce(jsonResponse(
      { message: 'Too many requests' },
      { status: 429 },
    ));

    const result = await getContributionData('anyone');
    expect(result.success).toBe(false);
    expect(result.error).toBe('GitHub API rate limit exceeded');
  });

  test('returns error on invalid JSON response', async () => {
    globalThis.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      status: 200,
      url: 'https://api.github.com/graphql',
      headers: { get: () => null },
      json: async () => { throw new SyntaxError('Unexpected token'); },
      text: async () => 'not json',
      arrayBuffer: async () => new ArrayBuffer(0),
    });

    const result = await getContributionData('anyone');
    expect(result.success).toBe(false);
    expect(result.error).toBe('GitHub GraphQL API returned invalid JSON');
  });

  test('returns error when user data is null', async () => {
    globalThis.fetch = jest.fn().mockResolvedValueOnce(jsonResponse({
      data: { user: null },
    }));

    const result = await getContributionData('null-user');
    expect(result).toEqual({
      success: false,
      error: 'User not found or no contribution data',
    });
  });

  // --- Edge cases: missing fields ---

  test('handles missing contributions collection gracefully', async () => {
    globalThis.fetch = jest.fn().mockResolvedValueOnce(jsonResponse({
      data: {
        user: {
          // no contributionsCollection
          pullRequests: { totalCount: 0 },
          issues: { totalCount: 0 },
        },
      },
    }));

    const result = await getContributionData('no-contribs');
    expect(result.success).toBe(true);
    expect(result.data.totalContributions).toBe(0);
    expect(result.data.totalCommits).toBe(0);
    expect(result.data.days).toEqual([]);
  });

  test('handles empty contribution calendar weeks', async () => {
    globalThis.fetch = jest.fn().mockResolvedValueOnce(jsonResponse({
      data: {
        user: {
          contributionsCollection: {
            totalCommitContributions: 0,
            totalPullRequestContributions: 0,
            totalPullRequestReviewContributions: 0,
            totalIssueContributions: 0,
            restrictedContributionsCount: 0,
            contributionCalendar: { totalContributions: 0, weeks: [] },
          },
          pullRequests: { totalCount: 0 },
          issues: { totalCount: 0 },
        },
      },
    }));

    const result = await getContributionData('empty');
    expect(result.success).toBe(true);
    expect(result.data.totalContributions).toBe(0);
    expect(result.data.currentStreak).toBe(0);
    expect(result.data.longestStreak).toBe(0);
    expect(result.data.days).toEqual([]);
  });

  // --- Caching ---

  test('caches successful result and returns cached data on repeated call', async () => {
    const mockFetch = jest.fn()
      .mockResolvedValueOnce(jsonResponse(FULL_CONTRIBUTION_RESPONSE));
    globalThis.fetch = mockFetch;

    const first = await getContributionData('octocat');
    expect(first.success).toBe(true);
    expect(mockFetch).toHaveBeenCalledTimes(1);

    // Second call — should be cached
    const second = await getContributionData('octocat');
    expect(second).toEqual(first);
    expect(mockFetch).toHaveBeenCalledTimes(1); // no additional fetch
  });

  test('caches different users separately', async () => {
    const response1 = {
      data: {
        user: {
          contributionsCollection: {
            totalCommitContributions: 100,
            totalPullRequestContributions: 0,
            totalPullRequestReviewContributions: 0,
            totalIssueContributions: 0,
            restrictedContributionsCount: 0,
            contributionCalendar: {
              totalContributions: 100,
              weeks: [{ contributionDays: [
                { contributionCount: 5, date: '2026-06-13' },
              ]}],
            },
          },
          pullRequests: { totalCount: 0 },
          issues: { totalCount: 0 },
        },
      },
    };

    const response2 = {
      data: {
        user: {
          contributionsCollection: {
            totalCommitContributions: 200,
            totalPullRequestContributions: 0,
            totalPullRequestReviewContributions: 0,
            totalIssueContributions: 0,
            restrictedContributionsCount: 0,
            contributionCalendar: {
              totalContributions: 200,
              weeks: [{ contributionDays: [
                { contributionCount: 10, date: '2026-06-13' },
              ]}],
            },
          },
          pullRequests: { totalCount: 0 },
          issues: { totalCount: 0 },
        },
      },
    };

    globalThis.fetch = jest.fn()
      .mockResolvedValueOnce(jsonResponse(response1))
      .mockResolvedValueOnce(jsonResponse(response2));

    const user1 = await getContributionData('user1');
    const user2 = await getContributionData('user2');

    expect(user1.data.totalContributions).toBe(100);
    expect(user2.data.totalContributions).toBe(200);
    expect(githubCache.get('contributions:user1')).not.toBeNull();
    expect(githubCache.get('contributions:user2')).not.toBeNull();
  });

  test('aggregates multi-year contribution data and calculates correct all-time streak', async () => {
    // Current year is 2026 (faked to 2026-06-13)
    // User registered in 2024
    const firstResponse = {
      data: {
        user: {
          createdAt: '2024-05-15T00:00:00Z',
          contributionsCollection: {
            totalCommitContributions: 10,
            totalPullRequestContributions: 2,
            totalPullRequestReviewContributions: 1,
            totalIssueContributions: 0,
            restrictedContributionsCount: 0,
            contributionCalendar: buildCalendar([0, 0]),
          },
          pullRequests: { totalCount: 15 },
          issues: { totalCount: 5 },
        },
      },
    };

    // Faked contribution days:
    // y2024: 1 contribution day on 2024-06-01 (count: 5)
    // y2025: 2 consecutive contribution days on 2025-06-01 (count: 3), 2025-06-02 (count: 4)
    // y2026: 2 consecutive contribution days ending yesterday/today (2026-06-12 (count: 1), 2026-06-13 (count: 1))
    const secondResponse = {
      data: {
        user: {
          y2024: {
            totalCommitContributions: 100,
            totalPullRequestContributions: 12,
            totalPullRequestReviewContributions: 3,
            totalIssueContributions: 4,
            contributionCalendar: buildCalendar([0, 0, 5, 0], '2024-05-30')
          },
          y2025: {
            totalCommitContributions: 200,
            totalPullRequestContributions: 22,
            totalPullRequestReviewContributions: 13,
            totalIssueContributions: 14,
            contributionCalendar: buildCalendar([0, 3, 4, 0], '2025-05-31')
          },
          y2026: {
            totalCommitContributions: 50,
            totalPullRequestContributions: 5,
            totalPullRequestReviewContributions: 2,
            totalIssueContributions: 1,
            contributionCalendar: buildCalendar([0, 1, 1], '2026-06-11')
          }
        }
      }
    };

    globalThis.fetch = jest.fn()
      .mockResolvedValueOnce(jsonResponse(firstResponse))
      .mockResolvedValueOnce(jsonResponse(secondResponse));

    const result = await getContributionData('multiyear-user');

    expect(result.success).toBe(true);
    // Aggregated stats:
    // Commits: 100 + 200 + 50 = 350
    // PRs: 12 + 22 + 5 = 39
    // Reviews: 3 + 13 + 2 = 18
    // Issues: 4 + 14 + 1 = 19
    // Total Contributions: 5 + 7 + 2 = 14
    expect(result.data.totalCommits).toBe(350);
    expect(result.data.totalPRs).toBe(39);
    expect(result.data.totalReviews).toBe(18);
    expect(result.data.totalIssues).toBe(19);
    expect(result.data.totalContributions).toBe(14);

    // prsMerged and issuesClosed are fallback to first query values
    expect(result.data.prsMerged).toBe(15);
    expect(result.data.issuesClosed).toBe(5);

    // Days:
    // y2024: 1 day (Jun 1, 2024)
    // y2025: 2 days (Jun 1 & Jun 2, 2025)
    // y2026: 2 days (Jun 12 & Jun 13, 2026)
    // Streaks:
    // Current streak ending today (2026-06-13): 2 days (Jun 12, Jun 13)
    // Longest streak: 2 days (Jun 1 & Jun 2, 2025, or Jun 12 & Jun 13, 2026)
    expect(result.data.currentStreak).toBe(2);
    expect(result.data.longestStreak).toBe(2);
    expect(result.data.totalContributionDays).toBe(5);
  });
});
