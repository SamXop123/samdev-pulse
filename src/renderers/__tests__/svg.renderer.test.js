import { describe, test, expect, beforeEach } from '@jest/globals';
import { setTheme, getTheme, LAYOUT, wrapSvg, renderBackground, renderCard } from '../svg.renderer.js';

describe('svg.renderer.js', () => {
  beforeEach(() => {
    setTheme('dark');
  });

  describe('Theme System', () => {
    test('setTheme sets dark theme', () => {
      setTheme('dark');
      const theme = getTheme();
      expect(theme.colors).toBeDefined();
      expect(theme.colors.primaryText).toBeDefined();
    });

    test('setTheme sets light theme', () => {
      setTheme('light');
      const theme = getTheme();
      expect(theme.colors).toBeDefined();
    });

    test('setTheme defaults to dark for invalid theme', () => {
      setTheme('invalid-theme-xyz');
      const theme = getTheme();
      expect(theme.colors).toBeDefined();
    });

    test('getTheme returns theme object', () => {
      const theme = getTheme();
      expect(theme).toHaveProperty('colors');
      expect(theme.colors).toHaveProperty('primaryText');
      expect(theme.colors).toHaveProperty('secondaryText');
      expect(theme.colors).toHaveProperty('accent');
    });
  });

  describe('LAYOUT constants', () => {
    test('LAYOUT has required properties', () => {
      expect(LAYOUT).toHaveProperty('width');
      expect(LAYOUT).toHaveProperty('padding');
      expect(LAYOUT).toHaveProperty('cardGap');
      expect(LAYOUT).toHaveProperty('borderRadius');
    });

    test('LAYOUT dimensions are valid', () => {
      expect(LAYOUT.width).toBeGreaterThan(0);
      expect(LAYOUT.padding).toBeGreaterThan(0);
      expect(LAYOUT.cardGap).toBeGreaterThan(0);
    });

    test('LAYOUT width is 960', () => {
      expect(LAYOUT.width).toBe(960);
    });
  });

  describe('wrapSvg', () => {
    test('wraps content in SVG tags', () => {
      const content = '<circle cx="100" cy="100" r="50"/>';
      const svg = wrapSvg(content, 200, 200);
      expect(svg).toContain('<svg');
      expect(svg).toContain('</svg>');
      expect(svg).toContain(content);
    });

    test('includes viewBox with correct dimensions', () => {
      const svg = wrapSvg('<circle/>', 300, 400);
      expect(svg).toContain('viewBox="0 0 300 400"');
    });

    test('includes xmlns attribute', () => {
      const svg = wrapSvg('<circle/>', 100, 100);
      expect(svg).toContain('xmlns=');
    });

    test('sets width attribute', () => {
      const svg = wrapSvg('<circle/>', 250, 350);
      expect(svg).toContain('width="250"');
    });

    test('sets height attribute', () => {
      const svg = wrapSvg('<circle/>', 250, 350);
      expect(svg).toContain('height="350"');
    });
  });

  describe('renderBackground', () => {
    test('renders valid SVG element', () => {
      const bg = renderBackground(500, 300);
      expect(bg).toContain('<rect');
      expect(bg).toContain('width="500"');
      expect(bg).toContain('height="300"');
    });

    test('renders rectangle at origin', () => {
      const bg = renderBackground(400, 200);
      expect(bg).toContain('x="0"');
      expect(bg).toContain('y="0"');
    });

    test('uses theme background color', () => {
      const theme = getTheme();
      const bg = renderBackground(300, 300);
      expect(bg).toContain(`fill="${theme.colors.background}"`);
    });

    test('renders for different dimensions', () => {
      const bg1 = renderBackground(960, 240);
      const bg2 = renderBackground(500, 500);
      expect(bg1).toContain('960');
      expect(bg2).toContain('500');
    });
  });

  describe('renderCard', () => {
    test('renders valid card SVG', () => {
      const card = renderCard({
        x: 28,
        y: 95,
        width: 300,
        height: 140,
        title: 'Test Card',
      });
      expect(card).toContain('TEST CARD');
    });

    test('includes card title', () => {
      const card = renderCard({
        x: 0,
        y: 0,
        width: 200,
        height: 100,
        title: 'GitHub Activity',
      });
      expect(card).toContain('GITHUB ACTIVITY');
    });

    test('positions card correctly', () => {
      const card = renderCard({
        x: 50,
        y: 75,
        width: 300,
        height: 150,
        title: 'Card',
      });
      expect(card).toContain('50');
      expect(card).toContain('75');
    });

    test('includes border styling', () => {
      const card = renderCard({
        x: 0,
        y: 0,
        width: 200,
        height: 100,
        title: 'Card',
      });
      expect(card).toContain('stroke');
    });

    test('uses theme colors', () => {
      const theme = getTheme();
      const card = renderCard({
        x: 0,
        y: 0,
        width: 200,
        height: 100,
        title: 'Test',
      });
      expect(card).toContain(theme.colors.cardBackground);
    });
  });

  describe('XML Escaping (indirect through renders)', () => {
    test('special characters in text are handled', () => {
      const card = renderCard({
        x: 0,
        y: 0,
        width: 200,
        height: 100,
        title: 'Test & Special',
      });
      expect(card).toContain('TEST &amp; SPECIAL');
    });
  });

  describe('Multi-theme consistency', () => {
    test('all major themes render valid SVG', () => {
      const themes = ['dark', 'light', 'dracula', 'nord', 'monokai', 'gruvbox'];

      themes.forEach(themeName => {
        setTheme(themeName);
        const bg = renderBackground(300, 300);
        const card = renderCard({
          x: 28,
          y: 50,
          width: 240,
          height: 140,
          title: 'Test',
        });

        expect(bg).toContain('<rect');
        expect(card).toContain('TEST');
      });
    });
  });
});
