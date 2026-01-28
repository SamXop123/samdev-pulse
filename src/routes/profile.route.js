import { Router } from 'express';
import {
  renderBackground,
  renderHeader,
  renderCardWithStats,
  calculateCardWidth,
  calculateCardX,
  wrapSvg,
  LAYOUT,
} from '../renderers/svg.renderer.js';
import { renderContributionChart, generateFakeContributionData } from '../renderers/chart.renderer.js';
import { getGitHubUserData } from '../services/github.service.js';

const router = Router();

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

// GET /api/profile?username=octocat
router.get('/', async (req, res) => {
  const { username } = req.query;

  if (!username) {
    return res.status(400).json({ error: 'username query parameter is required' });
  }

  // Fetch GitHub data
  const result = await getGitHubUserData(username);

  if (!result.success) {
    return res.status(500).json({ error: result.error });
  }

  const { data } = result;

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

  // Card 2: Streak Stats (placeholder data)
  const streakStats = [
    { label: 'Current', value: '14' },
    { label: 'Longest', value: '45' },
    { label: 'Total Days', value: '230' },
  ];

  // Card 3: Competitive Coding (placeholder data)
  const codingStats = [
    { label: 'Problems', value: '127' },
    { label: 'Contests', value: '12' },
    { label: 'Rating', value: '1650' },
  ];

  // Generate fake contribution data
  const contributionData = generateFakeContributionData(30);

  // Build SVG content
  const content = [
    renderBackground(width, height),
    renderHeader({ x: LAYOUT.padding, y: 48, title: `${data.name}'s Dashboard` }),
    
    // Row 1: Stat cards
    renderCardWithStats({ x: calculateCardX(0, cardWidth), y: row1Y, width: cardWidth, height: cardHeight, title: 'GitHub Stats', stats: githubStats }),

    renderCardWithStats({ x: calculateCardX(1, cardWidth), y: row1Y, width: cardWidth, height: cardHeight, title: 'Streak Stats', stats: streakStats }),

    renderCardWithStats({ x: calculateCardX(2, cardWidth), y: row1Y, width: cardWidth, height: cardHeight, title: 'Competitive Coding', stats: codingStats }),

});

export default router;

