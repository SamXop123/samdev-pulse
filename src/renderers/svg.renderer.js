// SVG Layout System
// src/renderers/svg.renderer.js

export function getColors() {
  return {
    background: '#0f172a',
    cardBg: '#111827',
    border: '#1f2937',

    primaryText: '#f9fafb',
    secondaryText: '#d1d5db',
    mutedText: '#9ca3af',

    success: '#22c55e',
    warning: '#f59e0b',
    danger: '#ef4444',
  };
}
import darkTheme from '../themes/dark.theme.js';
import lightTheme from '../themes/light.theme.js';
import draculaTheme from '../themes/dracula.theme.js';
import nordTheme from '../themes/nord.theme.js';
import monokaiTheme from '../themes/monokai.theme.js';
import gruvboxTheme from '../themes/gruvbox.theme.js';
import tokyonightTheme from '../themes/tokyonight.theme.js';
import solarizedTheme from '../themes/solarized.theme.js';
import catppuccinTheme from '../themes/catppuccin.theme.js';
import rosePineTheme from '../themes/rose-pine.theme.js';
import auroraTheme from '../themes/aurora.theme.js';
import midnightSunsetTheme from '../themes/midnight-sunset.theme.js';
import oneDarkProTheme from '../themes/onedarkpro.theme.js';
import materialTheme from '../themes/material.theme.js';
import synthwave84Theme from '../themes/synthwave84.theme.js';
import forestNightTheme from '../themes/forestnight.theme.js';
import oceanicNextTheme from '../themes/oceanicnext.theme.js';
import emberGlowTheme from '../themes/emberglow.theme.js';
import midnightNeonTheme from '../themes/midnightneon.theme.js';
import pastelDreamTheme from '../themes/pasteldream.theme.js';
import androidstudioTheme from '../themes/androidstudio.theme.js';
import xcodeTheme from '../themes/xcode.theme.js';
import webdevTheme from '../themes/webdev.theme.js';
import aimlTheme from '../themes/aiml.theme.js';
import gamedevTheme from '../themes/gamedev.theme.js';
import { sanitizeSvgValue, sanitizeSvgHref } from '../utils/svg-sanitizer.js';
import { validateThemeAccessibility }
  from '../utils/theme-accessibility.js';


import cobalt2Theme from '../themes/cobalt2.theme.js';
import oneDarkTheme from '../themes/one-dark.theme.js';
import githubLightTheme from '../themes/github-light.theme.js';
const LAYOUT = {
  width: 960,
  padding: 28,
  cardGap: 16,
  borderRadius: 20,
  cardRadius: 16,
};

// available themes
const themes = {
  dark: darkTheme,
  light: lightTheme,
  dracula: draculaTheme,
  nord: nordTheme,
  monokai: monokaiTheme,
  gruvbox: gruvboxTheme,
  tokyonight: tokyonightTheme,
  solarized: solarizedTheme,
  catppuccin: catppuccinTheme,
  'rose-pine': rosePineTheme,
  aurora: auroraTheme,
  'midnight-sunset': midnightSunsetTheme,
  onedarkpro: oneDarkProTheme,
  material: materialTheme,
  synthwave84: synthwave84Theme,
  forestnight: forestNightTheme,
  oceanicnext: oceanicNextTheme,
  emberglow: emberGlowTheme,
  midnightneon: midnightNeonTheme,
  pasteldream: pastelDreamTheme,
  androidstudio: androidstudioTheme,
  xcode: xcodeTheme,
  webdev: webdevTheme,
  aiml: aimlTheme,
  gamedev: gamedevTheme,
 'cobalt2': cobalt2Theme,
'one-dark': oneDarkTheme,
'github-light': githubLightTheme,
};
Object.entries(themes).forEach(
  ([name, theme]) => {
    const result =
      validateThemeAccessibility(theme);

    if (
      !result.primaryPass ||
      !result.secondaryPass
    ) {
      console.warn(
        `[Accessibility] Theme "${name}" may have low contrast`,
        result
      );
    }
  }
);
export const SUPPORTED_THEME_NAMES = Object.freeze(Object.keys(themes));

// current active theme
let currentTheme = darkTheme;

// set active theme
export function setTheme(themeInput) {
  if (themeInput && typeof themeInput === 'object' && themeInput.colors) {
    currentTheme = themeInput;
  } else {
    currentTheme = themes[themeInput] || darkTheme;
  }
  return currentTheme;
}

// get current theme
export function getTheme() {
  return currentTheme;
}

