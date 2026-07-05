import { afterEach, describe, expect, jest, test } from '@jest/globals';
import { getCodeforcesData } from './codeforces.service.js';
import { getGitHubUserData } from './github.service.js';

function jsonResponse(data, init = {}) {
  const status = init.status ?? 200;
  return {
    ok: status >= 200 && status < 300,
    status,
    url: init.url || 'https://example.test/mock',
    headers: init.headers || { get: () => null },
    json: async () => data,
    text: async () => JSON.stringify(data),
    arrayBuffer: async () => new ArrayBuffer(0),
  };
}

function textResponse(text, init = {}) {
  const status = init.status ?? 200;
  return {
    ok: status >= 200 && status < 300,
    status,
    url: init.url || 'https://example.test/mock',
    headers: init.headers || { get: () => null },
    json: async () => {
      JSON.parse(text);
    },
    text: async () => text,
    arrayBuffer: async () => new TextEncoder().encode(text).buffer,
  };
}

describe('third-party HTTP integrations', () => {
  afterEach(() => {
    delete globalThis.fetch;
  });

  test('keeps Codeforces profile data when submissions fail', async () => {
    globalThis.fetch = jest.fn()
      .mockResolvedValueOnce(jsonResponse({
        status: 'OK',
        result: [{
          handle: 'tourist',
          rating: 3850,
          maxRating: 3979,
          rank: 'legendary grandmaster',
          maxRank: 'legendary grandmaster',
        }],
      }))
      .mockResolvedValueOnce(textResponse('not json', { status: 200 }));

    const result = await getCodeforcesData('tourist');

    expect(result).toMatchObject({
      success: true,
      data: {
        handle: 'tourist',
        rating: 3850,
        problemsSolved: 0,
      },
    });
  });

  test('preserves GitHub avatar fallback when image fetch fails', async () => {
    const username = `octocat-${Date.now()}`;

    globalThis.fetch = jest.fn()
      .mockResolvedValueOnce(jsonResponse({
        login: username,
        name: 'Octo Cat',
        avatar_url: 'https://avatars.example.test/u/1?v=4',
        bio: '',
        location: '',
        company: '',
        blog: '',
        public_repos: 1,
        followers: 2,
        following: 3,
        created_at: '2011-01-25T18:44:36Z',
      }))
      .mockResolvedValueOnce(jsonResponse([
        {
          name: 'hello-world',
          description: null,
          stargazers_count: 5,
          forks_count: 1,
          language: 'JavaScript',
          html_url: 'https://github.com/octocat/hello-world',
          updated_at: '2026-01-01T00:00:00Z',
        },
      ]))
      .mockResolvedValueOnce(textResponse('', { status: 404 }));

    const result = await getGitHubUserData(username);

    expect(result.success).toBe(true);
    expect(result.data.avatarDataUri).toBeNull();
    expect(result.data.avatarUrl).toBe('https://avatars.example.test/u/1?v=4');
    expect(result.data.totalStars).toBe(5);
  });
});
