import { describe, test, expect } from '@jest/globals';
import { isValidHexColor, normalizeHexColor } from './query-validation.js';
import { createHybridTheme, validateThemeAccessibility } from './theme-accessibility.js';
import darkTheme from '../themes/dark.theme.js';

describe('theme-accessibility.js & query-validation.js Custom Themes', () => {
  describe('Hex Color Validation & Normalization', () => {
    test('isValidHexColor validates hex strings correctly', () => {
      expect(isValidHexColor('0d1117')).toBe(true);
      expect(isValidHexColor('#58a6ff')).toBe(true);
      expect(isValidHexColor('f00')).toBe(true);
      expect(isValidHexColor('#f00')).toBe(true);

      expect(isValidHexColor('invalid')).toBe(false);
      expect(isValidHexColor('1234')).toBe(false);
      expect(isValidHexColor('#12345')).toBe(false);
      expect(isValidHexColor('')).toBe(false);
      expect(isValidHexColor(null)).toBe(false);
    });

    test('normalizeHexColor formats hex strings consistently', () => {
      expect(normalizeHexColor('0d1117')).toBe('#0d1117');
      expect(normalizeHexColor('#58A6FF')).toBe('#58a6ff');
      expect(normalizeHexColor('f00')).toBe('#ff0000');
      expect(normalizeHexColor('#F00')).toBe('#ff0000');
      expect(normalizeHexColor('invalid')).toBeNull();
    });
  });

  describe('createHybridTheme', () => {
    test('overrides background and text colors correctly', () => {
      const overrides = {
        bg: '#0d1117',
        text: '#58a6ff',
      };
      const hybrid = createHybridTheme(darkTheme, overrides);

      expect(hybrid.colors.background).toBe('#0d1117');
      expect(hybrid.colors.primaryText).toBe('#58a6ff');

      // Derived colors should be calculated based on overrides
      expect(hybrid.colors.cardBackground).toBeDefined();
      expect(hybrid.colors.backgroundAlt).toBeDefined();
      expect(hybrid.colors.secondaryText).toBeDefined();
      expect(hybrid.colors.mutedText).toBeDefined();
    });

    test('overrides accent colors and propagates glow and gradients', () => {
      const overrides = {
        accent: '#238636',
      };
      const hybrid = createHybridTheme(darkTheme, overrides);

      expect(hybrid.colors.accent).toBe('#238636');
      expect(hybrid.colors.glow).toBe('#238636');
      expect(hybrid.colors.gradientStart).toBe('#238636');
      expect(hybrid.colors.gradientEnd).toBe('#238636');
    });

    test('supports explicit specific color overrides', () => {
      const overrides = {
        border: '#ff0000',
        success: '#00ff00',
      };
      const hybrid = createHybridTheme(darkTheme, overrides);

      expect(hybrid.colors.border).toBe('#ff0000');
      expect(hybrid.colors.success).toBe('#00ff00');
    });
  });

  describe('validateThemeAccessibility with Custom Themes', () => {
    test('identifies high contrast custom themes as passing', () => {
      const overrides = {
        bg: '#000000',
        text: '#ffffff',
        sec_text: '#cccccc',
      };
      const hybrid = createHybridTheme(darkTheme, overrides);
      const access = validateThemeAccessibility(hybrid);

      expect(access.primaryPass).toBe(true);
      expect(access.secondaryPass).toBe(true);
    });

    test('identifies low contrast custom themes as failing', () => {
      const overrides = {
        bg: '#ffffff',
        text: '#fffffe', // almost white on white
        sec_text: '#fdfdfd',
      };
      const hybrid = createHybridTheme(darkTheme, overrides);
      const access = validateThemeAccessibility(hybrid);

      expect(access.primaryPass).toBe(false);
      expect(access.secondaryPass).toBe(false);
    });
  });
});
