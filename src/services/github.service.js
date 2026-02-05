// GitHub REST API Service

import { githubCache } from '../utils/cache.js';

const GITHUB_API_BASE = 'https://api.github.com';

/**
 * Get authorization headers if token is available
 */
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

/**
 * Fetch user profile from GitHub API
 */
async function fetchUserProfile(username) {
  const response = await fetch(`${GITHUB_API_BASE}/users/${username}`, {
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status}`);
  }

  return response.json();
}

/**
 * Fetch public repos for a user
 */
async function fetchUserRepos(username) {
  const repos = [];
  let page = 1;
  const perPage = 100;

  while (true) {
    const response = await fetch(
      `${GITHUB_API_BASE}/users/${username}/repos?per_page=${perPage}&page=${page}&sort=updated`,
      { headers: getHeaders() }
    );

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const data = await response.json();
    repos.push(...data);

    if (data.length < perPage) {
      break;
    }

    page++;
  }

  return repos;
}

/**
 * Calculate total stars from repos
 */
function calculateTotalStars(repos) {
  return repos.reduce((total, repo) => total + (repo.stargazers_count || 0), 0);
}

/**
 * Fetch avatar image and encode as data URI for safe embedding in SVG
 */
async function fetchAvatarDataUri(avatarUrl) {
  if (!avatarUrl) {
    return null;
  }

  try {
    const response = await fetch(avatarUrl, {
      headers: {
        'User-Agent': 'samdev-pulse',
        'Accept': 'image/*',
      },
    });

    if (!response.ok) {
      throw new Error(`Avatar fetch error: ${response.status}`);
    }

    const contentType = response.headers.get('content-type') || 'image/png';
    const buffer = Buffer.from(await response.arrayBuffer());
    const base64 = buffer.toString('base64');
    return `data:${contentType};base64,${base64}`;
  } catch (error) {
    return null;
  }
}

/**
 * Normalize GitHub data into a clean object
 */
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

/**
 * Fetch and normalize all GitHub data for a user
 */
export async function getGitHubUserData(username) {
  // Check cache first
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

    // Store in cache
    githubCache.set(username, result);

    return result;
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to fetch GitHub data',
    };
  }
}
