import { HttpErrorCode, httpRequest } from '../utils/http-client.js';

async function fetchWithRetry(url, options, retries = 2) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    const res = await httpRequest(url, options);
    if (res.success || attempt === retries) return res;
    await new Promise(r => setTimeout(r, 1000 * attempt));
  }
  return { success: false, error: { code: HttpErrorCode.TIMEOUT, message: 'Request failed after retries' } };
}

export async function getCodeforcesData(handle) {
  try {
    const safeHandle = encodeURIComponent(handle);

    const [infoRes, statusRes] = await Promise.all([
      fetchWithRetry(`https://codeforces.com/api/user.info?handles=${safeHandle}`),
      fetchWithRetry(`https://codeforces.com/api/user.status?handle=${safeHandle}&from=1&count=10000`),
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

    return {
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
  } catch (err) {
    return { success: false, error: "Codeforces API error" };
  }
}
