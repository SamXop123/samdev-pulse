import { HttpErrorCode, httpRequest } from '../utils/http-client.js';
import { githubCache } from '../utils/cache.js';

function getDivision(rating) {
  if (rating >= 2000) return 'Div 1';
  if (rating >= 1600) return 'Div 2';
  if (rating >= 1400) return 'Div 3';
  return 'Div 4';
}

export async function getCodeChefData(handle) {
  const cacheKey = `codechef:${handle}`;
  const cached = githubCache.get(cacheKey);
  if (cached) return cached;

  try {
    const safeHandle = encodeURIComponent(handle);

    const res = await httpRequest(`https://competeapi.vercel.app/user/codechef/${safeHandle}/`);
    if (!res.success) {
      if (res.error?.code === HttpErrorCode.TIMEOUT) {
        return { success: false, error: 'CodeChef API timeout' };
      }
      return { success: false, error: res.error?.message || 'CodeChef API error' };
    }

    const data = res.data;

    if (!data || !data.username) {
      return { success: false, error: 'User not found' };
    }

    const currentRating = data.rating_number ?? 0;

    const result = {
      success: true,
      data: {
        handle: data.username ?? handle,
        currentRating,
        stars: data.rating ?? '1\u2605',
        globalRank: data.globalRank ?? data.global_rank ?? 'N/A',
        problemsSolved: data.problemsSolved ?? data.problems_solved ?? 0,
        division: getDivision(currentRating),
      }
    };
    githubCache.set(cacheKey, result);
    return result;
  } catch (err) {
    return { success: false, error: "CodeChef API error" };
  }
}
