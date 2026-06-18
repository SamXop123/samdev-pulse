import { describe, test, expect, beforeEach } from '@jest/globals';
import {
  getTheme,
  setTheme,
  SUPPORTED_THEME_NAMES,
  wrapSvg,
  renderBackground,
  renderCard,
  renderTrophyRow,
  LAYOUT,
} from '../svg.renderer.js';
import { renderLineChart } from '../chart.renderer.js';
import { renderCPSection } from '../cp-section.renderer.js';
import { renderGracefulError } from '../error.renderer.js';

/**
 * Visual Regression (Structural Implementation)
 * This test suite captures the "Structural DNA" of every theme.
 */
describe('Visual Regression: Structural Snapshots', () => {
  const requiredColorProperties = [
    'background',
    'backgroundAlt',
    'cardBackground',
    'cardBackgroundAlt',
    'border',
    'borderLight',
    'borderGlow',
    'primaryText',
    'secondaryText',
    'mutedText',
    'accent',
    'accentSecondary',
    'accentTertiary',
    'accentWarm',
    'accentHot',
    'gradientStart',
    'gradientMid',
    'gradientEnd',
    'success',
    'warning',
    'error',
    'glow',
    'glowSecondary',
  ];

  const mockChartData = [10, 40, 20, 80, 50, 90, 70];
  const mockLeetCode = {
    username: 'TestUser',
    rank: 12345,
    solved: 450,
    total: 3000,
    easy: 200,
    medium: 200,
    hard: 50,
    streak: 15,
    rating: 1850,
  };
  const mockCodeforces = {
    username: 'CodeNinja',
    rank: 'Expert',
    rating: 1750,
    maxRating: 1800,
  };
  const mockCpLeetCode = {
    username: 'TestUser',
    ranking: 12345,
    totalSolved: 450,
    easySolved: 200,
    mediumSolved: 200,
    hardSolved: 50,
    contestRating: 1850,
  };
  const mockCpCodeforces = {
    username: 'CodeNinja',
    rank: 'Expert',
    rating: 1750,
    maxRating: 1800,
    problemsSolved: 642,
  };
  const mockCodeChef = {
    username: 'ChefNinja',
    currentRating: 1620,
    stars: '3★',
    division: 'Div 2',
    globalRank: 12000,
  };
  const mockTrophies = {
    commits: 1234,
    prs: 87,
    reviews: 44,
    issues: 28,
    repos: 16,
    stars: 321,
    followers: 99,
  };

  beforeEach(() => {
    setTheme('dark');
  });

  function expectValidSvg(svg) {
    expect(svg.trim()).not.toHaveLength(0);
    expect(svg).toMatch(/^\s*<svg[\s\S]*<\/svg>\s*$/);
  }

  function renderWorkflowSnapshot({
    leetcode,
    codeforces,
    codechef,
    showTrophies = true,
  } = {}) {
    const cpSection = renderCPSection({
      x: LAYOUT.padding,
      y: 320,
      width: 900,
      leetcode,
      codeforces,
      codechef,
    });

    const trophyRow = showTrophies
      ? renderTrophyRow({
          x: LAYOUT.padding,
          y: cpSection ? 490 : 320,
          width: 900,
          height: 165,
          data: mockTrophies,
        })
      : '';

    const height = showTrophies ? 700 : 500;
    const content = [
      renderBackground(960, height),
      renderCard({ x: 50, y: 50, width: 200, height: 100, title: 'Test Card' }),
      renderLineChart({
        x: LAYOUT.padding,
        y: 100,
        width: 400,
        height: 200,
        title: 'Activity',
        data: mockChartData,
      }),
      cpSection,
      trophyRow,
    ].join('\n');

    return wrapSvg(content, 960, height);
  }

  SUPPORTED_THEME_NAMES.forEach(themeName => {
    test(`Snapshots theme: ${themeName}`, () => {
      setTheme(themeName);

      const chart = renderLineChart({
        x: LAYOUT.padding,
        y: 100,
        width: 400,
        height: 200,
        title: 'Activity',
        data: mockChartData
      });

      const cpSection = renderCPSection({
        x: LAYOUT.padding,
        y: 320,
        width: 900,
        leetcode: mockLeetCode,
        codeforces: mockCodeforces
      });

      const content = [
        renderBackground(960, 600),
        renderCard({ x: 50, y: 50, width: 200, height: 100, title: 'Test Card' }),
        chart,
        cpSection
      ].join('\n');

      const svg = wrapSvg(content, 960, 600);
      expectValidSvg(svg);
      expect(svg).toMatchSnapshot();
    });
  });

  describe('Renderer permutations', () => {
    test('snapshots hidden trophies', () => {
      const svg = renderWorkflowSnapshot({
        leetcode: mockCpLeetCode,
        codeforces: mockCpCodeforces,
        codechef: mockCodeChef,
        showTrophies: false,
      });

      expectValidSvg(svg);
      expect(svg).not.toContain('Achievement Trophies');
      expect(svg).toMatchSnapshot();
    });

    test('snapshots no CP platform', () => {
      const svg = renderWorkflowSnapshot();

      expectValidSvg(svg);
      expect(svg).not.toContain('Competitive Programming Statistics');
      expect(svg).toMatchSnapshot();
    });

    test('snapshots single CP platform', () => {
      const svg = renderWorkflowSnapshot({
        leetcode: mockCpLeetCode,
      });

      expectValidSvg(svg);
      expect(svg).toContain('LEETCODE STATS');
      expect(svg).toMatchSnapshot();
    });

    test('snapshots multiple CP platforms', () => {
      const svg = renderWorkflowSnapshot({
        leetcode: mockCpLeetCode,
        codeforces: mockCpCodeforces,
        codechef: mockCodeChef,
      });

      expectValidSvg(svg);
      expect(svg).toContain('CODECHEF STATS');
      expect(svg).toMatchSnapshot();
    });

    test('snapshots graceful fallback rendering', () => {
      const svg = renderGracefulError({
        code: 'UNKNOWN_ERROR',
        username: 'fallback-user',
        detail: 'Renderer fallback path',
      });

      expectValidSvg(svg);
      expect(svg).toContain('Unable to Load Profile');
      expect(svg).toMatchSnapshot();
    });
  });

  describe('Theme contract validation', () => {
    test.each(SUPPORTED_THEME_NAMES)('%s exports the renderer theme contract', (themeName) => {
      setTheme(themeName);
      const theme = getTheme();

      expect(theme).toEqual(expect.objectContaining({
        name: expect.any(String),
        colors: expect.any(Object),
        chartColors: expect.any(Array),
      }));
      expect(theme.name).toBe(themeName);

      requiredColorProperties.forEach((property) => {
        expect(theme.colors).toHaveProperty(property);
        expect(theme.colors[property]).toEqual(expect.any(String));
        expect(theme.colors[property]).not.toBe('');
      });

      expect(theme.chartColors.length).toBeGreaterThanOrEqual(5);
      theme.chartColors.forEach((color) => {
        expect(color).toEqual(expect.any(String));
        expect(color).toMatch(/^#[0-9a-f]{6}([0-9a-f]{2})?$/i);
      });
    });
  });
});
