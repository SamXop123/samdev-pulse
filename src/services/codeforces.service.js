import { HttpErrorCode, httpRequest } from '../utils/http-client.js';
import { githubCache } from '../utils/cache.js';

export async function getCodeforcesData(handle) {
  const cacheKey = `codeforces:${handle}`;
  const cached = githubCache.get(cacheKey);
  if (cached) return cached;
  try {
    const safeHandle = encodeURIComponent(handle);

    const [infoRes, statusRes] = await Promise.all([
      httpRequest(`https://codeforces.com/api/user.info?handles=${safeHandle}`),
      httpRequest(`https://codeforces.com/api/user.status?handle=${safeHandle}&from=1&count=10000`),
    ]);

    if (!infoRes.success) {
      if (infoRes.error?.code === HttpErrorCode.TIMEOUT) {
        return { success: false, error: 'Codeforces API timeout' };
      }
      return { success: false, error: infoRes.error?.message || 'Codeforces API error' };
    }

    const infoData = infoRes.data;
    if (infoData.status !== 'OK') {
      return { success: false, error: 'User not found' };
    }

    const user = infoData.result[0];

    // Count distinct solved problems. The status endpoint is optional; if it
    // fails, profile stats still render with a solved count of 0.
    let problemsSolved = 0;
    if (statusRes.success && statusRes.data?.status === 'OK') {
      const solved = new Set();
      for (const sub of statusRes.data.result) {
        if (sub.verdict === 'OK' && sub.problem) {
          solved.add(`${sub.problem.contestId ?? ''}${sub.problem.index}`);
        }
      }
      problemsSolved = solved.size;
    }

    const result = {
      success: true,
      data: {
        handle: user.handle,
        rating: user.rating ?? 0,
        maxRating: user.maxRating ?? 0,
        rank: user.rank ?? 'unrated',
        maxRank: user.maxRank ?? 'unrated',
        problemsSolved,
      }
    };
    githubCache.set(cacheKey, result);
    return result;
  } catch (err) {
    return { success: false, error: "Codeforces API error" };
  }
}
