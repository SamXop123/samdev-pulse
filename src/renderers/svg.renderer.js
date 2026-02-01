// SVG Layout System - Premium Modern Design

import darkTheme from '../themes/dark.theme.js';
import lightTheme from '../themes/light.theme.js';
import draculaTheme from '../themes/dracula.theme.js';
import nordTheme from '../themes/nord.theme.js';
import monokaiTheme from '../themes/monokai.theme.js';
import gruvboxTheme from '../themes/gruvbox.theme.js';
import tokyonightTheme from '../themes/tokyonight.theme.js';

const LAYOUT = {
  width: 960,
  padding: 28,
  cardGap: 16,
  borderRadius: 20,
  cardRadius: 16,
};

// Available themes
const themes = {
  dark: darkTheme,
  light: lightTheme,
  dracula: draculaTheme,
  nord: nordTheme,
  monokai: monokaiTheme,
  gruvbox: gruvboxTheme,
  tokyonight: tokyonightTheme,
};

// Current active theme
let currentTheme = darkTheme;

/**
 * Set the active theme
 */
export function setTheme(themeName) {
  currentTheme = themes[themeName] || darkTheme;
  return currentTheme;
}

/**
 * Get the current theme
 */
export function getTheme() {
  return currentTheme;
}

/**
 * Generate SVG definitions (gradients, filters, patterns)
 */
export function renderDefs() {
  const { colors } = currentTheme;

  return `
  <defs>
    <!-- Main gradient -->
    <linearGradient id="mainGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${colors.gradientStart}" stop-opacity="0.15"/>
      <stop offset="50%" stop-color="${colors.gradientMid}" stop-opacity="0.08"/>
      <stop offset="100%" stop-color="${colors.gradientEnd}" stop-opacity="0.15"/>
    </linearGradient>
    
    <!-- Accent gradient for text/elements -->
    <linearGradient id="accentGradient" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${colors.gradientStart}"/>
      <stop offset="100%" stop-color="${colors.gradientEnd}"/>
    </linearGradient>
    
    <!-- Card glow effect -->
    <filter id="cardGlow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="8" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
    
    <!-- Soft glow for accents -->
    <filter id="softGlow" x="-100%" y="-100%" width="300%" height="300%">
      <feGaussianBlur stdDeviation="4" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    
    <!-- Noise texture pattern -->
    <filter id="noise" x="0%" y="0%" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" result="noise"/>
      <feColorMatrix type="saturate" values="0"/>
      <feBlend in="SourceGraphic" in2="noise" mode="overlay" result="blend"/>
      <feComposite in="blend" in2="SourceGraphic" operator="in"/>
    </filter>
    
    <!-- Dot pattern -->
    <pattern id="dotPattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
      <circle cx="2" cy="2" r="0.5" fill="${colors.border}" opacity="0.3"/>
    </pattern>
    
    <!-- Grid pattern -->
    <pattern id="gridPattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="${colors.border}" stroke-width="0.5" opacity="0.2"/>
    </pattern>
  </defs>`;
}

/**
 * Render the main background with gradient overlay
 */
export function renderBackground(width, height) {
  const { colors } = currentTheme;

  return `
  <!-- Base background -->
  <rect x="0" y="0" width="${width}" height="${height}" rx="${LAYOUT.borderRadius}" ry="${LAYOUT.borderRadius}" fill="${colors.background}"/>
  
  <!-- Gradient overlay -->
  <rect x="0" y="0" width="${width}" height="${height}" rx="${LAYOUT.borderRadius}" ry="${LAYOUT.borderRadius}" fill="url(#mainGradient)"/>
  
  <!-- Subtle grid pattern -->
  <rect x="0" y="0" width="${width}" height="${height}" rx="${LAYOUT.borderRadius}" ry="${LAYOUT.borderRadius}" fill="url(#gridPattern)" opacity="0.3"/>
  
  <!-- Top accent glow -->
  <ellipse cx="${width / 2}" cy="0" rx="${width * 0.4}" ry="120" fill="${colors.glow}" opacity="0.08"/>
  
  <!-- Border with glow -->
  <rect x="1" y="1" width="${width - 2}" height="${height - 2}" rx="${LAYOUT.borderRadius}" ry="${LAYOUT.borderRadius}" fill="none" stroke="url(#accentGradient)" stroke-width="1" opacity="0.4"/>`;
}

