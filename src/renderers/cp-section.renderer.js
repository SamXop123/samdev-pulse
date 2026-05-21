import { getTheme } from './svg.renderer.js';
import { sanitizeSvgValue } from '../utils/svg-sanitizer.js';

const CARD_RADIUS = 16;
const CARD_GAP = 16;

export function renderCPSection({ x, y, width, leetcode, codeforces, codechef }) {
  const { colors } = getTheme();

  const platforms = [];

  if (leetcode) {
    platforms.push({
      title: 'LeetCode Stats',
      render: (cx, cy, cw) => renderLeetCodeCard(cx, cy, cw, leetcode, colors),
    });
  }

  if (codeforces) {
    platforms.push({
      title: 'Codeforces Stats',
      render: (cx, cy, cw) => renderCodeforcesCard(cx, cy, cw, codeforces, colors),
    });
  }

  if (codechef) {
    platforms.push({
      title: 'CodeChef Stats',
      render: (cx, cy, cw) => renderCodeChefCard(cx, cy, cw, codechef, colors),
    });
  }

  if (platforms.length === 0) return '';

  const totalGaps = (platforms.length - 1) * CARD_GAP;
  const cardWidth = (width - totalGaps) / platforms.length;
  const cardHeight = 140;

  const cards = platforms.map((platform, i) => {
    const cardX = x + i * (cardWidth + CARD_GAP);
    const cardY = y;
    const safePlatformTitle = sanitizeSvgValue(platform.title.toUpperCase());

    return `
      <g>
        <rect x="${cardX}" y="${cardY}" width="${cardWidth}" height="${cardHeight}"
          rx="${CARD_RADIUS}" ry="${CARD_RADIUS}"
          fill="${colors.glow}" opacity="0.04" filter="url(#cardGlow)"/>
        <rect x="${cardX}" y="${cardY}" width="${cardWidth}" height="${cardHeight}"
          rx="${CARD_RADIUS}" ry="${CARD_RADIUS}"
          fill="${colors.cardBackground}"/>
        <rect x="${cardX}" y="${cardY}" width="${cardWidth}" height="${cardHeight}"
          rx="${CARD_RADIUS}" ry="${CARD_RADIUS}"
          fill="url(#mainGradient)" opacity="0.3"/>
        <rect x="${cardX + 0.5}" y="${cardY + 0.5}" width="${cardWidth - 1}" height="${cardHeight - 1}"
          rx="${CARD_RADIUS}" ry="${CARD_RADIUS}"
          fill="none" stroke="${colors.borderLight}" stroke-width="1" opacity="0.4"/>
        <text
          x="${cardX + 20}" y="${cardY + 30}"
          font-family="'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
          font-size="13" font-weight="600"
          fill="${colors.secondaryText}"
          letter-spacing="0.5">${safePlatformTitle}</text>
        <rect x="${cardX + 20}" y="${cardY + 40}" width="28" height="2"
          rx="1" fill="url(#accentGradient)" opacity="0.7"/>
        ${platform.render(cardX, cardY, cardWidth)}
      </g>
    `;
  }).join('');

  return `<g>${cards}</g>`;
}

function renderLeetCodeCard(x, y, width, data, colors) {
  const statsY = y + 85;
  const col1X = x + 20;
  const col2X = x + 20 + (width - 40) / 3;
  const col3X = x + 20 + ((width - 40) / 3) * 2;

  const solved = String(data.totalSolved ?? 0);
  const rating = String(data.contestRating ?? data.ranking ?? 'N/A');
  const safeSolved = sanitizeSvgValue(solved);
  const safeEasySolved = sanitizeSvgValue(data.easySolved ?? 0);
  const safeMediumSolved = sanitizeSvgValue(data.mediumSolved ?? 0);
  const safeHardSolved = sanitizeSvgValue(data.hardSolved ?? 0);
  const safeRating = sanitizeSvgValue(rating);

  return `
    <text x="${col1X}" y="${statsY}"
      font-family="'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
      font-size="32" font-weight="700" fill="${colors.primaryText}">${safeSolved}</text>
    <text x="${col1X}" y="${statsY + 20}"
      font-family="'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
      font-size="11" fill="${colors.mutedText}" letter-spacing="0.3">Solved</text>

    <text x="${col2X}" y="${statsY - 18}"
      font-family="'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
      font-size="11" font-weight="600" fill="#10b981">E</text>
    <text x="${col2X + 14}" y="${statsY - 18}"
      font-family="'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
      font-size="14" font-weight="700" fill="${colors.primaryText}">${safeEasySolved}</text>

    <text x="${col2X}" y="${statsY}"
      font-family="'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
      font-size="11" font-weight="600" fill="#f59e0b">M</text>
    <text x="${col2X + 14}" y="${statsY}"
      font-family="'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
      font-size="14" font-weight="700" fill="${colors.primaryText}">${safeMediumSolved}</text>

    <text x="${col2X}" y="${statsY + 18}"
      font-family="'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
      font-size="11" font-weight="600" fill="#ef4444">H</text>
    <text x="${col2X + 14}" y="${statsY + 18}"
      font-family="'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
      font-size="14" font-weight="700" fill="${colors.primaryText}">${safeHardSolved}</text>

    <text x="${col3X}" y="${statsY}"
      font-family="'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
      font-size="32" font-weight="700" fill="${colors.primaryText}">${safeRating}</text>
    <text x="${col3X}" y="${statsY + 20}"
      font-family="'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
      font-size="11" fill="${colors.mutedText}" letter-spacing="0.3">Rating</text>
  `;
}

