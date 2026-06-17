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

const router = Router();

// Mock data for theme preview
const mockData = {
  name: 'Sam',
  bio: 'Full Stack Developer',
  avatarUrl: 'https://avatars.githubusercontent.com/u/169450602?v=4',
  avatarDataUri: null,
  publicRepos: 25,
  totalStars: 152,
  followers: 89,
  repos: [
    { language: 'JavaScript' },
    { language: 'TypeScript' },
    { language: 'Python' },
    { language: 'Rust' },
    { language: 'Go' },
  ],
};

// Mock contribution data
const mockContributionData = {
  totalContributions: 1247,
  totalPRs: 89,
  totalIssues: 45,
  totalReviews: 23,
  currentStreak: 15,
  longestStreak: 42,
  totalContributionDays: 365,
  days: Array.from({ length: 30 }, (_, i) => ({
    count: Math.floor(Math.random() * 10),
  })),
};

// Trophy data
const mockTrophyData = {
  commits: 1247,
  prs: 89,
  issues: 45,
  repos: 25,
  stars: 152,
  followers: 89,
  reviews: 23,
};

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

// Render a mini dashboard preview for a specific theme
router.get('/:themeName', (req, res) => {
  try {
    const { themeName } = req.params;

    setTheme(themeName);

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
      { label: 'Contributions', value: formatNumber(mockContributionData.totalContributions) },
      { label: 'PRs Opened', value: formatNumber(mockContributionData.totalPRs) },
      { label: 'Issues Opened', value: formatNumber(mockContributionData.totalIssues) },
    ];

    const streakStats = [
      { label: 'Current', value: formatNumber(mockContributionData.currentStreak) },
      { label: 'Longest', value: formatNumber(mockContributionData.longestStreak) },
      { label: 'Total', value: formatNumber(mockContributionData.totalContributionDays) },
    ];

    const card3Title = 'Repository Stats';
    const card3Stats = [
      { label: 'Repositories', value: formatNumber(mockData.publicRepos) },
      { label: 'Stars', value: formatNumber(mockData.totalStars) },
      { label: 'Followers', value: formatNumber(mockData.followers) },
    ];

    const chartData = mockContributionData.days.map((day) => day.count);
    const topLanguages = getTopLanguages(mockData.repos, 5);

    if (topLanguages.length === 0) {
      topLanguages.push({
        label: 'No Data',
        value: 1,
      });
    }

    const trophyRowY = row2Y + row2Height + LAYOUT.cardGap;
    const trophyRowHeight = 165;

    const totalHeight = trophyRowY + trophyRowHeight + LAYOUT.padding;

    const content = [
      renderBackground(width, totalHeight),
      renderHeader({
        x: LAYOUT.padding,
        y: 52,
        title: `${mockData.name}'s Dashboard`,
        subtitle: mockData.bio,
        avatarUrl: mockData.avatarDataUri || mockData.avatarUrl,
        align: 'left',
      }),

      renderCardWithStats({
        x: calculateCardX(0, cardWidth),
        y: row1Y,
        width: cardWidth,
        height: cardHeight,
        title: card1Title,
        stats: card1Stats,
      }),
      renderCardWithStats({
        x: calculateCardX(1, cardWidth),
        y: row1Y,
        width: cardWidth,
        height: cardHeight,
        title: 'Streak Stats',
        stats: streakStats,
      }),
      renderCardWithStats({
        x: calculateCardX(2, cardWidth),
        y: row1Y,
        width: cardWidth,
        height: cardHeight,
        title: card3Title,
        stats: card3Stats,
      }),

      renderContributionChart({
        x: LAYOUT.padding,
        y: row2Y,
        width: chartWidth,
        height: row2Height,
        title: 'Contribution Activity',
        data: chartData,
      }),
      renderDonutChart({
        x: LAYOUT.padding + chartWidth + LAYOUT.cardGap,
        y: row2Y,
        width: row2CardWidth,
        height: row2Height,
        title: 'Top Languages',
        data: topLanguages,
      }),

      renderTrophyRow({
        x: LAYOUT.padding,
        y: trophyRowY,
        width: fullWidth,
        height: trophyRowHeight,
        data: mockTrophyData,
      }),
    ].join('\n');

    const svg = wrapSvg(content, width, totalHeight, {
      title: `${mockData.name}'s Dashboard - ${themeName} Theme`,
      description: 'GitHub profile statistics dashboard preview',
    });

    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'public, max-age=1800');
    res.send(svg);
  } catch (error) {
    console.error('Theme preview render failed:', error.message);
    res.status(500).json({ error: 'Error rendering theme preview'});
  }
});

export default router;