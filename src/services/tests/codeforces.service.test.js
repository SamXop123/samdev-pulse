import { afterEach, describe, expect, jest, test } from '@jest/globals';
import { getCodeforcesData } from '../codeforces.service.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function jsonResponse(data, init = {}) {
  const status = init.status ?? 200;
  return {
    ok: status >= 200 && status < 300,
    status,
    url: init.url || 'https://codeforces.com/api/mock',
    headers: init.headers || { get: () => null },
    json: async () => data,
    text: async () => JSON.stringify(data),
    arrayBuffer: async () => new ArrayBuffer(0),
  };
}

function okResponse(data, status = 200) {
  return jsonResponse(data, { status });
}

function errorResponse(status) {
  return jsonResponse({ status: 'FAILED', comment: 'Error' }, { status });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('codeforces.service.js', () => {
  afterEach(() => {
    delete globalThis.fetch;
  });

  // --- Happy path ---

  test('returns normalized data on successful API response', async () => {
    globalThis.fetch = jest.fn()
      .mockResolvedValueOnce(okResponse({
        status: 'OK',
        result: [{
          handle: 'tourist',
          rating: 3850,
          maxRating: 3979,
          rank: 'legendary grandmaster',
          maxRank: 'legendary grandmaster',
        }],
      }))
      .mockResolvedValueOnce(okResponse({
        status: 'OK',
        result: [
          { verdict: 'OK', problem: { contestId: 1, index: 'A' } },
          { verdict: 'OK', problem: { contestId: 1, index: 'B' } },
          { verdict: 'OK', problem: { contestId: 2, index: 'A' } },
          { verdict: 'FAILED', problem: { contestId: 1, index: 'C' } },
        ],
      }));

    const result = await getCodeforcesData('tourist');

    expect(result).toEqual({
      success: true,
      data: {
        handle: 'tourist',
        rating: 3850,
        maxRating: 3979,
        rank: 'legendary grandmaster',
        maxRank: 'legendary grandmaster',
        problemsSolved: 3,
      },
    });
  });

  test('counts distinct problems only by contestId+index', async () => {
    globalThis.fetch = jest.fn()
      .mockResolvedValueOnce(okResponse({
        status: 'OK',
        result: [{
          handle: 'user1',
          rating: 1500,
          maxRating: 1600,
          rank: 'specialist',
          maxRank: 'expert',
        }],
      }))
      .mockResolvedValueOnce(okResponse({
        status: 'OK',
        result: [
          { verdict: 'OK', problem: { contestId: 1, index: 'A' } },
          { verdict: 'OK', problem: { contestId: 1, index: 'A' } }, // duplicate
          { verdict: 'OK', problem: { contestId: 1, index: 'B' } },
        ],
      }));

    const result = await getCodeforcesData('user1');
    expect(result.success).toBe(true);
    expect(result.data.problemsSolved).toBe(2);
  });

  test('normalizes missing rating/rank fields to defaults', async () => {
    globalThis.fetch = jest.fn()
      .mockResolvedValueOnce(okResponse({
        status: 'OK',
        result: [{
          handle: 'newbie',
          // no rating, maxRating, rank, maxRank
        }],
      }))
      .mockResolvedValueOnce(okResponse({
        status: 'OK',
        result: [],
      }));

    const result = await getCodeforcesData('newbie');
    expect(result).toEqual({
      success: true,
      data: {
        handle: 'newbie',
        rating: 0,
        maxRating: 0,
        rank: 'unrated',
        maxRank: 'unrated',
        problemsSolved: 0,
      },
    });
  });

  // --- Error paths ---

  test('returns error when info API fails (404)', async () => {
    globalThis.fetch = jest.fn()
      .mockResolvedValueOnce(errorResponse(404));
    // status API won't be called because info fails

    const result = await getCodeforcesData('nonexistent');
    expect(result).toEqual({
      success: false,
      error: expect.stringMatching(/error|404|not found/i),
    });
  });

  test('returns error when info API returns non-OK status', async () => {
    globalThis.fetch = jest.fn()
      .mockResolvedValueOnce(okResponse({
        status: 'FAILED',
        comment: 'no such handle',
      }));

    const result = await getCodeforcesData('unknown');
    expect(result).toEqual({
      success: false,
      error: 'User not found',
    });
  });

  test('returns error on network failure', async () => {
    globalThis.fetch = jest.fn().mockRejectedValue(new Error('Network failure'));

    const result = await getCodeforcesData('anyone');
    expect(result.success).toBe(false);
    expect(result.error).toBe('Network failure');
  });

  test('returns error on timeout (AbortError)', async () => {
    const abortError = new Error('The operation was aborted');
    abortError.name = 'AbortError';
    globalThis.fetch = jest.fn().mockRejectedValue(abortError);

    const result = await getCodeforcesData('anyone');
    expect(result).toEqual({
      success: false,
      error: 'Codeforces API timeout',
    });
  });

  // --- Status API failure is non-fatal ---

  test('keeps profile data when status API fails', async () => {
    globalThis.fetch = jest.fn()
      .mockResolvedValueOnce(okResponse({
        status: 'OK',
        result: [{
          handle: 'petr',
          rating: 3000,
          maxRating: 3200,
          rank: 'legendary grandmaster',
          maxRank: 'legendary grandmaster',
        }],
      }))
      .mockResolvedValueOnce(errorResponse(500));

    const result = await getCodeforcesData('petr');
    expect(result).toEqual({
      success: true,
      data: {
        handle: 'petr',
        rating: 3000,
        maxRating: 3200,
        rank: 'legendary grandmaster',
        maxRank: 'legendary grandmaster',
        problemsSolved: 0,
      },
    });
  });

  // --- Edge cases ---

  test('handles special characters in handle', async () => {
    globalThis.fetch = jest.fn()
      .mockResolvedValueOnce(okResponse({
        status: 'OK',
        result: [{
          handle: 'user.dot_1',
          rating: 1200,
          maxRating: 1300,
          rank: 'pupil',
          maxRank: 'pupil',
        }],
      }))
      .mockResolvedValueOnce(okResponse({
        status: 'OK',
        result: [],
      }));

    const result = await getCodeforcesData('user.dot_1');
    expect(result.success).toBe(true);
    expect(result.data.handle).toBe('user.dot_1');
  });

  test('handles empty result array from status API', async () => {
    globalThis.fetch = jest.fn()
      .mockResolvedValueOnce(okResponse({
        status: 'OK',
        result: [{
          handle: 'nosolves',
          rating: 800,
          maxRating: 900,
          rank: 'newbie',
          maxRank: 'newbie',
        }],
      }))
      .mockResolvedValueOnce(okResponse({
        status: 'OK',
        result: [],
      }));

    const result = await getCodeforcesData('nosolves');
    expect(result.success).toBe(true);
    expect(result.data.problemsSolved).toBe(0);
  });

  test('returns error on fetch throwing non-AbortError', async () => {
    globalThis.fetch = jest.fn().mockRejectedValue(new TypeError('fetch failed'));

    const result = await getCodeforcesData('anyone');
    expect(result.success).toBe(false);
    expect(result.error).toBe('fetch failed');
  });
});
