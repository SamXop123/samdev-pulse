import { describe, test, expect, beforeEach } from '@jest/globals';
import { 
  setTheme, 
  SUPPORTED_THEME_NAMES, 
  wrapSvg,
  renderBackground,
  renderCard,
  LAYOUT
} from '../svg.renderer.js';
import { renderLineChart } from '../chart.renderer.js';
import { renderCPSection } from '../cp-section.renderer.js';

/**
 * Visual Regression (Structural Implementation)
 * This test suite captures the "Structural DNA" of every theme.
 * It detects regressions in:
 * - Color codes
 * - Positioning
 * - SVG structure
 * - Font sizes
 */
describe('Visual Regression: Structural Snapshots', () => {
  
  // Create a complex mock data set that exercises all renderers
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
    rating: 1850
  };
  const mockCodeforces = {
    username: 'CodeNinja',
    rank: 'Expert',
    rating: 1750,
    maxRating: 1800
  };

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

      // We focus the snapshot on a cleaned version of the SVG to avoid 
      // environmental noise while capturing all structural details.
      expect(svg).toMatchSnapshot();
    });
  });
});
