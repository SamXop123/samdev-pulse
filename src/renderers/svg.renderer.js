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
export function renderHeader({ x, y, title, subtitle, avatarUrl, align = 'left' }) {
  const { colors } = currentTheme;

  // Calculate positions based on alignment
  let avatarX, titleX, titleAnchor, subtitleAnchor;
  const avatarSize = 48;
  const avatarRadius = 24;
  const contentWidth = LAYOUT.width - (2 * LAYOUT.padding);

  if (align === 'center') {
    // Center alignment
    const titleWidth = title.length * 13; // Approximate width
    const totalWidth = avatarUrl ? avatarSize + 16 + titleWidth : titleWidth;
    const startX = x + (contentWidth - totalWidth) / 2;

    avatarX = startX;
    titleX = avatarUrl ? startX + avatarSize + 16 : startX + totalWidth / 2;
    titleAnchor = avatarUrl ? 'start' : 'middle';
    subtitleAnchor = avatarUrl ? 'start' : 'middle';
  } else if (align === 'right') {
    // Right alignment
    avatarX = x + contentWidth - avatarSize;
    titleX = avatarUrl ? avatarX - 16 : x + contentWidth;
    titleAnchor = 'end';
    subtitleAnchor = 'end';
  } else {
    // Left alignment (default)
    avatarX = x;
    titleX = avatarUrl ? x + avatarSize + 16 : x;
    titleAnchor = 'start';
    subtitleAnchor = 'start';
  }

  let avatarElement = '';
  if (avatarUrl) {
    const avatarCenterX = avatarX + avatarRadius;
    const avatarCenterY = y - 8;
    avatarElement = `
      <clipPath id="avatarClip">
        <circle cx="${avatarCenterX}" cy="${avatarCenterY}" r="${avatarRadius}"/>
      </clipPath>
      <circle cx="${avatarCenterX}" cy="${avatarCenterY}" r="${avatarRadius + 2}" fill="url(#accentGradient)" opacity="0.6"/>
      <image href="${avatarUrl}" x="${avatarX}" y="${avatarCenterY - avatarRadius}" width="${avatarSize}" height="${avatarSize}" clip-path="url(#avatarClip)"/>`;
  }

  // Branding position: left when align=right, right otherwise
  const brandingX = align === 'right' ? LAYOUT.padding : LAYOUT.width - LAYOUT.padding;
  const brandingAnchor = align === 'right' ? 'start' : 'end';

  return `
  <g>
    ${avatarElement}
    <!-- Title with gradient -->
    <text x="${titleX}" y="${y}" font-family="'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="26" font-weight="700" fill="url(#accentGradient)" text-anchor="${titleAnchor}">${title}</text>
    ${subtitle ? `<text x="${titleX}" y="${y + 22}" font-family="'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="13" fill="${colors.mutedText}" text-anchor="${subtitleAnchor}">${subtitle}</text>` : ''}
    
    <!-- Branding -->
    <text x="${brandingX}" y="${y}" font-family="'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="12" font-weight="500" fill="${colors.mutedText}" text-anchor="${brandingAnchor}" opacity="0.6">samdev-pulse</text>
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
 * Get trophy tier based on value and thresholds
 * Returns { tier, color, glowIntensity }
 */
function getTrophyTier(value, thresholds) {
  const { colors } = currentTheme;

  // Tier thresholds: S(legendary), A(epic), B(rare), C(uncommon), D(common)
  if (value >= thresholds.s) return { tier: 'S', color: '#ffd700', glowIntensity: 0.8, label: 'Legendary' };
  if (value >= thresholds.a) return { tier: 'A', color: '#a855f7', glowIntensity: 0.6, label: 'Epic' };
  if (value >= thresholds.b) return { tier: 'B', color: '#3b82f6', glowIntensity: 0.4, label: 'Rare' };
  if (value >= thresholds.c) return { tier: 'C', color: '#10b981', glowIntensity: 0.25, label: 'Uncommon' };
  return { tier: 'D', color: '#64748b', glowIntensity: 0.1, label: 'Common' };
}

/**
 * Render a hexagonal trophy badge
 */
function renderTrophyBadge({ x, y, size, tier, icon, label, value, uniqueId }) {
  const { colors } = currentTheme;
  const halfSize = size / 2;

  // Hexagon points (pointy-top orientation)
  const hexPoints = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2;
    hexPoints.push(`${x + halfSize + Math.cos(angle) * halfSize * 0.85},${y + halfSize + Math.sin(angle) * halfSize * 0.85}`);
  }
  const hexPath = hexPoints.join(' ');

  // Inner hexagon for border effect
  const innerHexPoints = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2;
    innerHexPoints.push(`${x + halfSize + Math.cos(angle) * halfSize * 0.75},${y + halfSize + Math.sin(angle) * halfSize * 0.75}`);
  }
  const innerHexPath = innerHexPoints.join(' ');

  return `
  <g>
    <!-- Outer glow -->
    <polygon points="${hexPath}" fill="${tier.color}" opacity="${tier.glowIntensity * 0.3}" filter="url(#softGlow)"/>
    
    <!-- Main hexagon background -->
    <polygon points="${hexPath}" fill="${colors.cardBackground}"/>
    
    <!-- Gradient overlay -->
    <polygon points="${hexPath}" fill="url(#mainGradient)" opacity="0.4"/>
    
    <!-- Tier colored border -->
    <polygon points="${hexPath}" fill="none" stroke="${tier.color}" stroke-width="2" opacity="0.8"/>
    
    <!-- Inner hexagon accent -->
    <polygon points="${innerHexPoints.join(' ')}" fill="none" stroke="${tier.color}" stroke-width="1" opacity="0.3"/>
    
    <!-- Icon -->
    <g transform="translate(${x + halfSize - 10}, ${y + halfSize - 18})">
      <path d="${icon}" fill="${tier.color}" opacity="0.9" transform="scale(0.9)"/>
    </g>
    
    <!-- Tier badge -->
    <circle cx="${x + size - 8}" cy="${y + 12}" r="10" fill="${tier.color}"/>
    <text x="${x + size - 8}" y="${y + 16}" font-family="'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="11" font-weight="800" fill="${colors.background}" text-anchor="middle">${tier.tier}</text>
    
    <!-- Label -->
    <text x="${x + halfSize}" y="${y + size + 14}" font-family="'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="10" font-weight="600" fill="${colors.secondaryText}" text-anchor="middle">${label}</text>
    
    <!-- Value -->
    <text x="${x + halfSize}" y="${y + size + 28}" font-family="'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="13" font-weight="700" fill="${colors.primaryText}" text-anchor="middle">${value}</text>
  </g>`;
}

