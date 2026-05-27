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
import { renderContributionChart, generateFakeContributionData, renderDonutChart } from '../renderers/chart.renderer.js';
import { getGitHubUserData } from '../services/github.service.js';
import { getContributionData } from '../services/github-graphql.service.js';
import { getLeetCodeData } from '../services/leetcode.service.js';
import { getCodeforcesData } from '../services/codeforces.service.js';
import { getCodeChefData } from '../services/codechef.service.js';
import { renderCPSection } from '../renderers/cp-section.renderer.js';
import { sendGracefulErrorSvg } from '../renderers/error.renderer.js';
import { sendLoadingSpinner } from '../renderers/loading.renderer.js';
import { GitHubErrorCode } from '../services/github.service.js';
import { logApiAccess } from '../utils/logger.js';
import { CF_RANK_MAP } from '../constants.js';
import { normalizeProfileQuery, normalizeTheme } from '../utils/query-validation.js';

const router = Router();

const DEFAULT_USERNAME = process.env.DEFAULT_USERNAME || 'SamXop123';

function formatNumber(num) {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
  return num.toString();
}

function getTopLanguages(repos, max = 5) {
  const langCounts = {};
  repos.forEach((repo) => {
    if (repo.language) {
      langCounts[repo.language] = (langCounts[repo.language] || 0) + 1;
    }
  });
  return Object.entries(langCounts)
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, max);
}

router.get('/', async (req, res) => {
  try {
  logApiAccess(req).catch(err => console.error('Log failed:', err.message));

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
  } = normalizeProfileQuery(req.query, { defaultUsername: DEFAULT_USERNAME });
  setTheme(theme);

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

  if (!codeforcesData && !codechefData) {
    if (showRepositoryStats) {
      card3Title = 'Repository Stats';
      card3Stats = [
        { label: 'Repositories', value: formatNumber(data.publicRepos) },
        { label: 'Stars', value: formatNumber(data.totalStars) },
        { label: 'Followers', value: formatNumber(data.followers) },
      ];
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
    card3Title = 'Repository Stats';
    card3Stats = [
      { label: 'Repositories', value: formatNumber(data.publicRepos) },
      { label: 'Stars', value: formatNumber(data.totalStars) },
      { label: 'Followers', value: formatNumber(data.followers) },
    ];
  }

  let chartData;
  if (contributionData && contributionData.days && contributionData.days.length > 0) {
    const recentDays = contributionData.days.slice(-30);
    chartData = recentDays.map(day => day.count);
  } else {
    chartData = generateFakeContributionData(30);
  }

  const topLanguages = getTopLanguages(data.repos, 5);

  const trophyData = {
    commits: contributionData?.totalContributions || 0,
    prs: contributionData?.totalPRs || 0,
    issues: contributionData?.totalIssues || 0,
    repos: data.publicRepos || 0,
    stars: data.totalStars || 0,
    followers: data.followers || 0,
    reviews: contributionData?.totalReviews || 0,
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

  const svg = wrapSvg(content, width, totalHeight);

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
  setTheme(normalizeTheme(req.query.theme));
  return sendLoadingSpinner(res);
});

export default router;