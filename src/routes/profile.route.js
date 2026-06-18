import { Router } from 'express';
import {
  renderBackground,
  renderHeader,
  renderCardWithStats,
  calculateCardWidth,
  calculateCardX,
  wrapSvg,
  setTheme,
  LAYOUT,
  renderTrophyRow,
} from '../renderers/svg.renderer.js';
import { renderContributionChart, renderDonutChart } from '../renderers/chart.renderer.js';
import { getGitHubUserData } from '../services/github.service.js';
import { getContributionData } from '../services/github-graphql.service.js';
import { getLeetCodeData } from '../services/leetcode.service.js';
import { getCodeforcesData } from '../services/codeforces.service.js';
import { getCodeChefData } from '../services/codechef.service.js';
import { renderCPSection } from '../renderers/cp-section.renderer.js';
import { sendGracefulErrorSvg } from '../renderers/error.renderer.js';
import { sendLoadingSpinner } from '../renderers/loading.renderer.js';
import { GitHubErrorCode } from '../services/github.service.js';
import { trackProfileRequest } from '../services/analytics.service.js';
import { CF_RANK_MAP } from '../constants.js';
import { normalizeProfileQuery, normalizeTheme } from '../utils/query-validation.js';
import { buildDashboardAccessibility } from '../utils/svg-accessibility.js';
import { createHybridTheme, validateThemeAccessibility } from '../utils/theme-accessibility.js';

const router = Router();

// Security: Implement strict Content-Security-Policy for SVG responses
router.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'none'; img-src 'self' data:; style-src 'unsafe-inline'"
  );
  next();
});

function formatNumber(num) {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
  return num.toString();
}

function getTopLanguages(repos, max = 5) {
  if (!Array.isArray(repos) || repos.length === 0) {
  return [];
}
  const langCounts = {};
  repos.forEach((repo) => {
  const language = repo?.language;

  if (typeof language === 'string' && language.trim()) {
    langCounts[language] = (langCounts[language] || 0) + 1;
  }
});
  return Object.entries(langCounts)
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, max);
}