// generate SVG definitions (gradients, filters, patterns)
export function renderDefs() {
  const { colors } = currentTheme;

  return `
  <defs aria-hidden="true">
    <!-- main gradient -->
    <linearGradient id="mainGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${colors.gradientStart}" stop-opacity="0.15"/>
      <stop offset="50%" stop-color="${colors.gradientMid}" stop-opacity="0.08"/>
      <stop offset="100%" stop-color="${colors.gradientEnd}" stop-opacity="0.15"/>
    </linearGradient>

    <!-- accent gradient for text/elements -->
    <linearGradient id="accentGradient" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${colors.gradientStart}"/>
      <stop offset="100%" stop-color="${colors.gradientEnd}"/>
    </linearGradient>

    <!-- card glow effect -->
    <filter id="cardGlow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="8" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>

    <!-- soft glow for accents -->
    <filter id="softGlow" x="-100%" y="-100%" width="300%" height="300%">
      <feGaussianBlur stdDeviation="4" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>

    <!-- noise texture pattern -->
    <filter id="noise" x="0%" y="0%" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" result="noise"/>
      <feColorMatrix type="saturate" values="0"/>
      <feBlend in="SourceGraphic" in2="noise" mode="overlay" result="blend"/>
      <feComposite in="blend" in2="SourceGraphic" operator="in"/>
    </filter>

    <!-- dot pattern -->
    <pattern id="dotPattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
      <circle cx="2" cy="2" r="0.5" fill="${colors.border}" opacity="0.3"/>
    </pattern>

    <!-- grid pattern -->
    <pattern id="gridPattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="${colors.border}" stroke-width="0.5" opacity="0.2"/>
    </pattern>
  </defs>`;
}

// render the main background with gradient overlay
export function renderBackground(width, height) {
  const { colors } = currentTheme;
  const watermark = currentTheme.domainConfig?.watermark || '';

  return `
  <g aria-hidden="true">
  <!-- base background -->
  <rect x="0" y="0" width="${width}" height="${height}" rx="${LAYOUT.borderRadius}" ry="${LAYOUT.borderRadius}" fill="${colors.background}"/>

  <!-- gradient overlay -->
  <rect x="0" y="0" width="${width}" height="${height}" rx="${LAYOUT.borderRadius}" ry="${LAYOUT.borderRadius}" fill="url(#mainGradient)"/>

  <!-- subtle grid pattern -->
  <rect x="0" y="0" width="${width}" height="${height}" rx="${LAYOUT.borderRadius}" ry="${LAYOUT.borderRadius}" fill="url(#gridPattern)" opacity="0.3"/>

  <!-- top accent glow -->
  <ellipse cx="${width / 2}" cy="0" rx="${width * 0.4}" ry="120" fill="${colors.glow}" opacity="0.08"/>

  <!-- border with glow -->
  <rect x="1" y="1" width="${width - 2}" height="${height - 2}" rx="${LAYOUT.borderRadius}" ry="${LAYOUT.borderRadius}" fill="none" stroke="url(#accentGradient)" stroke-width="1" opacity="0.4"/>

  <!-- watermark -->
  ${watermark}
</g>`;
}
// render a modern card container
export function renderCard({ x, y, width, height, title, glowColor }) {
  const { colors } = currentTheme;
  const glow = glowColor || colors.glow;
  const safeTitle = sanitizeSvgValue(String(title).toUpperCase());
  const cardId = `card-${String(title).toLowerCase().replace(/[^a-z0-9]/g, '-')}-${x}-${y}`;
  const cardDecorations = typeof currentTheme.domainConfig?.cardAccent === 'function'
    ? currentTheme.domainConfig.cardAccent(x, y, width, height, colors)
    : '';

  return `
  <g role="group" aria-labelledby="${cardId}-title">
    <!-- card glow -->
    <rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${LAYOUT.cardRadius}" ry="${LAYOUT.cardRadius}" fill="${glow}" opacity="0.03" filter="url(#cardGlow)"/>

    <!-- card background -->
    <rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${LAYOUT.cardRadius}" ry="${LAYOUT.cardRadius}" fill="${colors.cardBackground}"/>

    <!-- inner gradient -->
    <rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${LAYOUT.cardRadius}" ry="${LAYOUT.cardRadius}" fill="url(#mainGradient)" opacity="0.5"/>

    <!-- border -->
    <rect x="${x + 0.5}" y="${y + 0.5}" width="${width - 1}" height="${height - 1}" rx="${LAYOUT.cardRadius}" ry="${LAYOUT.cardRadius}" fill="none" stroke="${colors.borderLight}" stroke-width="1" opacity="0.5"/>

    <text id="${cardId}-title" x="${x + 20}" y="${y + 28}" font-family="'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="13" font-weight="600" fill="${colors.secondaryText}" letter-spacing="0.5">${safeTitle}</text>
    <!-- title underline accent -->
    <rect x="${x + 20}" y="${y + 36}" width="32" height="2" rx="1" fill="url(#accentGradient)" opacity="0.6"/>

    <!-- domain card decorations -->
    ${cardDecorations}
  </g>`;
}

