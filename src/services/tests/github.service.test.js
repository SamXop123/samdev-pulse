import { afterEach, beforeEach, describe, expect, jest, test } from '@jest/globals';
import { getGitHubUserData, GitHubErrorCode } from '../github.service.js';
import { githubCache } from '../../utils/cache.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function jsonResponse(data, init = {}) {
  const status = init.status ?? 200;
  return {
    ok: status >= 200 && status < 300,
    status,
    url: init.url || 'https://api.github.com/mock',
    headers: init.headers || { get: () => null },
    json: async () => data,
    text: async () => JSON.stringify(data),
    arrayBuffer: async () => new ArrayBuffer(0),
  };
}

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const PROFILE_DATA = {
  login: 'octocat',
  name: 'Octo Cat',
  avatar_url: 'https://avatars.example.test/u/1?v=4',
  bio: 'A test user',
  location: 'San Francisco',
  company: 'GitHub',
  blog: 'https://octocat.dev',
  public_repos: 10,
  followers: 100,
  following: 50,
  created_at: '2011-01-25T18:44:36Z',
};

const REPOS_DATA = [
  {
    name: 'hello-world',
    description: 'A test repo',
    stargazers_count: 5,
    forks_count: 1,
    language: 'JavaScript',
    html_url: 'https://github.com/octocat/hello-world',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    name: 'my-project',
    description: null,
    stargazers_count: 15,
    forks_count: 3,
    language: 'TypeScript',
    html_url: 'https://github.com/octocat/my-project',
    updated_at: '2026-02-01T00:00:00Z',
  },
];

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('github.service.js', () => {
  beforeEach(() => {
    githubCache.clear();
  });

  afterEach(() => {
    delete globalThis.fetch;
  });

  // --- Happy path ---

  test('returns normalized user data on successful API calls', async () => {
    globalThis.fetch = jest.fn()
      .mockResolvedValueOnce(jsonResponse(PROFILE_DATA))
      .mockResolvedValueOnce(jsonResponse(REPOS_DATA))
      .mockResolvedValueOnce(jsonResponse(
        'fake-image-data',
        { headers: { get: (h) => h === 'content-type' ? 'image/png' : null } },
      ));

    const result = await getGitHubUserData('octocat');

    expect(result.success).toBe(true);
    expect(result.data).toMatchObject({
      username: 'octocat',
      name: 'Octo Cat',
      avatarUrl: 'https://avatars.example.test/u/1?v=4',
      avatarDataUri: expect.stringMatching(/^data:image\/png;base64,/),
      bio: 'A test user',
      publicRepos: 10,
      followers: 100,
      following: 50,
      totalStars: 20,
      repos: [
        expect.objectContaining({ name: 'hello-world', stars: 5, language: 'JavaScript' }),
        expect.objectContaining({ name: 'my-project', stars: 15, language: 'TypeScript' }),
      ],
    });
  });

  test('uses login as fallback when name is not set', async () => {
    const profileNoName = { ...PROFILE_DATA, name: null };
    globalThis.fetch = jest.fn()
      .mockResolvedValueOnce(jsonResponse(profileNoName))
      .mockResolvedValueOnce(jsonResponse(REPOS_DATA))
      .mockResolvedValueOnce(jsonResponse(
        'data',
        { headers: { get: () => 'image/png' } },
      ));

    const result = await getGitHubUserData('octocat');
    expect(result.data.name).toBe('octocat');
  });

  test('handles empty repos list', async () => {
    globalThis.fetch = jest.fn()
      .mockResolvedValueOnce(jsonResponse(PROFILE_DATA))
      .mockResolvedValueOnce(jsonResponse([]))
      .mockResolvedValueOnce(jsonResponse(
        'data',
        { headers: { get: () => 'image/png' } },
      ));

    const result = await getGitHubUserData('octocat');
    expect(result.data.totalStars).toBe(0);
    expect(result.data.repos).toEqual([]);
  });

  test('handles null avatar URL gracefully', async () => {
    const profileNoAvatar = { ...PROFILE_DATA, avatar_url: '' };
    globalThis.fetch = jest.fn()
      .mockResolvedValueOnce(jsonResponse(profileNoAvatar))
      .mockResolvedValueOnce(jsonResponse(REPOS_DATA));

    // Only 2 fetch calls since avatar URL is empty → skip avatar fetch
    const result = await getGitHubUserData('octocat');
    expect(result.data.avatarUrl).toBe('');
    expect(result.data.avatarDataUri).toBeNull();
  });

  test('handles missing bio/location/blog fields', async () => {
    const profileMinimal = {
      login: 'minimal',
      name: 'Min',
      avatar_url: null,
      public_repos: 1,
      followers: 0,
      following: 0,
      created_at: '2020-01-01T00:00:00Z',
    };
    globalThis.fetch = jest.fn()
      .mockResolvedValueOnce(jsonResponse(profileMinimal))
      .mockResolvedValueOnce(jsonResponse([]));

    const result = await getGitHubUserData('minimal');
    expect(result.data.bio).toBe('');
    expect(result.data.location).toBe('');
    expect(result.data.company).toBe('');
    expect(result.data.blog).toBe('');
    expect(result.data.totalStars).toBe(0);
  });

  test('handles paginated repos (multiple pages)', async () => {
    // Generate 250 repos to trigger multiple pages (per_page=100, max 3 pages)
    const page1 = Array.from({ length: 100 }, (_, i) => ({
      name: `repo-${i}`,
      description: null,
      stargazers_count: i,
      forks_count: 0,
      language: null,
      html_url: `https://github.com/user/repo-${i}`,
      updated_at: '2026-01-01T00:00:00Z',
    }));
    const page2 = Array.from({ length: 100 }, (_, i) => ({
      name: `repo-${100 + i}`,
      description: null,
      stargazers_count: i,
      forks_count: 0,
      language: null,
      html_url: `https://github.com/user/repo-${100 + i}`,
      updated_at: '2026-01-01T00:00:00Z',
    }));
    const page3 = Array.from({ length: 50 }, (_, i) => ({
      name: `repo-${200 + i}`,
      description: null,
      stargazers_count: i,
      forks_count: 0,
      language: null,
      html_url: `https://github.com/user/repo-${200 + i}`,
      updated_at: '2026-01-01T00:00:00Z',
    }));
    // Page1: stars 0-99 = 4950, Page2: stars 0-99 = 4950, Page3: stars 0-49 = 1225
    const expectedTotalStars = 4950 + 4950 + 1225;

    globalThis.fetch = jest.fn()
      .mockResolvedValueOnce(jsonResponse(PROFILE_DATA))
      .mockResolvedValueOnce(jsonResponse(page1))
      .mockResolvedValueOnce(jsonResponse(page2))
      .mockResolvedValueOnce(jsonResponse(page3))
      .mockResolvedValueOnce(jsonResponse(
        'data',
        { headers: { get: () => 'image/png' } },
      ));

    const result = await getGitHubUserData('octocat');
    expect(result.data.repos.length).toBe(250);
    expect(result.data.totalStars).toBe(expectedTotalStars);
  });

  // --- Error paths ---

  test('returns NOT_FOUND on 404', async () => {
    globalThis.fetch = jest.fn()
      .mockResolvedValueOnce(jsonResponse({ message: 'Not Found' }, { status: 404 }));

    const result = await getGitHubUserData('unknown-user');
    expect(result).toMatchObject({
      success: false,
      code: 'NOT_FOUND',
    });
  });

  test('returns RATE_LIMIT on 403', async () => {
    globalThis.fetch = jest.fn()
      .mockResolvedValueOnce(jsonResponse({ message: 'Rate limit' }, { status: 403 }));

    const result = await getGitHubUserData('blocked-user');
    expect(result).toMatchObject({
      success: false,
      code: 'RATE_LIMIT',
    });
  });

  test('returns RATE_LIMIT on 429', async () => {
    globalThis.fetch = jest.fn()
      .mockResolvedValueOnce(jsonResponse({ message: 'Too many requests' }, { status: 429 }));

    const result = await getGitHubUserData('blocked-user');
    expect(result).toMatchObject({
      success: false,
      code: 'RATE_LIMIT',
    });
  });

  test('returns API_DOWN on 5xx', async () => {
    globalThis.fetch = jest.fn()
      .mockResolvedValueOnce(jsonResponse({}, { status: 502 }));

    const result = await getGitHubUserData('anyone');
    expect(result).toMatchObject({
      success: false,
      code: 'API_DOWN',
    });
  });

  test('returns API_ERROR on other HTTP errors', async () => {
    globalThis.fetch = jest.fn()
      .mockResolvedValueOnce(jsonResponse({}, { status: 400 }));

    const result = await getGitHubUserData('anyone');
    expect(result).toMatchObject({
      success: false,
      code: 'API_ERROR',
    });
  });

  test('returns NETWORK error on fetch throwing AbortError', async () => {
    const abortError = new Error('The operation was aborted');
    abortError.name = 'AbortError';
    globalThis.fetch = jest.fn().mockRejectedValue(abortError);

    const result = await getGitHubUserData('anyone');
    expect(result).toMatchObject({
      success: false,
      code: 'NETWORK',
    });
  });

  test('returns NETWORK error on generic network failure', async () => {
    globalThis.fetch = jest.fn().mockRejectedValue(new Error('ENOTFOUND'));

    const result = await getGitHubUserData('anyone');
    expect(result).toMatchObject({
      success: false,
      code: 'NETWORK',
    });
  });

  // --- Avatar fetch failures are non-fatal ---

  test('returns profile data even when avatar fetch fails', async () => {
    globalThis.fetch = jest.fn()
      .mockResolvedValueOnce(jsonResponse(PROFILE_DATA))
      .mockResolvedValueOnce(jsonResponse(REPOS_DATA))
      .mockRejectedValueOnce(new Error('Avatar fetch failed'));

    const result = await getGitHubUserData('octocat');
    expect(result.success).toBe(true);
    expect(result.data.avatarDataUri).toBeNull();
    expect(result.data.totalStars).toBe(20);
  });

  test('returns profile data even when avatar returns 404', async () => {
    globalThis.fetch = jest.fn()
      .mockResolvedValueOnce(jsonResponse(PROFILE_DATA))
      .mockResolvedValueOnce(jsonResponse(REPOS_DATA))
      .mockResolvedValueOnce(jsonResponse({}, { status: 404 }));

    const result = await getGitHubUserData('octocat');
    expect(result.success).toBe(true);
    expect(result.data.avatarDataUri).toBeNull();
  });

  // --- Caching ---

  test('caches successful result and returns cached data on repeated call', async () => {
    const mockFetch = jest.fn()
      .mockResolvedValueOnce(jsonResponse(PROFILE_DATA))
      .mockResolvedValueOnce(jsonResponse(REPOS_DATA))
      .mockResolvedValueOnce(jsonResponse(
        'data',
        { headers: { get: () => 'image/png' } },
      ));
    globalThis.fetch = mockFetch;

    const first = await getGitHubUserData('octocat');
    expect(first.success).toBe(true);
    expect(mockFetch).toHaveBeenCalledTimes(3); // profile + repos + avatar

    const second = await getGitHubUserData('octocat');
    expect(second).toEqual(first);
    // No additional fetch calls thanks to cache
    expect(mockFetch).toHaveBeenCalledTimes(3);
  });

  test('caches different usernames separately', async () => {
    const profile2 = { ...PROFILE_DATA, login: 'user2', name: 'User Two' };

    globalThis.fetch = jest.fn()
      .mockResolvedValueOnce(jsonResponse(PROFILE_DATA))
      .mockResolvedValueOnce(jsonResponse(REPOS_DATA))
      .mockResolvedValueOnce(jsonResponse('data', { headers: { get: () => 'image/png' } }))
      .mockResolvedValueOnce(jsonResponse(profile2))
      .mockResolvedValueOnce(jsonResponse(REPOS_DATA))
      .mockResolvedValueOnce(jsonResponse('data', { headers: { get: () => 'image/png' } }));

    const user1 = await getGitHubUserData('octocat');
    const user2 = await getGitHubUserData('user2');

    expect(user1.data.username).toBe('octocat');
    expect(user2.data.username).toBe('user2');
    expect(githubCache.get('octocat')).not.toBeNull();
    expect(githubCache.get('user2')).not.toBeNull();
  });

  test('does not cache error responses', async () => {
    globalThis.fetch = jest.fn()
      .mockResolvedValueOnce(jsonResponse({}, { status: 404 }));

    await getGitHubUserData('missing');
    expect(githubCache.get('missing')).toBeNull();
  });

  // --- Invalid JSON ---

  test('handles invalid JSON from API gracefully', async () => {
    globalThis.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      status: 200,
      url: 'https://api.github.com/users/test',
      headers: { get: () => null },
      json: async () => { throw new SyntaxError('Unexpected token'); },
      text: async () => 'not json',
      arrayBuffer: async () => new ArrayBuffer(0),
    });

    const result = await getGitHubUserData('test');
    expect(result.success).toBe(false);
    expect(result.code).toBeDefined(); // error is properly classified
  });

  // --- Repo pagination edge cases ---

  test('stops pagination when a page returns fewer items than per_page', async () => {
    const page1 = Array.from({ length: 50 }, (_, i) => ({
      name: `repo-${i}`,
      description: null,
      stargazers_count: 0,
      forks_count: 0,
      language: null,
      html_url: `https://github.com/user/repo-${i}`,
      updated_at: '2026-01-01T00:00:00Z',
    }));

    globalThis.fetch = jest.fn()
      .mockResolvedValueOnce(jsonResponse(PROFILE_DATA))
      .mockResolvedValueOnce(jsonResponse(page1))
      .mockResolvedValueOnce(jsonResponse(
        'data',
        { headers: { get: () => 'image/png' } },
      ));

    const result = await getGitHubUserData('octocat');
    expect(result.data.repos.length).toBe(50);
  });
});
