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

// GET /api/profile?username=octocat&theme=dark&leetcode=username
router.get('/', async (req, res) => {
  const { theme, leetcode } = req.query;
  const username = req.query.username || DEFAULT_USERNAME;

  // Set theme (defaults to dark)
  setTheme(theme || 'dark');

  // Fetch GitHub data
  const result = await getGitHubUserData(username);

  if (!result.success) {
    return res.status(500).json({ error: result.error });
  }

  const { data } = result;

  // Fetch contribution data for streaks (non-blocking)
  const contributionResult = await getContributionData(username);
  const contributionData = contributionResult.success ? contributionResult.data : null;

  // Fetch LeetCode data if username provided (non-blocking)
  const leetcodeResult = leetcode ? await getLeetCodeData(leetcode) : null;
  const leetcodeData = leetcodeResult?.success ? leetcodeResult.data : null;

  const width = LAYOUT.width;
  const height = 480;

  // Row 1: Three stat cards
  const cardWidth = calculateCardWidth(3);
  const cardHeight = 140;
  const row1Y = 80;

  // Row 2: Contribution chart (left) + placeholder (right)
  const row2Y = row1Y + cardHeight + LAYOUT.cardGap;
  const chartWidth = calculateCardWidth(2) + LAYOUT.cardGap / 2;
  const row2CardWidth = calculateCardWidth(2) - LAYOUT.cardGap / 2;
  const row2Height = 200;

  // Card 1: GitHub Stats (real data)
  const githubStats = [
    { label: 'Followers', value: formatNumber(data.followers) },
    { label: 'Repositories', value: formatNumber(data.publicRepos) },
    { label: 'Stars', value: formatNumber(data.totalStars) },
  ];

  // Card 2: Streak Stats (real data from GraphQL)
  const streakStats = [
    { label: 'Current', value: contributionData ? formatNumber(contributionData.currentStreak) : '-' },
    { label: 'Longest', value: contributionData ? formatNumber(contributionData.longestStreak) : '-' },
    { label: 'Total Days', value: contributionData ? formatNumber(contributionData.totalContributionDays) : '-' },
  ];

  // Card 3: Competitive Coding (LeetCode data or placeholder)
  const codingStats = [
    { label: 'Problems', value: leetcodeData ? formatNumber(leetcodeData.totalSolved) : '-' },
    { label: 'Easy/Med/Hard', value: leetcodeData ? `${leetcodeData.easySolved}/${leetcodeData.mediumSolved}/${leetcodeData.hardSolved}` : '-' },
    { label: 'Ranking', value: leetcodeData ? formatNumber(leetcodeData.ranking) : '-' },
  ];

  // Generate fake contribution data for chart
  const chartData = generateFakeContributionData(30);

  // Calculate top languages from repos
  const topLanguages = getTopLanguages(data.repos, 5);

  // Build SVG content
  const content = [
    renderBackground(width, height),
    renderHeader({ x: LAYOUT.padding, y: 48, title: `${data.name}'s Dashboard` }),
    
    // Row 1: Stat cards
    renderCardWithStats({ x: calculateCardX(0, cardWidth), y: row1Y, width: cardWidth, height: cardHeight, title: 'GitHub Stats', stats: githubStats }),

    renderCardWithStats({ x: calculateCardX(1, cardWidth), y: row1Y, width: cardWidth, height: cardHeight, title: 'Streak Stats', stats: streakStats }),

    renderCardWithStats({ x: calculateCardX(2, cardWidth), y: row1Y, width: cardWidth, height: cardHeight, title: leetcodeData ? 'LeetCode Stats' : 'Competitive Coding', stats: codingStats }),

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

