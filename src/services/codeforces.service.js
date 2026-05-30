export async function getCodeforcesData(handle) {
  try {
    const safeHandle = encodeURIComponent(handle);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const [infoRes, statusRes] = await Promise.all([
      fetch(`https://codeforces.com/api/user.info?handles=${safeHandle}`, { signal: controller.signal }),
      fetch(`https://codeforces.com/api/user.status?handle=${safeHandle}&from=1&count=10000`, { signal: controller.signal }),
    ]);

    clearTimeout(timeout);

    const infoData = await infoRes.json();
    if (infoData.status !== 'OK') {
      return { success: false, error: 'User not found' };
    }

    const user = infoData.result[0];

    // Count distinct solved problems
    let problemsSolved = 0;
    try {
      const statusData = await statusRes.json();
      if (statusData.status === 'OK') {
        const solved = new Set();
        for (const sub of statusData.result) {
          if (sub.verdict === 'OK' && sub.problem) {
            solved.add(`${sub.problem.contestId ?? ''}${sub.problem.index}`);
          }
        }
        problemsSolved = solved.size;
      }
    } catch (_) {
      // non-critical — silently fall back to 0
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
    if (err.name === 'AbortError') {
      return { success: false, error: 'Codeforces API timeout' };
    }
    return { success: false, error: err.message };
  }
}