// render a stat item with icon
export function renderStatItem({ x, y, label, value, icon, accentColor, showProgress, progress }) {
  const { colors } = currentTheme;
  const accent = accentColor || colors.accent;

  // dynamic font size based on value length
  const valueStr = String(value);
  const safeValue = sanitizeSvgValue(valueStr);
  const safeLabel = sanitizeSvgValue(String(label));
  let fontSize = 32;
  if (valueStr.length > 8) fontSize = 14;
  else if (valueStr.length > 6) fontSize = 18;
  else if (valueStr.length > 4) fontSize = 24;


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

  const cleanLabel = String(label).toLowerCase().replace(/[^a-z0-9]/g, '');
  const valId = `val-${cleanLabel}-${x}-${y}`;
  const lblId = `lbl-${cleanLabel}-${x}-${y}`;

  return `
  <g role="group" aria-labelledby="${lblId} ${valId}">
    ${iconElement}
    <text id="${valId}" x="${x}" y="${y}" font-family="'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="${fontSize}" font-weight="700" fill="${colors.primaryText}" ${valueStr.length > 10 ? 'textLength="90" lengthAdjust="spacingAndGlyphs"' : ''}>${safeValue}</text>
    <text id="${lblId}" x="${x}" y="${y + 20}" font-family="'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="11" fill="${colors.mutedText}" letter-spacing="0.3">${safeLabel}</text>
    ${progressBar}
  </g>`;
}

// renders vertical E/M/H stat
function renderVerticalEMH({ x, y, easy, medium, hard, accentColor }) {
  const { colors } = currentTheme;
  const safeEasy = sanitizeSvgValue(easy);
  const safeMedium = sanitizeSvgValue(medium);
  const safeHard = sanitizeSvgValue(hard);

  const easyColor = '#10b981';  // green
  const medColor = '#f59e0b';   // amber
  const hardColor = '#ef4444';  // red

  const lineHeight = 18;
  const labelWidth = 14;

  const easyValId = `val-easy-${x}-${y}`;
  const easyLblId = `lbl-easy-${x}-${y}`;
  const medValId = `val-med-${x}-${y}`;
  const medLblId = `lbl-med-${x}-${y}`;
  const hardValId = `val-hard-${x}-${y}`;
  const hardLblId = `lbl-hard-${x}-${y}`;

  return `
  <g role="group" aria-label="LeetCode Difficulty Breakdown">
    <!-- easy -->
    <g role="group" aria-labelledby="${easyLblId} ${easyValId}">
      <text id="${easyLblId}" x="${x}" y="${y - 18}" font-family="'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="11" font-weight="600" fill="${easyColor}">E</text>
      <text id="${easyValId}" x="${x + labelWidth}" y="${y - 18}" font-family="'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="14" font-weight="700" fill="${colors.primaryText}">${safeEasy}</text>
    </g>

    <!-- medium -->
    <g role="group" aria-labelledby="${medLblId} ${medValId}">
      <text id="${medLblId}" x="${x}" y="${y}" font-family="'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="11" font-weight="600" fill="${medColor}">M</text>
      <text id="${medValId}" x="${x + labelWidth}" y="${y}" font-family="'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="14" font-weight="700" fill="${colors.primaryText}">${safeMedium}</text>
    </g>
    <!-- hard -->
    <g role="group" aria-labelledby="${hardLblId} ${hardValId}">
      <text id="${hardLblId}" x="${x}" y="${y + 18}" font-family="'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="11" font-weight="600" fill="${hardColor}">H</text>
      <text id="${hardValId}" x="${x + labelWidth}" y="${y + 18}" font-family="'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="14" font-weight="700" fill="${colors.primaryText}">${safeHard}</text>
    </g>
  </g>`;
}

