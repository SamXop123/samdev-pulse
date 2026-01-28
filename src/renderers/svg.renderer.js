
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

/**
 * Render a card container with title
 */
export function renderCard({ x, y, width, height, title }) {
  const { colors } = currentTheme;
  const titleY = y + 24;

  return `
  <g>
    <rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${LAYOUT.cardRadius}" ry="${LAYOUT.cardRadius}" fill="${colors.cardBackground}" stroke="${colors.border}" stroke-width="1"/>
    <text x="${x + 16}" y="${titleY}" font-family="Segoe UI, Ubuntu, sans-serif" font-size="14" font-weight="600" fill="${colors.secondaryText}">${title}</text>
  </g>`;
}

/**
 * Render a single stat item (label + value)
 */
export function renderStatItem({ x, y, label, value }) {
  const { colors } = currentTheme;

  return `
  <g>
    <text x="${x}" y="${y}" font-family="Segoe UI, Ubuntu, sans-serif" font-size="28" font-weight="700" fill="${colors.primaryText}">${value}</text>
    <text x="${x}" y="${y + 22}" font-family="Segoe UI, Ubuntu, sans-serif" font-size="12" fill="${colors.secondaryText}">${label}</text>
  </g>`;
}

/**
 * Render a card with stats
 */
export function renderCardWithStats({ x, y, width, height, title, stats }) {
  const { colors } = currentTheme;
  const titleY = y + 24;
  const statsStartY = y + 70;
  const statSpacing = width / stats.length;

  const statsContent = stats.map((stat, index) => {
    const statX = x + 16 + (index * statSpacing);
    return renderStatItem({
      x: statX,
      y: statsStartY,
      label: stat.label,
      value: stat.value,
    });
  }).join('');

  return `
  <g>
    <rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${LAYOUT.cardRadius}" ry="${LAYOUT.cardRadius}" fill="${colors.cardBackground}" stroke="${colors.border}" stroke-width="1"/>
    <text x="${x + 16}" y="${titleY}" font-family="Segoe UI, Ubuntu, sans-serif" font-size="14" font-weight="600" fill="${colors.secondaryText}">${title}</text>
    ${statsContent}
  </g>`;
}

/**
 * Render header section with title
 */
export function renderHeader({ x, y, title }) {
  const { colors } = currentTheme;
  return `<text x="${x}" y="${y}" font-family="Segoe UI, Ubuntu, sans-serif" font-size="24" font-weight="600" fill="${colors.primaryText}">${title}</text>`;
}

/**
 * Calculate card width for a row with n cards
 */
export function calculateCardWidth(numCards) {
  const availableWidth = LAYOUT.width - (LAYOUT.padding * 2);
  const totalGaps = (numCards - 1) * LAYOUT.cardGap;
  return (availableWidth - totalGaps) / numCards;
}

/**
 * Calculate card x position for index in row
 */
export function calculateCardX(index, cardWidth) {
  return LAYOUT.padding + (index * (cardWidth + LAYOUT.cardGap));
}

