function getDivision(rating) {
  if (rating >= 2000) return 'Div 1';
  if (rating >= 1600) return 'Div 2';
  if (rating >= 1400) return 'Div 3';
  return 'Div 4';
}

export async function getCodeChefData(handle) {
  try {
    const safeHandle = encodeURIComponent(handle);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(
      `https://competeapi.vercel.app/user/codechef/${safeHandle}/`,
      { signal: controller.signal }
    );
    clearTimeout(timeout);
    const data = await res.json();

    if (!data || !data.username) {
      return { success: false, error: 'User not found' };
    }

    const currentRating = data.rating_number ?? 0;

    return {
      success: true,
      data: {
        handle: data.username ?? handle,
        currentRating,
        stars: data.rating ?? '1★',
        globalRank: data.globalRank ?? data.global_rank ?? 'N/A',
        problemsSolved: data.problemsSolved ?? data.problems_solved ?? 0,
        division: getDivision(currentRating),
      }
    };
  } catch (err) {
    if (err.name === 'AbortError') {
      return { success: false, error: 'CodeChef API timeout' };
    }
    return { success: false, error: err.message };
  }
}