router.get('/', async (req, res) => {
  try {
    void trackProfileRequest(req);

  const {
    theme,
    align,
    hideTrophies,
    username,
    isUsernameValid,
    leetcode,
    codeforces,
    codechef,
    shouldRenderLeetCode,
    customThemeOverrides,
  } = normalizeProfileQuery(req.query);

  let activeTheme = setTheme(theme);
  if (customThemeOverrides && Object.keys(customThemeOverrides).length > 0) {
    const hybridTheme = createHybridTheme(activeTheme, customThemeOverrides);
    const contrastResult = validateThemeAccessibility(hybridTheme);
    if (!contrastResult.primaryPass || !contrastResult.secondaryPass) {
      console.warn(`[Accessibility] Custom theme has low contrast:`, contrastResult);
    }
    activeTheme = setTheme(hybridTheme);
  }

  if (!isUsernameValid) {
    return sendGracefulErrorSvg(res, {
      code: 'INVALID_USERNAME',
      username,
    });
  }

  let showRepositoryStats = !shouldRenderLeetCode;

    const result = await getGitHubUserData(username);
    if (!result.success) {
      return sendGracefulErrorSvg(res, {
        code: result.code || GitHubErrorCode.API_ERROR,
        username,
        detail: result.error,
      });
    }
    const { data } = result;

    const contributionResult = await getContributionData(username);
    const contributionData = contributionResult.success ? contributionResult.data : null;

    const [leetcodeResult, codeforcesResult, codechefResult] = await Promise.all([
      shouldRenderLeetCode ? getLeetCodeData(leetcode) : null,
      codeforces ? getCodeforcesData(codeforces) : null,
      codechef ? getCodeChefData(codechef) : null,
    ]);

    const leetcodeData = leetcodeResult?.success ? leetcodeResult.data : null;
    if (shouldRenderLeetCode && !leetcodeData) {
      showRepositoryStats = true;
    }
    const codeforcesData = codeforcesResult?.success ? codeforcesResult.data : null;
    const codechefData = codechefResult?.success ? codechefResult.data : null;

    const cpPlatforms = [
      shouldRenderLeetCode ? leetcodeData : null,
      codeforcesData,
      codechefData,
    ].filter(Boolean).length;

    const showCPSection = cpPlatforms >= 2;

  const width = LAYOUT.width;
  const cardWidth = calculateCardWidth(3);
  const cardHeight = 140;
  const row1Y = 95;

  const row2Y = row1Y + cardHeight + LAYOUT.cardGap;
  const chartWidth = calculateCardWidth(2) + LAYOUT.cardGap / 2;
  const row2CardWidth = calculateCardWidth(2) - LAYOUT.cardGap / 2;
  const row2Height = 200;

  const fullWidth = width - (LAYOUT.padding * 2);

  const card1Title = 'GitHub Activity';
  const card1Stats = [
    { label: 'Contributions', value: contributionData ? formatNumber(contributionData.totalContributions) : '-' },
    { label: 'PRs Opened', value: contributionData ? formatNumber(contributionData.totalPRs) : '-' },
    { label: 'Issues Opened', value: contributionData ? formatNumber(contributionData.totalIssues) : '-' },
  ];

  const streakStats = [
    { label: 'Current', value: contributionData ? formatNumber(contributionData.currentStreak) : '-' },
    { label: 'Longest', value: contributionData ? formatNumber(contributionData.longestStreak) : '-' },
    { label: 'Total', value: contributionData ? formatNumber(contributionData.totalContributionDays) : '-' },
  ];

  let card3Title;
  let card3Stats;

  const domainInsights = typeof activeTheme.domainConfig?.calculateInsights === 'function'
    ? activeTheme.domainConfig.calculateInsights(data.repos)
    : null;

  if (!codeforcesData && !codechefData) {
    if (showRepositoryStats) {
      if (domainInsights) {
        card3Title = domainInsights.title;
        card3Stats = domainInsights.stats;
      } else {
        card3Title = 'Repository Stats';
        card3Stats = [
          { label: 'Repositories', value: formatNumber(data.publicRepos) },
          { label: 'Stars', value: formatNumber(data.totalStars) },
          { label: 'Followers', value: formatNumber(data.followers) },
        ];
      }
    } else {
      const getRatingOrRanking = () => {
        if (!leetcodeData) return { label: 'Rating', value: '-' };
        if (leetcodeData.contestRating) return { label: 'Rating', value: String(leetcodeData.contestRating) };
        return { label: 'Rank', value: formatNumber(leetcodeData.ranking) };
      };
      const getEMHStats = () => {
        if (!leetcodeData) return { label: 'E/M/H', value: '-', isVertical: false };
        return {
          label: 'E/M/H',
          isVertical: true,
          easy: leetcodeData.easySolved,
          medium: leetcodeData.mediumSolved,
          hard: leetcodeData.hardSolved,
        };
      };
      card3Title = leetcodeData ? 'LeetCode Stats' : 'Competitive Coding';
      card3Stats = [
        { label: 'Solved', value: leetcodeData ? formatNumber(leetcodeData.totalSolved) : '-' },
        getEMHStats(),
        getRatingOrRanking(),
      ];
    }
  } else if (!showCPSection) {
    if (codeforcesData) {
      const rankShort = CF_RANK_MAP[codeforcesData.rank?.toLowerCase()] ?? codeforcesData.rank ?? 'unrated';
      card3Title = 'Codeforces Stats';
      card3Stats = [
        { label: 'Rating', value: String(codeforcesData.rating) },
        { label: 'Rank', value: rankShort },
        { label: 'Max Rating', value: String(codeforcesData.maxRating) },
      ];
    } else {
      card3Title = 'CodeChef Stats';
      card3Stats = [
        { label: 'Rating', value: String(codechefData.currentRating) },
        { label: 'Stars', value: codechefData.stars },
        { label: 'Division', value: codechefData.division ?? 'Div 4' },
      ];
    }
  } else {
    if (domainInsights) {
      card3Title = domainInsights.title;
      card3Stats = domainInsights.stats;
    } else {
      card3Title = 'Repository Stats';
      card3Stats = [
        { label: 'Repositories', value: formatNumber(data.publicRepos) },
        { label: 'Stars', value: formatNumber(data.totalStars) },
        { label: 'Followers', value: formatNumber(data.followers) },
      ];
    }
  }

  let chartData;
  if (contributionData && contributionData.days && contributionData.days.length > 0) {
    const recentDays = contributionData.days.slice(-30);
    chartData = recentDays.map(day => day.count);
  } else {
    // Do not fall back to randomly generated data when the GitHub GraphQL
    // API is unavailable. Embedding fake contribution bars in a README
    // misleads viewers into believing they represent real activity.
    // Use zeroed-out bars instead so the chart is visually consistent but
    // clearly reflects that no data is available.
    chartData = Array(30).fill(0);
  }

const topLanguages = getTopLanguages(data?.repos ?? [], 5);

if (topLanguages.length === 0) {
  topLanguages.push({
    label: 'No Data',
    value: 1,
  });
}
  const trophyData = {
  commits: Number(contributionData?.totalContributions) || 0,
  prs: Number(contributionData?.totalPRs) || 0,
  issues: Number(contributionData?.totalIssues) || 0,
  repos: Number(data?.publicRepos) || 0,
  stars: Number(data?.totalStars) || 0,
  followers: Number(data?.followers) || 0,
  reviews: Number(contributionData?.totalReviews) || 0,
};

  const cpSectionHeight = showCPSection ? 156 : 0;
  const cpRowY = row2Y + row2Height + LAYOUT.cardGap;
  const trophyRowY = showCPSection
    ? cpRowY + cpSectionHeight + LAYOUT.cardGap
    : row2Y + row2Height + LAYOUT.cardGap;
  const trophyRowHeight = 165;

  const totalHeight = hideTrophies
    ? showCPSection
      ? cpRowY + cpSectionHeight + LAYOUT.padding
      : row2Y + row2Height + LAYOUT.padding
    : trophyRowY + trophyRowHeight + LAYOUT.padding;

  const content = [
    renderBackground(width, totalHeight),
    renderHeader({
      x: LAYOUT.padding,
      y: 52,
      title: `${data.name || username}'s Dashboard`,
      subtitle: data.bio ? (data.bio.length > 60 ? data.bio.slice(0, 60) + '...' : data.bio) : `@${username}`,
      avatarUrl: data.avatarDataUri || data.avatarUrl,
      align,
    }),

    renderCardWithStats({ x: calculateCardX(0, cardWidth), y: row1Y, width: cardWidth, height: cardHeight, title: card1Title, stats: card1Stats }),
    renderCardWithStats({ x: calculateCardX(1, cardWidth), y: row1Y, width: cardWidth, height: cardHeight, title: 'Streak Stats', stats: streakStats }),
    renderCardWithStats({ x: calculateCardX(2, cardWidth), y: row1Y, width: cardWidth, height: cardHeight, title: card3Title, stats: card3Stats }),

    renderContributionChart({ x: LAYOUT.padding, y: row2Y, width: chartWidth, height: row2Height, title: 'Contribution Activity', data: chartData }),
    renderDonutChart({ x: LAYOUT.padding + chartWidth + LAYOUT.cardGap, y: row2Y, width: row2CardWidth, height: row2Height, title: 'Top Languages', data: topLanguages }),

    showCPSection
      ? renderCPSection({
          x: LAYOUT.padding,
          y: cpRowY,
          width: fullWidth,
          leetcode: shouldRenderLeetCode ? leetcodeData : null,
          codeforces: codeforcesData,
          codechef: codechefData,
        })
      : '',

    hideTrophies
      ? ''
      : renderTrophyRow({
          x: LAYOUT.padding,
          y: trophyRowY,
          width: fullWidth,
          height: trophyRowHeight,
          data: trophyData,
        }),
  ].join('\n');

  const totalLangValue = topLanguages.reduce((sum, item) => sum + item.value, 0);
  const languagesWithPct = topLanguages.map(item => ({
    label: item.label,
    percentage: totalLangValue ? Math.round((item.value / totalLangValue) * 100) : 0
  }));

  const accessibility = buildDashboardAccessibility({
    username,
    contributions: contributionData ? contributionData.totalContributions : 0,
    prs: contributionData ? contributionData.totalPRs : 0,
    issues: contributionData ? contributionData.totalIssues : 0,
    currentStreak: contributionData ? contributionData.currentStreak : 0,
    longestStreak: contributionData ? contributionData.longestStreak : 0,
    languages: languagesWithPct,
    trophies: trophyData,
  });

  const svg = wrapSvg(
    content,
    width,
    totalHeight,
    accessibility
  );

  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Cache-Control', 'public, max-age=1800');
  res.send(svg);
  } catch (error) {
    console.error('Profile render failed:', error.message);
    return sendGracefulErrorSvg(res, {
      code: GitHubErrorCode.API_ERROR,
      username: typeof req.query.username === 'string' ? req.query.username : undefined,
      detail: error.message,
    });
  }
});

// Loading spinner endpoint
router.get('/loading', (req, res) => {
  const { theme, customThemeOverrides } = normalizeProfileQuery(req.query);
  let activeTheme = setTheme(theme);
  if (customThemeOverrides && Object.keys(customThemeOverrides).length > 0) {
    const hybridTheme = createHybridTheme(activeTheme, customThemeOverrides);
    activeTheme = setTheme(hybridTheme);
  }
  return sendLoadingSpinner(res);
});

export default router;