// renders a card with stats
export function renderCardWithStats({ x, y, width, height, title, stats, cardAccent }) {
  const { colors, chartColors } = currentTheme;
  const glow = cardAccent || colors.glow;
  const statsStartY = y + 85;
  const statSpacing = (width - 40) / stats.length;
  const safeTitle = sanitizeSvgValue(String(title).toUpperCase());
  const cardId = `card-${String(title).toLowerCase().replace(/[^a-z0-9]/g, '-')}-${x}-${y}`;
  const cardDecorations = typeof currentTheme.domainConfig?.cardAccent === 'function'
    ? currentTheme.domainConfig.cardAccent(x, y, width, height, colors)
    : '';

  const statsContent = stats.map((stat, index) => {
    const statX = x + 20 + (index * statSpacing);
    const accent = chartColors[index % chartColors.length];

    // handle vertical E/M/H layout
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
  <g role="group" aria-labelledby="${cardId}-title">
    <!-- card glow -->
    <rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${LAYOUT.cardRadius}" ry="${LAYOUT.cardRadius}" fill="${glow}" opacity="0.04" filter="url(#cardGlow)"/>

    <!-- card background -->
    <rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${LAYOUT.cardRadius}" ry="${LAYOUT.cardRadius}" fill="${colors.cardBackground}"/>

    <!-- inner gradient -->
    <rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${LAYOUT.cardRadius}" ry="${LAYOUT.cardRadius}" fill="url(#mainGradient)" opacity="0.3"/>

    <!-- border -->
    <rect x="${x + 0.5}" y="${y + 0.5}" width="${width - 1}" height="${height - 1}" rx="${LAYOUT.cardRadius}" ry="${LAYOUT.cardRadius}" fill="none" stroke="${colors.borderLight}" stroke-width="1" opacity="0.4"/>

    <!-- title -->
    <text id="${cardId}-title" x="${x + 20}" y="${y + 30}" font-family="'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="13" font-weight="600" fill="${colors.secondaryText}" letter-spacing="0.5">${safeTitle}</text>
    <!-- title accent line -->
    <rect x="${x + 20}" y="${y + 40}" width="28" height="2" rx="1" fill="url(#accentGradient)" opacity="0.7"/>

    ${statsContent}

    <!-- domain card decorations -->
    ${cardDecorations}
  </g>`;
}

// render header section with branding
export function renderHeader({ x, y, title, subtitle, avatarUrl, align = 'left' }) {
  const { colors } = currentTheme;
  const titleText = String(title ?? '');
  const safeTitle = sanitizeSvgValue(titleText);
  const safeSubtitle = subtitle ? sanitizeSvgValue(subtitle) : '';
  const safeAvatarUrl = sanitizeSvgHref(avatarUrl);

  // calculate positions based on alignment
  let avatarX, titleX, titleAnchor, subtitleAnchor;
  const avatarSize = 48;
  const avatarRadius = 24;
  const contentWidth = LAYOUT.width - (2 * LAYOUT.padding);

  if (align === 'center') {
    // center alignment
    const titleWidth = titleText.length * 13;
    const totalWidth = safeAvatarUrl ? avatarSize + 16 + titleWidth : titleWidth;
    const startX = x + (contentWidth - totalWidth) / 2;

    avatarX = startX;
    titleX = safeAvatarUrl ? startX + avatarSize + 16 : startX + totalWidth / 2;
    titleAnchor = safeAvatarUrl ? 'start' : 'middle';
    subtitleAnchor = safeAvatarUrl ? 'start' : 'middle';
  } else if (align === 'right') {
    // right alignment
    avatarX = x + contentWidth - avatarSize;
    titleX = safeAvatarUrl ? avatarX - 16 : x + contentWidth;
    titleAnchor = 'end';
    subtitleAnchor = 'end';
  } else {
    // left alignment
    avatarX = x;
    titleX = safeAvatarUrl ? x + avatarSize + 16 : x;
    titleAnchor = 'start';
    subtitleAnchor = 'start';
  }

  let avatarElement = '';
  if (safeAvatarUrl) {
    const avatarCenterX = avatarX + avatarRadius;
    const avatarCenterY = y - 8;
    avatarElement = `
      <clipPath id="avatarClip">
        <circle cx="${avatarCenterX}" cy="${avatarCenterY}" r="${avatarRadius}"/>
      </clipPath>
      <circle cx="${avatarCenterX}" cy="${avatarCenterY}" r="${avatarRadius + 2}" fill="url(#accentGradient)" opacity="0.6"/>
      <image href="${safeAvatarUrl}" x="${avatarX}" y="${avatarCenterY - avatarRadius}" width="${avatarSize}" height="${avatarSize}" clip-path="url(#avatarClip)"/>`;
  }

  // branding position: left when align=right, right otherwise
  const brandingX = align === 'right' ? LAYOUT.padding : LAYOUT.width - LAYOUT.padding;
  const brandingAnchor = align === 'right' ? 'start' : 'end';

  const headerDecorations = typeof currentTheme.domainConfig?.headerAccent === 'function'
    ? currentTheme.domainConfig.headerAccent(titleX, y, contentWidth, align, colors, Boolean(safeSubtitle))
    : '';

  return `
  <g>
    ${avatarElement}
    <!-- title with gradient -->
    <text x="${titleX}" y="${y}" font-family="'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="26" font-weight="700" fill="url(#accentGradient)" text-anchor="${titleAnchor}">${safeTitle}</text>
    ${safeSubtitle ? `<text x="${titleX}" y="${y + 22}" font-family="'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="13" fill="${colors.mutedText}" text-anchor="${subtitleAnchor}">${safeSubtitle}</text>` : ''}

    <!-- branding -->
    <text x="${brandingX}" y="${y}" font-family="'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="12" font-weight="500" fill="${colors.mutedText}" text-anchor="${brandingAnchor}" opacity="0.6">samdev-pulse</text>

    <!-- domain header decorations -->
    ${headerDecorations}
  </g>`;
}

// calculate card width for a row with n cards
export function calculateCardWidth(numCards) {
  const availableWidth = LAYOUT.width - (LAYOUT.padding * 2);
  const totalGaps = (numCards - 1) * LAYOUT.cardGap;
  return (availableWidth - totalGaps) / numCards;
}

// calculate card x position for index in row
export function calculateCardX(index, cardWidth) {
  return LAYOUT.padding + (index * (cardWidth + LAYOUT.cardGap));
}

/**
 * get trophy tier based on value and thresholds
 * it returns { tier, color, glowIntensity }
 */
function getTrophyTier(value, thresholds) {
  const { colors } = currentTheme;

  // tier thresholds: S(legendary), A(epic), B(rare), C(uncommon), D(common)
  if (value >= thresholds.s) return { tier: 'S', color: '#ffd700', glowIntensity: 0.8, label: 'Legendary' };
  if (value >= thresholds.a) return { tier: 'A', color: '#a855f7', glowIntensity: 0.6, label: 'Epic' };
  if (value >= thresholds.b) return { tier: 'B', color: '#3b82f6', glowIntensity: 0.4, label: 'Rare' };
  if (value >= thresholds.c) return { tier: 'C', color: '#10b981', glowIntensity: 0.25, label: 'Uncommon' };
  return { tier: 'D', color: '#64748b', glowIntensity: 0.1, label: 'Common' };
}

// render a hexagonal trophy badge
function renderTrophyBadge({ x, y, size, tier, icon, label, value, uniqueId }) {
  const { colors } = currentTheme;
  const halfSize = size / 2;
  const safeTier = sanitizeSvgValue(tier.tier);
  const safeLabel = sanitizeSvgValue(label);
  const safeValue = sanitizeSvgValue(value);

  // hexagon points
  const hexPoints = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2;
    hexPoints.push(`${x + halfSize + Math.cos(angle) * halfSize * 0.85},${y + halfSize + Math.sin(angle) * halfSize * 0.85}`);
  }
  const hexPath = hexPoints.join(' ');

  // inner hexagon for border effect
  const innerHexPoints = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2;
    innerHexPoints.push(`${x + halfSize + Math.cos(angle) * halfSize * 0.75},${y + halfSize + Math.sin(angle) * halfSize * 0.75}`);
  }
  const innerHexPath = innerHexPoints.join(' ');

  return `
  <g>
    <!-- outer glow -->
    <polygon points="${hexPath}" fill="${tier.color}" opacity="${tier.glowIntensity * 0.3}" filter="url(#softGlow)"/>

    <!-- main hexagon background -->
    <polygon points="${hexPath}" fill="${colors.cardBackground}"/>

    <!-- gradient overlay -->
    <polygon points="${hexPath}" fill="url(#mainGradient)" opacity="0.4"/>

    <!-- tier colored border -->
    <polygon points="${hexPath}" fill="none" stroke="${tier.color}" stroke-width="2" opacity="0.8"/>

    <!-- inner hexagon accent -->
    <polygon points="${innerHexPoints.join(' ')}" fill="none" stroke="${tier.color}" stroke-width="1" opacity="0.3"/>

    <!-- icon -->
    <g transform="translate(${x + halfSize - 10}, ${y + halfSize - 18})">
      <path d="${icon}" fill="${tier.color}" opacity="0.9" transform="scale(0.9)"/>
    </g>

    <!-- tier badge -->
    <circle cx="${x + size - 8}" cy="${y + 12}" r="10" fill="${tier.color}"/>
    <text x="${x + size - 8}" y="${y + 16}" font-family="'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="11" font-weight="800" fill="${colors.background}" text-anchor="middle">${safeTier}</text>

    <!-- label -->
    <text x="${x + halfSize}" y="${y + size + 14}" font-family="'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="10" font-weight="600" fill="${colors.secondaryText}" text-anchor="middle">${safeLabel}</text>

    <!-- value -->
    <text x="${x + halfSize}" y="${y + size + 28}" font-family="'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="13" font-weight="700" fill="${colors.primaryText}" text-anchor="middle">${safeValue}</text>
  </g>`;
}

// renders the trophy row
export function renderTrophyRow({ x, y, width, height, data }) {
  const { colors } = currentTheme;
  const trophyDescription = sanitizeSvgValue(
  `Achievements: ${data.commits} commits, ` +
  `${data.prs} pull requests, ` +
  `${data.reviews} reviews, ` +
  `${data.issues} issues, ` +
  `${data.repos} repositories, ` +
  `${data.stars} stars, ` +
  `${data.followers} followers.`
);
  // trophy icons
  const icons = {
    commits: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z',
    prs: 'M6 3a3 3 0 1 0 0 6 3 3 0 0 0 0-6zm0 8a5 5 0 0 1-5-5V5a5 5 0 0 1 10 0v1a5 5 0 0 1-5 5zm12-8a3 3 0 1 0 0 6 3 3 0 0 0 0-6zm0 14a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM6 19v-2a1 1 0 0 1 2 0v2a3 3 0 1 1-6 0v-2a1 1 0 0 1 2 0v2a1 1 0 0 0 2 0z',
    issues: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z',
    repos: 'M4 4v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-4H6c-1.1 0-2 .9-2 2zm9 0l5 4h-5V4zM7 8h4v2H7V8zm0 4h10v2H7v-2zm0 4h10v2H7v-2z',
    stars: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
    followers: 'M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z',
    reviews: 'M21 6h-2v9H7v2c0 .55.45 1 1 1h9l4 4V7c0-.55-.45-1-1-1zM17 11V3c0-.55-.45-1-1-1H3c-.55 0-1 .45-1 1v14l4-4h10c.55 0 1-.45 1-1z',
  };

  // thresholds for each trophy type
  const thresholds = {
    commits: { s: 5000, a: 2000, b: 500, c: 100 },
    prs: { s: 500, a: 200, b: 50, c: 10 },
    issues: { s: 300, a: 100, b: 30, c: 10 },
    repos: { s: 100, a: 50, b: 20, c: 5 },
    stars: { s: 1000, a: 500, b: 100, c: 20 },
    followers: { s: 1000, a: 500, b: 100, c: 20 },
    reviews: { s: 200, a: 100, b: 50, c: 10 },
  };

  const trophySize = 70;
  const trophyGap = 16;
  const totalTrophies = 7;
  const totalWidth = (trophySize * totalTrophies) + (trophyGap * (totalTrophies - 1));
  const startX = x + (width - totalWidth) / 2;

  const customLabels = currentTheme.domainConfig?.trophyLabels || {};

  // trophy data
  const trophies = [
    { key: 'commits', label: customLabels.commits || 'Commits', value: data.commits },
    { key: 'prs', label: customLabels.prs || 'PRs', value: data.prs },
    { key: 'reviews', label: customLabels.reviews || 'Reviews', value: data.reviews },
    { key: 'issues', label: customLabels.issues || 'Issues', value: data.issues },
    { key: 'repos', label: customLabels.repos || 'Repos', value: data.repos },
    { key: 'stars', label: customLabels.stars || 'Stars', value: data.stars },
    { key: 'followers', label: customLabels.followers || 'Followers', value: data.followers },
  ];

  // card background
  const cardContent = `
  <g
  role="group"
  aria-labelledby="trophy-title"
>
  <title id="trophy-title">Achievement Trophies</title>
  <desc>${trophyDescription}</desc>
    <!-- card glow -->
    <rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${LAYOUT.cardRadius}" ry="${LAYOUT.cardRadius}" fill="${colors.glow}" opacity="0.03" filter="url(#cardGlow)"/>

    <!-- card background -->
    <rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${LAYOUT.cardRadius}" ry="${LAYOUT.cardRadius}" fill="${colors.cardBackground}"/>

    <!-- inner gradient -->
    <rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${LAYOUT.cardRadius}" ry="${LAYOUT.cardRadius}" fill="url(#mainGradient)" opacity="0.25"/>

    <!-- border -->
    <rect x="${x + 0.5}" y="${y + 0.5}" width="${width - 1}" height="${height - 1}" rx="${LAYOUT.cardRadius}" ry="${LAYOUT.cardRadius}" fill="none" stroke="${colors.borderLight}" stroke-width="1" opacity="0.4"/>

    <!-- title -->
    <text x="${x + width / 2}" y="${y + 24}" font-family="'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="13" font-weight="600" fill="${colors.secondaryText}" letter-spacing="0.5" text-anchor="middle">ACHIEVEMENT TROPHIES</text>

    <!-- title accent line -->
    <rect x="${x + width / 2 - 40}" y="${y + 32}" width="80" height="2" rx="1" fill="url(#accentGradient)" opacity="0.6"/>
  </g>`;

  // renders trophies
  const trophyContent = trophies.map((trophy, index) => {
    const tier = getTrophyTier(trophy.value, thresholds[trophy.key]);
    const trophyX = startX + (index * (trophySize + trophyGap));
    const trophyY = y + 48;

    // format value for display
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

export const DOMAIN_DNA_RULES = [
  { name: 'Android', languages: ['kotlin', 'java'], keywords: ['android', 'compose', 'jetpack', 'gradle', 'firebase'] },
  { name: 'iOS/macOS', languages: ['swift', 'objective-c'], keywords: ['ios', 'swiftui', 'uikit', 'xcode', 'macos', 'cocoapods'] },
  { name: 'Web Dev', languages: ['javascript', 'typescript', 'html', 'css', 'scss', 'vue', 'svelte'], keywords: ['web', 'frontend', 'backend', 'react', 'nextjs', 'node', 'express', 'fullstack'] },
  { name: 'AI / ML', languages: ['python', 'r', 'julia'], keywords: ['ai', 'ml', 'tensorflow', 'pytorch', 'openai', 'llm', 'langchain', 'data-science'] },
  { name: 'Game Dev', languages: ['c#', 'c++', 'gdscript'], keywords: ['game', 'unity', 'unreal', 'godot', 'opengl', 'vulkan', 'directx'] }
];

export function matchesConfig(repo, config) {
  const lang = (repo.language || '').toLowerCase();
  const name = (repo.name || '').toLowerCase();
  const desc = (repo.description || '').toLowerCase();

  let topics = [];
  if (Array.isArray(repo.topics)) {
    topics = repo.topics.map(t => String(t).toLowerCase());
  }

  if (config.languages && config.languages.map(l => l.toLowerCase()).includes(lang)) {
    return true;
  }

  if (config.keywords) {
    for (const kw of config.keywords) {
      const kwLower = kw.toLowerCase();
      if (name.includes(kwLower) || desc.includes(kwLower) || topics.includes(kwLower)) {
        return true;
      }
    }
  }

  return false;
}

export function calculateDeveloperDNA(repos) {
  if (!Array.isArray(repos) || repos.length === 0) return [];

  const scores = DOMAIN_DNA_RULES.map(rule => {
    let score = 0;
    repos.forEach(repo => {
      if (matchesConfig(repo, rule)) {
        score++;
      }
    });
    return { name: rule.name, score };
  });

  const totalScore = scores.reduce((sum, s) => sum + s.score, 0);
  if (totalScore === 0) return [];

  return scores
    .map(s => ({
      name: s.name,
      percentage: Math.round((s.score / totalScore) * 100)
    }))
    .filter(s => s.percentage > 0)
    .sort((a, b) => b.percentage - a.percentage);
}

export function calculateDomainInsights(theme, repos) {
  if (!theme.domainConfig?.insightsConfig || !Array.isArray(repos) || repos.length === 0) {
    return null;
  }

  const { title, metrics } = theme.domainConfig.insightsConfig;
  const totalRepos = repos.length;

  const stats = metrics.map(m => {
    const matchingCount = repos.filter(r => matchesConfig(r, m)).length;
    let valStr = String(matchingCount);

    if (m.isRatio) {
      const ratio = Math.round((matchingCount / totalRepos) * 100);
      valStr = `${ratio}%`;
    }

    return {
      label: m.label,
      value: valStr
    };
  });

  return { title, stats };
}

export function renderDeveloperPersonaCard({ x, y, width, height, dna, badges }) {
  const { colors } = getTheme();
  const cardId = `developer-persona-${x}-${y}`;

  // Left side: Developer DNA
  let dnaContent = `
    <text x="${x + 20}" y="${y + 50}" font-family="'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="11" font-weight="600" fill="${colors.secondaryText}" letter-spacing="0.5">DEVELOPER DNA</text>
  `;

  if (dna.length === 0) {
    dnaContent += `
      <text x="${x + 20}" y="${y + 80}" font-family="'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="12" fill="${colors.mutedText}">No repository metrics detected</text>
    `;
  } else {
    dna.slice(0, 3).forEach((item, index) => {
      const itemY = y + 72 + index * 18;
      const barWidth = 140;
      const filledWidth = Math.round((item.percentage / 100) * barWidth);

      dnaContent += `
        <text x="${x + 20}" y="${itemY}" font-family="'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="11" font-weight="600" fill="${colors.primaryText}">${sanitizeSvgValue(item.name)}</text>

        <!-- progress bar background -->
        <rect x="${x + 105}" y="${itemY - 8}" width="${barWidth}" height="8" rx="4" ry="4" fill="${colors.border}" />

        <!-- progress bar fill -->
        <rect x="${x + 105}" y="${itemY - 8}" width="${filledWidth}" height="8" rx="4" ry="4" fill="${colors.accent}" />

        <text x="${x + 105 + barWidth + 12}" y="${itemY - 1}" font-family="'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="11" font-weight="700" fill="${colors.accent}">${item.percentage}%</text>
      `;
    });
  }

  // Right side: Tech Badges
  let badgesContent = `
    <text x="${x + 380}" y="${y + 50}" font-family="'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="11" font-weight="600" fill="${colors.secondaryText}" letter-spacing="0.5">TECH STACK DIRECTORY</text>
  `;

  if (badges.length === 0) {
    badgesContent += `
      <text x="${x + 380}" y="${y + 80}" font-family="'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="12" fill="${colors.mutedText}">No specialized technologies detected</text>
    `;
  } else {
    let startX = x + 380;
    let badgeY = y + 68;
    let rowCount = 0;

    badges.slice(0, 8).forEach((badgeName, index) => {
      const pillWidth = 24 + badgeName.length * 6;

      if (startX + pillWidth > x + width - 20) {
        startX = x + 380;
        badgeY += 24;
        rowCount++;
      }

      if (rowCount < 2) {
        badgesContent += `
          <g>
            <rect x="${startX}" y="${badgeY}" width="${pillWidth}" height="18" rx="9" ry="9" fill="${colors.accent}" opacity="0.08" />
            <rect x="${startX}" y="${badgeY}" width="${pillWidth}" height="18" rx="9" ry="9" fill="none" stroke="${colors.accent}" stroke-width="1" opacity="0.3" />
            <text x="${startX + pillWidth / 2}" y="${badgeY + 13}" font-family="'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="9.5" font-weight="600" fill="${colors.accent}" text-anchor="middle">${sanitizeSvgValue(badgeName)}</text>
          </g>
        `;
        startX += pillWidth + 8;
      }
    });
  }

  return `
  <g role="group" aria-labelledby="${cardId}-title">
    <!-- card background -->
    <rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${LAYOUT.cardRadius}" ry="${LAYOUT.cardRadius}" fill="${colors.cardBackground}"/>
    <!-- inner gradient -->
    <rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${LAYOUT.cardRadius}" ry="${LAYOUT.cardRadius}" fill="url(#mainGradient)" opacity="0.3"/>
    <!-- border -->
    <rect x="${x + 0.5}" y="${y + 0.5}" width="${width - 1}" height="${height - 1}" rx="${LAYOUT.cardRadius}" ry="${LAYOUT.cardRadius}" fill="none" stroke="${colors.borderLight}" stroke-width="1" opacity="0.4"/>

    <!-- title -->
    <text id="${cardId}-title" x="${x + 20}" y="${y + 26}" font-family="'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="13" font-weight="600" fill="${colors.secondaryText}" letter-spacing="0.5">DEVELOPER PERSONA PROFILE</text>
    <rect x="${x + 20}" y="${y + 34}" width="28" height="2" rx="1" fill="url(#accentGradient)" opacity="0.7"/>

    <!-- divider -->
    <line x1="${x + 350}" y1="${y + 45}" x2="${x + 350}" y2="${y + height - 25}" stroke="${colors.border}" stroke-width="1" opacity="0.4" />

    ${dnaContent}
    ${badgesContent}
  </g>`;
}

// wrap content in SVG root element
export function wrapSvg(
  content,
  width,
  height,
  accessibility = {}
) {
  const title = accessibility.title || 'GitHub Dashboard';
  const description = accessibility.description || 'GitHub profile statistics';

  return `
<svg
  xmlns="http://www.w3.org/2000/svg"
  xmlns:xlink="http://www.w3.org/1999/xlink"
  width="${width}"
  height="${height}"
  viewBox="0 0 ${width} ${height}"
  role="img"
  aria-labelledby="dashboard-title dashboard-desc"
  xml:lang="en"
  lang="en"
>
<title id="dashboard-title">${title}</title>
<desc id="dashboard-desc">${description}</desc>

${renderDefs()}
${content}
</svg>`;
}

export { LAYOUT };
