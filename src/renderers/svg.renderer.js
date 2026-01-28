
import darkTheme from '../themes/dark.theme.js';

const LAYOUT = {
  width: 960,
  padding: 24,
  cardGap: 16,
  borderRadius: 16,
  cardRadius: 12,
};

// Current active theme
let currentTheme = darkTheme;

/**
 * Get the current theme
 */
export function getTheme() {
  return currentTheme;
}

/**
 * Render the main background with rounded border
 */
export function renderBackground(width, height) {
  const { colors } = currentTheme;
  return `<rect x="0" y="0" width="${width}" height="${height}" rx="${LAYOUT.borderRadius}" ry="${LAYOUT.borderRadius}" fill="${colors.background}" stroke="${colors.border}" stroke-width="2"/>`;
}