/**
 * Render a modern card container
 */
export function renderCard({ x, y, width, height, title, glowColor }) {
  const { colors } = currentTheme;
  const glow = glowColor || colors.glow;

  return `
  <g>
    <!-- Card glow -->
    <rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${LAYOUT.cardRadius}" ry="${LAYOUT.cardRadius}" fill="${glow}" opacity="0.03" filter="url(#cardGlow)"/>
    
    <!-- Card background -->
    <rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${LAYOUT.cardRadius}" ry="${LAYOUT.cardRadius}" fill="${colors.cardBackground}"/>
    
    <!-- Inner gradient -->
    <rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${LAYOUT.cardRadius}" ry="${LAYOUT.cardRadius}" fill="url(#mainGradient)" opacity="0.5"/>
    
    <!-- Border -->
    <rect x="${x + 0.5}" y="${y + 0.5}" width="${width - 1}" height="${height - 1}" rx="${LAYOUT.cardRadius}" ry="${LAYOUT.cardRadius}" fill="none" stroke="${colors.borderLight}" stroke-width="1" opacity="0.5"/>
    
    <!-- Title -->
    <text x="${x + 20}" y="${y + 28}" font-family="'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="13" font-weight="600" fill="${colors.secondaryText}" letter-spacing="0.5">${title.toUpperCase()}</text>
    
    <!-- Title underline accent -->
    <rect x="${x + 20}" y="${y + 36}" width="32" height="2" rx="1" fill="url(#accentGradient)" opacity="0.6"/>
  </g>`;
}

/**
 * Render a stat item with icon and modern styling
 */
export function renderStatItem({ x, y, label, value, icon, accentColor, showProgress, progress }) {
  const { colors } = currentTheme;
  const accent = accentColor || colors.accent;

  // Dynamic font size based on value length
  const valueStr = String(value);
  let fontSize = 32;
  if (valueStr.length > 10) fontSize = 18;
  else if (valueStr.length > 7) fontSize = 22;
  else if (valueStr.length > 5) fontSize = 26;

  let iconElement = '';
  if (icon) {
    iconElement = `
      <g transform="translate(${x}, ${y - 28}) scale(0.7)">
        <circle cx="12" cy="12" r="14" fill="${accent}" opacity="0.15"/>
        <path d="${icon}" fill="${accent}" opacity="0.9" transform="translate(4, 4) scale(0.7)"/>
      </g>`;
  }

  let progressBar = '';
  if (showProgress && progress !== undefined) {
    const barWidth = 60;
    const fillWidth = Math.min(barWidth, (progress / 100) * barWidth);
    progressBar = `
      <rect x="${x}" y="${y + 28}" width="${barWidth}" height="3" rx="1.5" fill="${colors.border}"/>
      <rect x="${x}" y="${y + 28}" width="${fillWidth}" height="3" rx="1.5" fill="${accent}"/>`;
  }

  return `
  <g>
    ${iconElement}
    <text x="${x}" y="${y}" font-family="'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="${fontSize}" font-weight="700" fill="${colors.primaryText}">${value}</text>
    <text x="${x}" y="${y + 20}" font-family="'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="11" fill="${colors.mutedText}" letter-spacing="0.3">${label}</text>
    ${progressBar}
  </g>`;
}

/**
 * Render vertical E/M/H stat (Easy/Medium/Hard breakdown)
 */
function renderVerticalEMH({ x, y, easy, medium, hard, accentColor }) {
  const { colors } = currentTheme;

  // Colors for difficulty levels
  const easyColor = '#10b981';  // Green
  const medColor = '#f59e0b';   // Amber
  const hardColor = '#ef4444';  // Red

  const lineHeight = 18;
  const labelWidth = 14;

  return `
  <g>
    <!-- Easy -->
    <text x="${x}" y="${y - 18}" font-family="'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="11" font-weight="600" fill="${easyColor}">E</text>
    <text x="${x + labelWidth}" y="${y - 18}" font-family="'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="14" font-weight="700" fill="${colors.primaryText}">${easy}</text>
    
    <!-- Medium -->
    <text x="${x}" y="${y}" font-family="'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="11" font-weight="600" fill="${medColor}">M</text>
    <text x="${x + labelWidth}" y="${y}" font-family="'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="14" font-weight="700" fill="${colors.primaryText}">${medium}</text>
    
    <!-- Hard -->
    <text x="${x}" y="${y + 18}" font-family="'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="11" font-weight="600" fill="${hardColor}">H</text>
    <text x="${x + labelWidth}" y="${y + 18}" font-family="'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="14" font-weight="700" fill="${colors.primaryText}">${hard}</text>
  </g>`;
}

