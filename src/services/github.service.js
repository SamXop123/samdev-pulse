// GitHub REST API Service

import { githubCache } from '../utils/cache.js';

const GITHUB_API_BASE = 'https://api.github.com';

export const GitHubErrorCode = {
  NOT_FOUND: 'NOT_FOUND',
  RATE_LIMIT: 'RATE_LIMIT',
  API_DOWN: 'API_DOWN',
  API_ERROR: 'API_ERROR',
  NETWORK: 'NETWORK',
};

class GitHubRequestError extends Error {
  constructor(message, code, status = 0) {
    super(message);
    this.name = 'GitHubRequestError';
    this.code = code;
    this.status = status;
  }
}

function errorFromStatus(status) {
  if (status === 404) {
    return new GitHubRequestError('User not found', GitHubErrorCode.NOT_FOUND, 404);
  }
  if (status === 403) {
    return new GitHubRequestError(
      'GitHub API rate limit exceeded',
      GitHubErrorCode.RATE_LIMIT,
      403
    );
  }
  if (status >= 500) {
    return new GitHubRequestError(
      'GitHub API is temporarily unavailable',
      GitHubErrorCode.API_DOWN,
      status
    );
  }
  return new GitHubRequestError(
    `GitHub API error: ${status}`,
    GitHubErrorCode.API_ERROR,
    status
  );
}

/* function to get authorization headers once to use it everywhere */
function getHeaders() {
  const headers = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'samdev-pulse',
  };

  if (process.env.GITHUB_TOKEN) {
    headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  return headers;
}

async function assertOk(response) {
  if (!response.ok) {
    throw errorFromStatus(response.status);
  }
}

/* fetch user profile from GitHub API */
async function fetchUserProfile(username) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  const response = await fetch(`${GITHUB_API_BASE}/users/${username}`, {
    headers: getHeaders(),
    signal: controller.signal,
  });

  clearTimeout(timeout);
  await assertOk(response);
  return response.json();
}

/* fetch public repos for a user */
async function fetchUserRepos(username) {
  const repos = [];
  let page = 1;
  const perPage = 100;
  const MAX_PAGES = 3;

  while (page <= MAX_PAGES) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(
      `${GITHUB_API_BASE}/users/${username}/repos?per_page=${perPage}&page=${page}&sort=updated`,
      { headers: getHeaders(), signal: controller.signal }
    );

    clearTimeout(timeout);
    await assertOk(response);

    const data = await response.json();
    repos.push(...data);

    if (data.length < perPage) {
      break;
    }

    page++;
  }

  return repos;
}

/* total stars from repos */
function calculateTotalStars(repos) {
  return repos.reduce((total, repo) => total + (repo.stargazers_count || 0), 0);
}

/* fetch avatar image for embedding in SVG */
async function fetchAvatarDataUri(avatarUrl) {
  if (!avatarUrl) {
    return null;
  }

  // Use GitHub CDN to request 96×96 image (keeps response small)
  const resizedUrl = `${avatarUrl}&s=96`;
  const AVATAR_TIMEOUT_MS = 8000;
  const MAX_SIZE_BYTES = 100 * 1024; // 100 KB safety limit

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), AVATAR_TIMEOUT_MS);

  try {
    const response = await fetch(resizedUrl, {
      headers: {
        'User-Agent': 'samdev-pulse',
        'Accept': 'image/*',
      },
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`Avatar fetch error: ${response.status}`);
    }

    // Check Content-Length header if available
    const contentLength = response.headers.get('content-length');
    if (contentLength && parseInt(contentLength, 10) > MAX_SIZE_BYTES) {
      throw new Error('Avatar image too large');
    }

    const buffer = Buffer.from(await response.arrayBuffer());

    // Double-check buffer size
    if (buffer.length > MAX_SIZE_BYTES) {
      throw new Error('Avatar image too large');
    }

    const contentType = response.headers.get('content-type') || 'image/png';
    const base64 = buffer.toString('base64');
    return `data:${contentType};base64,${base64}`;
  } catch (error) {
    clearTimeout(timeout);
    if (error.name === 'AbortError') {
      console.warn('Avatar fetch timeout');
    }
    return null;
  }
}

/* normalize all data into a clean object */
function normalizeUserData(profile, repos, avatarDataUri) {
  const totalStars = calculateTotalStars(repos);

  return {
    username: profile.login,
    name: profile.name || profile.login,
    avatarUrl: profile.avatar_url,
    avatarDataUri,
    bio: profile.bio || '',
    location: profile.location || '',
    company: profile.company || '',
    blog: profile.blog || '',
    publicRepos: profile.public_repos,
    followers: profile.followers,
    following: profile.following,
    createdAt: profile.created_at,
    totalStars,
    repos: repos.map((repo) => ({
      name: repo.name,
      description: repo.description || '',
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      language: repo.language,
      url: repo.html_url,
      updatedAt: repo.updated_at,
    })),
  };
}

/* fetch and normalize all gitHub data for a user */
export async function getGitHubUserData(username) {
  const cached = githubCache.get(username);
  if (cached) {
    return cached;
  }

  try {
    const profilePromise = fetchUserProfile(username);
    const reposPromise = fetchUserRepos(username);
    const [profile, repos] = await Promise.all([profilePromise, reposPromise]);
    const avatarDataUri = await fetchAvatarDataUri(profile.avatar_url);

    const result = {
      success: true,
      data: normalizeUserData(profile, repos, avatarDataUri),
    };

    githubCache.set(username, result);

    return result;
  } catch (error) {
    if (error instanceof GitHubRequestError) {
      return {
        success: false,
        error: error.message,
        code: error.code,
        status: error.status,
      };
    }

    return {
      success: false,
      error: error.message || 'Failed to fetch GitHub data',
      code: GitHubErrorCode.NETWORK,
    };
  }
}
