import { sanitizeSvgValue } from './svg-sanitizer.js';

export function buildDashboardAccessibility({
  username,
  contributions,
  prs,
  issues,
  currentStreak,
  longestStreak,
  languages = [],
  trophies = {},
}) {
  const languageSummary = languages.length
    ? languages
        .map(lang => `${lang.label} ${lang.percentage}%`)
        .join(', ')
    : 'No language data available';

  return {
    title: sanitizeSvgValue(`GitHub Dashboard for ${username}`),

    description: sanitizeSvgValue(
      `GitHub profile statistics including ${contributions} contributions, ${prs} pull requests, ${issues} issues, current streak ${currentStreak}, longest streak ${longestStreak}. Top languages: ${languageSummary}. Achievement trophies and competitive programming statistics are included when available.`
    ),
  };
}

export function buildContributionSummary(data = []) {
  if (!data.length) {
    return 'Contribution activity chart.';
  }

  const total = data.reduce((a, b) => a + b, 0);
  const max = Math.max(...data);

  return `Contribution activity chart showing ${total} contributions over the displayed period with a peak of ${max} contributions in a single day.`;
}

export function buildLanguageSummary(data = []) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  if (!total) {
    return 'Language distribution chart.';
  }

  return data
    .map(item => {
      const pct = Math.round((item.value / total) * 100);
      return `${item.label} ${pct}%`;
    })
    .join(', ');
}

export function buildTrophySummary(data) {
  return `Achievement trophies. Commits ${data.commits}, pull requests ${data.prs}, reviews ${data.reviews}, issues ${data.issues}, repositories ${data.repos}, stars ${data.stars}, followers ${data.followers}.`;
}