/**
 * Render a card with stats - modern design
 */
export function renderCardWithStats({ x, y, width, height, title, stats, cardAccent }) {
  const { colors, chartColors } = currentTheme;
  const glow = cardAccent || colors.glow;
  const statsStartY = y + 85;
  const statSpacing = (width - 40) / stats.length;

  const statsContent = stats.map((stat, index) => {
    const statX = x + 20 + (index * statSpacing);
    const accent = chartColors[index % chartColors.length];

    // Handle vertical E/M/H layout
    if (stat.isVertical) {
      return renderVerticalEMH({
        x: statX,
        y: statsStartY,
        easy: stat.easy,
        medium: stat.medium,
        hard: stat.hard,
        accentColor: accent,
      });
    }

    return renderStatItem({
      x: statX,
      y: statsStartY,
      label: stat.label,
      value: stat.value,
      icon: stat.icon,
      accentColor: accent,
      showProgress: stat.showProgress,
      progress: stat.progress,
    });
  }).join('');

  return `
  <g>
    <!-- Card glow -->
    <rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${LAYOUT.cardRadius}" ry="${LAYOUT.cardRadius}" fill="${glow}" opacity="0.04" filter="url(#cardGlow)"/>
    
    <!-- Card background -->
    <rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${LAYOUT.cardRadius}" ry="${LAYOUT.cardRadius}" fill="${colors.cardBackground}"/>
    
    <!-- Inner gradient -->
    <rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${LAYOUT.cardRadius}" ry="${LAYOUT.cardRadius}" fill="url(#mainGradient)" opacity="0.3"/>
    
    <!-- Border -->
    <rect x="${x + 0.5}" y="${y + 0.5}" width="${width - 1}" height="${height - 1}" rx="${LAYOUT.cardRadius}" ry="${LAYOUT.cardRadius}" fill="none" stroke="${colors.borderLight}" stroke-width="1" opacity="0.4"/>
    
    <!-- Title -->
    <text x="${x + 20}" y="${y + 30}" font-family="'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="13" font-weight="600" fill="${colors.secondaryText}" letter-spacing="0.5">${title.toUpperCase()}</text>
    
    <!-- Title accent line -->
    <rect x="${x + 20}" y="${y + 40}" width="28" height="2" rx="1" fill="url(#accentGradient)" opacity="0.7"/>
    
    ${statsContent}
  </g>`;
}

/**
 * Render header section with branding
 */
export function renderHeader({ x, y, title, subtitle, avatarUrl }) {
  const { colors } = currentTheme;

  let avatarElement = '';
  if (avatarUrl) {
    avatarElement = `
      <clipPath id="avatarClip">
        <circle cx="${x + 24}" cy="${y - 8}" r="24"/>
      </clipPath>
      <circle cx="${x + 24}" cy="${y - 8}" r="26" fill="url(#accentGradient)" opacity="0.6"/>
      <image href="${avatarUrl}" x="${x}" y="${y - 32}" width="48" height="48" clip-path="url(#avatarClip)"/>`;
  }

  const titleX = avatarUrl ? x + 64 : x;

  return `
  <g>
    ${avatarElement}
    <!-- Title with gradient -->
    <text x="${titleX}" y="${y}" font-family="'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="26" font-weight="700" fill="url(#accentGradient)">${title}</text>
    ${subtitle ? `<text x="${titleX}" y="${y + 22}" font-family="'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="13" fill="${colors.mutedText}">${subtitle}</text>` : ''}
    
    <!-- Branding -->
    <text x="${LAYOUT.width - LAYOUT.padding}" y="${y}" font-family="'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="12" font-weight="500" fill="${colors.mutedText}" text-anchor="end" opacity="0.6">samdev-pulse</text>
  </g>`;
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

/**
 * Wrap content in SVG root element
 */
export function wrapSvg(content, width, height) {
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
${renderDefs()}
${content}
</svg>`;
}

export { LAYOUT };

