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

export async function getGitHubUserData(username) {
}
