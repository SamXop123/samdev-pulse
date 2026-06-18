import { afterEach, describe, expect, jest, test } from '@jest/globals';
import { getCodeChefData } from '../codechef.service.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function jsonResponse(data, init = {}) {
  const status = init.status ?? 200;
  return {
    ok: status >= 200 && status < 300,
    status,
    url: init.url || 'https://competeapi.vercel.app/mock',
    headers: init.headers || { get: () => null },
    json: async () => data,
    text: async () => JSON.stringify(data),
    arrayBuffer: async () => new ArrayBuffer(0),
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('codechef.service.js', () => {
  afterEach(() => {
    delete globalThis.fetch;
  });

  // --- Happy path ---

  test('returns normalized data on successful API response', async () => {
    globalThis.fetch = jest.fn().mockResolvedValueOnce(jsonResponse({
      username: 'genius',
      rating_number: 2720,
      rating: '7★',
      globalRank: 42,
      problemsSolved: 500,
    }));

    const result = await getCodeChefData('genius');

    expect(result).toEqual({
      success: true,
      data: {
        handle: 'genius',
        currentRating: 2720,
        stars: '7★',
        globalRank: 42,
        problemsSolved: 500,
        division: 'Div 1',
      },
    });
  });

  test('falls back to alternate field names', async () => {
    globalThis.fetch = jest.fn().mockResolvedValueOnce(jsonResponse({
      username: 'alt-user',
      rating_number: 1800,
      rating: '4★',
      global_rank: 1500,
      problems_solved: 200,
    }));

    const result = await getCodeChefData('alt-user');

    expect(result.success).toBe(true);
    expect(result.data.globalRank).toBe(1500);
    expect(result.data.problemsSolved).toBe(200);
  });

  test('normalizes missing fields gracefully', async () => {
    globalThis.fetch = jest.fn().mockResolvedValueOnce(jsonResponse({
      username: 'minimal',
      rating_number: 1200,
      // no rating, globalRank, problemsSolved
    }));

    const result = await getCodeChefData('minimal');

    expect(result.success).toBe(true);
    expect(result.data.currentRating).toBe(1200);
    expect(result.data.stars).toBe('1★');
    expect(result.data.globalRank).toBe('N/A');
    expect(result.data.problemsSolved).toBe(0);
  });

  test('returns error when response has no username field', async () => {
    globalThis.fetch = jest.fn().mockResolvedValueOnce(jsonResponse({
      // no username field — service treats this as user not found
      rating_number: 1500,
    }));

    const result = await getCodeChefData('fallback-handle');
    expect(result).toEqual({
      success: false,
      error: 'User not found',
    });
  });

  // --- Division calculation ---

  test.each([
    [2000, 'Div 1'],
    [1999, 'Div 2'],
    [1600, 'Div 2'],
    [1599, 'Div 3'],
    [1400, 'Div 3'],
    [1399, 'Div 4'],
    [0, 'Div 4'],
  ])('maps rating %i to %s', async (rating, expectedDivision) => {
    globalThis.fetch = jest.fn().mockResolvedValueOnce(jsonResponse({
      username: 'div-test',
      rating_number: rating,
    }));

    const result = await getCodeChefData('div-test');
    expect(result.success).toBe(true);
    expect(result.data.division).toBe(expectedDivision);
    expect(result.data.currentRating).toBe(rating);
  });

  // --- Error paths ---

  test('returns error when API returns no username (user not found)', async () => {
    globalThis.fetch = jest.fn().mockResolvedValueOnce(jsonResponse({
      // username is missing
      rating_number: 0,
    }));

    const result = await getCodeChefData('nonexistent');
    expect(result).toEqual({
      success: false,
      error: 'User not found',
    });
  });

  test('returns error when API returns empty object', async () => {
    globalThis.fetch = jest.fn().mockResolvedValueOnce(jsonResponse({}));

    const result = await getCodeChefData('ghost');
    expect(result).toEqual({
      success: false,
      error: 'User not found',
    });
  });

  test('returns error when API returns null data', async () => {
    globalThis.fetch = jest.fn().mockResolvedValueOnce(jsonResponse(null));

    const result = await getCodeChefData('null-user');
    expect(result).toEqual({
      success: false,
      error: 'User not found', // data is falsy, falls through to username check
    });
  });

  test('returns error on HTTP failure', async () => {
    globalThis.fetch = jest.fn().mockResolvedValueOnce(jsonResponse(
      { message: 'Not Found' },
      { status: 404 },
    ));

    const result = await getCodeChefData('missing');
    expect(result.success).toBe(false);
  });

  test('returns error on network failure', async () => {
    globalThis.fetch = jest.fn().mockRejectedValue(new Error('Network failure'));

    const result = await getCodeChefData('anyone');
    expect(result.success).toBe(false);
    expect(result.error).toBe('Network failure');
  });

  test('returns timeout error on AbortError', async () => {
    const abortError = new Error('The operation was aborted');
    abortError.name = 'AbortError';
    globalThis.fetch = jest.fn().mockRejectedValue(abortError);

    const result = await getCodeChefData('anyone');
    expect(result).toEqual({
      success: false,
      error: 'CodeChef API timeout',
    });
  });

  test('returns error on fetch throwing TypeError', async () => {
    globalThis.fetch = jest.fn().mockRejectedValue(new TypeError('fetch is not a function'));

    const result = await getCodeChefData('anyone');
    expect(result.success).toBe(false);
    expect(result.error).toBe('fetch is not a function');
  });
});
