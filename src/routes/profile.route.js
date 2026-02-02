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
} from '../renderers/svg.renderer.js';
import { renderContributionChart, generateFakeContributionData, renderDonutChart } from '../renderers/chart.renderer.js';
import { getGitHubUserData } from '../services/github.service.js';
import { getContributionData } from '../services/github-graphql.service.js';
import { getLeetCodeData } from '../services/leetcode.service.js';

const router = Router();

// Default fallback username for demo purposes
const DEFAULT_USERNAME = process.env.DEFAULT_USERNAME || 'octocat';

/**
 * Format large numbers (e.g., 1500 -> 1.5k)
 */
function formatNumber(num) {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k';
  }
  return num.toString();
}

/**
 * Calculate top languages from repos
 */
function getTopLanguages(repos, max = 5) {
  const langCounts = {};

  repos.forEach((repo) => {
    if (repo.language) {
      langCounts[repo.language] = (langCounts[repo.language] || 0) + 1;
    }
  });

  const sorted = Object.entries(langCounts)
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, max);

  return sorted;
}

// GET /api/profile?username=octocat&theme=dark&leetcode=username (or leetcode=false to disable)
router.get('/', async (req, res) => {
  const { theme, leetcode, align } = req.query;
  const username = req.query.username || DEFAULT_USERNAME;

  // Set theme (defaults to dark)
  setTheme(theme || 'dark');

  // Check if LeetCode is explicitly disabled
  const leetcodeDisabled = leetcode === 'false';

  // Validate and set alignment (left, center, right - defaults to left)
  const validAlignments = ['left', 'center', 'right'];
  const headerAlign = validAlignments.includes(align) ? align : 'left';

  // Fetch GitHub data
  const result = await getGitHubUserData(username);

  if (!result.success) {
    return res.status(500).json({ error: result.error });
  }

  const { data } = result;

  // Fetch contribution data for streaks (non-blocking)
  const contributionResult = await getContributionData(username);
  const contributionData = contributionResult.success ? contributionResult.data : null;

  // Fetch LeetCode data if username provided and not disabled (non-blocking)
  const leetcodeResult = (leetcode && !leetcodeDisabled) ? await getLeetCodeData(leetcode) : null;
  const leetcodeData = leetcodeResult?.success ? leetcodeResult.data : null;

  const width = LAYOUT.width;
  const height = 480;

  // Row 1: Three stat cards
  const cardWidth = calculateCardWidth(3);
  const cardHeight = 140;
  const row1Y = 95;

  // Row 2: Contribution chart (left) + placeholder (right)
  const row2Y = row1Y + cardHeight + LAYOUT.cardGap;
  const chartWidth = calculateCardWidth(2) + LAYOUT.cardGap / 2;
  const row2CardWidth = calculateCardWidth(2) - LAYOUT.cardGap / 2;
  const row2Height = 200;

  // When LeetCode is disabled, we swap Card 1 and Card 3 to show Contributions first
  let card1Title;
  let card1Stats;
  let card3Title;
  let card3Stats;

  if (leetcodeDisabled) {
    // Card 1: GitHub Activity (show Contributions prominently)
    card1Title = 'GitHub Activity';
    card1Stats = [
      { label: 'Contributions', value: contributionData ? formatNumber(contributionData.totalContributions) : '-' },
      { label: 'PRs Opened', value: contributionData ? formatNumber(contributionData.totalPRs) : '-' },
      { label: 'Issues Opened', value: contributionData ? formatNumber(contributionData.totalIssues) : '-' },
    ];

    // Card 3: Repository Stats (repos, stars, forks)
    card3Title = 'Repository Stats';
    card3Stats = [
      { label: 'Repositories', value: formatNumber(data.publicRepos) },
      { label: 'Stars', value: formatNumber(data.totalStars) },
      { label: 'Followers', value: formatNumber(data.followers) },
    ];
  } else {
    // Card 1: GitHub Stats (commits, PRs, issues) - when LeetCode is enabled
    card1Title = 'GitHub Stats';
    card1Stats = [
      { label: 'Commits', value: contributionData ? formatNumber(contributionData.totalCommits) : formatNumber(0) },
      { label: 'PRs Merged', value: contributionData ? formatNumber(contributionData.prsMerged) : '-' },
      { label: 'Issues', value: contributionData ? formatNumber(contributionData.issuesClosed) : '-' },
    ];
  }

  // Card 2: Streak Stats (real data from GraphQL) - always the same
  const streakStats = [
    { label: 'Current', value: contributionData ? formatNumber(contributionData.currentStreak) : '-' },
    { label: 'Longest', value: contributionData ? formatNumber(contributionData.longestStreak) : '-' },
    { label: 'Total', value: contributionData ? formatNumber(contributionData.totalContributionDays) : '-' },
  ];

  // Card 3: LeetCode stats (only when leetcode is NOT disabled)
  if (!leetcodeDisabled) {
    // LeetCode or Competitive Coding stats
    // Use rating if available (show full number), otherwise fall back to ranking
    const getRatingOrRanking = () => {
      if (!leetcodeData) return { label: 'Rating', value: '-' };
      if (leetcodeData.contestRating) {
        // Show full rating number, not abbreviated
        return { label: 'Rating', value: String(leetcodeData.contestRating) };
      }
      return { label: 'Rank', value: formatNumber(leetcodeData.ranking) };
    };

    // E/M/H as vertical layout object
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

  // Use real contribution data for chart (last 30 days), fallback to fake data if unavailable
  let chartData;
  if (contributionData && contributionData.days && contributionData.days.length > 0) {
    // Get last 30 days of real contribution data
    const recentDays = contributionData.days.slice(-30);
    chartData = recentDays.map(day => day.count);
  } else {
    // Fallback to fake data if real data unavailable
    chartData = generateFakeContributionData(30);
  }

  // Calculate top languages from repos
  const topLanguages = getTopLanguages(data.repos, 5);

  // Build SVG content
  const content = [
    renderBackground(width, height),
    renderHeader({
      x: LAYOUT.padding,
      y: 52,
      title: `${data.name || username}'s Dashboard`,
      subtitle: data.bio ? (data.bio.length > 60 ? data.bio.slice(0, 60) + '...' : data.bio) : `@${username}`,
      avatarUrl: data.avatarUrl,
      align: headerAlign
    }),

    // Row 1: Stat cards
    renderCardWithStats({ x: calculateCardX(0, cardWidth), y: row1Y, width: cardWidth, height: cardHeight, title: card1Title, stats: card1Stats }),

    renderCardWithStats({ x: calculateCardX(1, cardWidth), y: row1Y, width: cardWidth, height: cardHeight, title: 'Streak Stats', stats: streakStats }),

    renderCardWithStats({ x: calculateCardX(2, cardWidth), y: row1Y, width: cardWidth, height: cardHeight, title: card3Title, stats: card3Stats }),

    // Row 2: Contribution chart (left) + Top Languages donut (right)
    renderContributionChart({ x: LAYOUT.padding, y: row2Y, width: chartWidth, height: row2Height, title: 'Contribution Activity', data: chartData }),

    renderDonutChart({ x: LAYOUT.padding + chartWidth + LAYOUT.cardGap, y: row2Y, width: row2CardWidth, height: row2Height, title: 'Top Languages', data: topLanguages }),
  ].join('\n');

  const svg = wrapSvg(content, width, height);

  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Cache-Control', 'public, max-age=1800');
  res.send(svg);
});

export default router;