function renderCodeforcesCard(x, y, width, data, colors) {
  const statsY = y + 85;
  const col1X = x + 20;
  const col2X = x + 20 + (width - 40) / 3;
  const col3X = x + 20 + ((width - 40) / 3) * 2;

  const rankMap = {
    'newbie': 'Newbie',
    'pupil': 'Pupil',
    'specialist': 'Specialist',
    'expert': 'Expert',
    'candidate master': 'Cand.Master',
    'master': 'Master',
    'international master': 'Int.Master',
    'grandmaster': 'GM',
    'international grandmaster': 'Int.GM',
    'legendary grandmaster': 'Leg.GM',
  };

  const rankShort = rankMap[data.rank?.toLowerCase()] ?? data.rank ?? 'unrated';
  const solved = data.problemsSolved ?? 0;
  const safeRating = sanitizeSvgValue(data.rating);
  const safeRankShort = sanitizeSvgValue(rankShort);
  const safeSolved = sanitizeSvgValue(solved);
  const safeMaxRating = sanitizeSvgValue(data.maxRating);

  return `
    <!-- Rating -->
    <text x="${col1X}" y="${statsY}"
      font-family="'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
      font-size="32" font-weight="700" fill="${colors.primaryText}">${safeRating}</text>
    <text x="${col1X}" y="${statsY + 20}"
      font-family="'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
      font-size="11" fill="${colors.mutedText}" letter-spacing="0.3">Rating</text>

    <!-- Rank + Solved -->
    <text x="${col2X+6}" y="${statsY - 18}"
      font-family="'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
      font-size="11" font-weight="600" fill="#6366f1">R</text>
    <text x="${col2X + 18}" y="${statsY - 18}"
      font-family="'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
      font-size="11" font-weight="700" fill="${colors.primaryText}">${safeRankShort}</text>

    <text x="${col2X+6}" y="${statsY + 2}"
      font-family="'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
      font-size="11" font-weight="600" fill="#10b981">S</text>
    <text x="${col2X + 18}" y="${statsY + 2}"
      font-family="'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
      font-size="11" font-weight="700" fill="${colors.primaryText}">${safeSolved}</text>

    <!-- Max Rating -->
    <text x="${col3X+6}" y="${statsY}"
      font-family="'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
      font-size="32" font-weight="700" fill="${colors.primaryText}">${safeMaxRating}</text>
    <text x="${col3X}" y="${statsY + 20}"
      font-family="'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
      font-size="11" fill="${colors.mutedText}" letter-spacing="0.3">Max Rating</text>
  `;
}

function renderCodeChefCard(x, y, width, data, colors) {
  const statsY = y + 85;
  const col1X = x + 20;
  const col2X = x + 20 + (width - 40) / 3;
  const col3X = x + 20 + ((width - 40) / 3) * 2;

  const globalRank = data.globalRank ?? 'N/A';
  const division = data.division ?? 'Div 4';
  const safeCurrentRating = sanitizeSvgValue(data.currentRating);
  const safeStars = sanitizeSvgValue(data.stars ?? '1\u2605');
  const safeDivision = sanitizeSvgValue(division);
  const safeGlobalRank = sanitizeSvgValue(globalRank);

  return `
    <!-- Current Rating -->
    <text x="${col1X}" y="${statsY}"
      font-family="'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
      font-size="32" font-weight="700" fill="${colors.primaryText}">${safeCurrentRating}</text>
    <text x="${col1X}" y="${statsY + 20}"
      font-family="'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
      font-size="11" fill="${colors.mutedText}" letter-spacing="0.3">Rating</text>

    <!-- Stars -->
    <text x="${col2X + 10}" y="${statsY - 8}"
      font-family="'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
      font-size="22" font-weight="700" fill="#f59e0b">${safeStars}</text>
    <text x="${col2X + 10}" y="${statsY + 10}"
      font-family="'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
      font-size="11" fill="${colors.mutedText}" letter-spacing="0.3">Stars</text>

    <!-- Division badge -->
    <rect x="${col2X + 6}" y="${statsY + 17}" width="44" height="16" rx="4"
      fill="#8b5cf6" opacity="0.18"/>
    <text x="${col2X + 28}" y="${statsY + 29}"
      font-family="'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
      font-size="10" font-weight="600" fill="#a78bfa" text-anchor="middle">${safeDivision}</text>

    <!-- Global Rank -->
    <text x="${col3X}" y="${statsY - 8}"
      font-family="'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
      font-size="24" font-weight="700" fill="${colors.primaryText}">${safeGlobalRank}</text>
    <text x="${col3X}" y="${statsY + 10}"
      font-family="'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
      font-size="11" fill="${colors.mutedText}" letter-spacing="0.3">Global Rank</text>
  `;
}