/**
 * Render the trophy row
 */
export function renderTrophyRow({ x, y, width, height, data }) {
  const { colors } = currentTheme;

  // Trophy icons (simple SVG paths)
  const icons = {
    commits: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z',
    prs: 'M6 3a3 3 0 1 0 0 6 3 3 0 0 0 0-6zm0 8a5 5 0 0 1-5-5V5a5 5 0 0 1 10 0v1a5 5 0 0 1-5 5zm12-8a3 3 0 1 0 0 6 3 3 0 0 0 0-6zm0 14a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM6 19v-2a1 1 0 0 1 2 0v2a3 3 0 1 1-6 0v-2a1 1 0 0 1 2 0v2a1 1 0 0 0 2 0z',
    issues: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z',
    repos: 'M4 4v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-4H6c-1.1 0-2 .9-2 2zm9 0l5 4h-5V4zM7 8h4v2H7V8zm0 4h10v2H7v-2zm0 4h10v2H7v-2z',
    stars: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
    followers: 'M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z',
  };

  // Thresholds for each trophy type
  const thresholds = {
    commits: { s: 5000, a: 2000, b: 500, c: 100 },
    prs: { s: 500, a: 200, b: 50, c: 10 },
    issues: { s: 300, a: 100, b: 30, c: 10 },
    repos: { s: 100, a: 50, b: 20, c: 5 },
    stars: { s: 1000, a: 500, b: 100, c: 20 },
    followers: { s: 1000, a: 500, b: 100, c: 20 },
  };

  const trophySize = 70;
  const trophyGap = 24;
  const totalTrophies = 6;
  const totalWidth = (trophySize * totalTrophies) + (trophyGap * (totalTrophies - 1));
  const startX = x + (width - totalWidth) / 2;

  // Build trophy data
  const trophies = [
    { key: 'commits', label: 'Commits', value: data.commits },
    { key: 'prs', label: 'PRs', value: data.prs },
    { key: 'issues', label: 'Issues', value: data.issues },
    { key: 'repos', label: 'Repos', value: data.repos },
    { key: 'stars', label: 'Stars', value: data.stars },
    { key: 'followers', label: 'Followers', value: data.followers },
  ];

  // Card background
  const cardContent = `
  <g>
    <!-- Card glow -->
    <rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${LAYOUT.cardRadius}" ry="${LAYOUT.cardRadius}" fill="${colors.glow}" opacity="0.03" filter="url(#cardGlow)"/>
    
    <!-- Card background -->
    <rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${LAYOUT.cardRadius}" ry="${LAYOUT.cardRadius}" fill="${colors.cardBackground}"/>
    
    <!-- Inner gradient -->
    <rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${LAYOUT.cardRadius}" ry="${LAYOUT.cardRadius}" fill="url(#mainGradient)" opacity="0.25"/>
    
    <!-- Border -->
    <rect x="${x + 0.5}" y="${y + 0.5}" width="${width - 1}" height="${height - 1}" rx="${LAYOUT.cardRadius}" ry="${LAYOUT.cardRadius}" fill="none" stroke="${colors.borderLight}" stroke-width="1" opacity="0.4"/>
    
    <!-- Title -->
    <text x="${x + width / 2}" y="${y + 24}" font-family="'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="13" font-weight="600" fill="${colors.secondaryText}" letter-spacing="0.5" text-anchor="middle">ACHIEVEMENT TROPHIES</text>
    
    <!-- Title accent line -->
    <rect x="${x + width / 2 - 40}" y="${y + 32}" width="80" height="2" rx="1" fill="url(#accentGradient)" opacity="0.6"/>
  </g>`;

  // Render trophies
  const trophyContent = trophies.map((trophy, index) => {
    const tier = getTrophyTier(trophy.value, thresholds[trophy.key]);
    const trophyX = startX + (index * (trophySize + trophyGap));
    const trophyY = y + 48;

    // Format value for display
    const displayValue = trophy.value >= 1000
      ? (trophy.value / 1000).toFixed(1) + 'k'
      : trophy.value.toString();

    return renderTrophyBadge({
      x: trophyX,
      y: trophyY,
      size: trophySize,
      tier: tier,
      icon: icons[trophy.key],
      label: trophy.label,
      value: displayValue,
      uniqueId: `trophy-${trophy.key}`,
    });
  }).join('\n');

  return cardContent + trophyContent;
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

