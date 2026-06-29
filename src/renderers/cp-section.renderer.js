import { getTheme, LAYOUT, renderCardFrame } from './svg.renderer.js';
import { sanitizeSvgValue } from '../utils/svg-sanitizer.js';
import { CF_RANK_MAP } from '../constants.js';

// compute column X positions for N-column stat layouts (default 3 columns)
function getColumnXs(x, width, numCols = 3) {
  const step = (width - 40) / numCols;
  return Array.from({ length: numCols }, (_, i) => x + 20 + step * i);
}

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

  const totalGaps = (platforms.length - 1) * LAYOUT.cardGap;
  const cardWidth = (width - totalGaps) / platforms.length;
  const cardHeight = 140;

  const cards = platforms.map((platform, i) => {
    const cardX = x + i * (cardWidth + LAYOUT.cardGap);
    const cardY = y;
    const cardId = `cp-${platform.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${cardX}-${cardY}`;

    return `
      <g role="group" aria-labelledby="${cardId}-title">
        ${renderCardFrame({
          x: cardX, y: cardY, width: cardWidth, height: cardHeight,
          title: platform.title,
          titleId: `${cardId}-title`,
          glowOpacity: 0.04,
          gradOpacity: 0.3,
          borderOpacity: 0.4,
          titleY: 30,
          accentY: 40,
          accentOpacity: 0.7,
          titleComment: '',
          accentComment: '',
        }).join('\n        ')}
        ${platform.render(cardX, cardY, cardWidth)}
      </g>
    `;
  }).join('');

  const cpDescription = sanitizeSvgValue(
  [
    leetcode ? 'LeetCode statistics available' : '',
    codeforces ? 'Codeforces statistics available' : '',
    codechef ? 'CodeChef statistics available' : '',
  ]
    .filter(Boolean)
    .join(', ')
);

return `
<g
  role="group"
  aria-labelledby="cp-title"
>
  <title id="cp-title">Competitive Programming Statistics</title>
  <desc>${cpDescription}</desc>
  ${cards}
</g>
`;
}

function renderLeetCodeCard(x, y, width, data, colors) {
  const statsY = y + 85;
  const [col1X, col2X, col3X] = getColumnXs(x, width);

  const solved = String(data.totalSolved ?? 0);
  const hasContestRating =
  data.contestRating !== null &&
  data.contestRating !== undefined;

const statValue = String(
  hasContestRating
    ? data.contestRating
    : data.ranking ?? 'N/A'
);

const statLabel = hasContestRating ? 'Rating' : 'Rank';
  const safeSolved = sanitizeSvgValue(solved);
  const safeEasySolved = sanitizeSvgValue(data.easySolved ?? 0);
  const safeMediumSolved = sanitizeSvgValue(data.mediumSolved ?? 0);
  const safeHardSolved = sanitizeSvgValue(data.hardSolved ?? 0);
const safeStatValue = sanitizeSvgValue(statValue);
const safeStatLabel = sanitizeSvgValue(statLabel);

  const solvedValId = `val-solved-lc-${col1X}-${statsY}`;
  const solvedLblId = `lbl-solved-lc-${col1X}-${statsY}`;

  const easyValId = `val-easy-lc-${col2X}-${statsY}`;
  const easyLblId = `lbl-easy-lc-${col2X}-${statsY}`;
  const medValId = `val-med-lc-${col2X}-${statsY}`;
  const medLblId = `lbl-med-lc-${col2X}-${statsY}`;
  const hardValId = `val-hard-lc-${col2X}-${statsY}`;
  const hardLblId = `lbl-hard-lc-${col2X}-${statsY}`;

  const ratingValId = `val-rating-lc-${col3X}-${statsY}`;
  const ratingLblId = `lbl-rating-lc-${col3X}-${statsY}`;

  return `
    <g role="group" aria-labelledby="${solvedLblId} ${solvedValId}">
      <text id="${solvedValId}" x="${col1X}" y="${statsY}"
        font-family="'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        font-size="32" font-weight="700" fill="${colors.primaryText}">${safeSolved}</text>
      <text id="${solvedLblId}" x="${col1X}" y="${statsY + 20}"
        font-family="'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        font-size="11" fill="${colors.mutedText}" letter-spacing="0.3">Solved</text>
    </g>

    <g role="group" aria-label="Difficulty Breakdown">
      <g role="group" aria-labelledby="${easyLblId} ${easyValId}">
        <text id="${easyLblId}" x="${col2X}" y="${statsY - 18}"
          font-family="'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
          font-size="11" font-weight="600" fill="#10b981">E</text>
        <text id="${easyValId}" x="${col2X + 14}" y="${statsY - 18}"
          font-family="'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
          font-size="14" font-weight="700" fill="${colors.primaryText}">${safeEasySolved}</text>
      </g>

      <g role="group" aria-labelledby="${medLblId} ${medValId}">
        <text id="${medLblId}" x="${col2X}" y="${statsY}"
          font-family="'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
          font-size="11" font-weight="600" fill="#f59e0b">M</text>
        <text id="${medValId}" x="${col2X + 14}" y="${statsY}"
          font-family="'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
          font-size="14" font-weight="700" fill="${colors.primaryText}">${safeMediumSolved}</text>
      </g>

      <g role="group" aria-labelledby="${hardLblId} ${hardValId}">
        <text id="${hardLblId}" x="${col2X}" y="${statsY + 18}"
          font-family="'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
          font-size="11" font-weight="600" fill="#ef4444">H</text>
        <text id="${hardValId}" x="${col2X + 14}" y="${statsY + 18}"
          font-family="'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
          font-size="14" font-weight="700" fill="${colors.primaryText}">${safeHardSolved}</text>
      </g>
    </g>

    <g role="group" aria-labelledby="${ratingLblId} ${ratingValId}">
      <text id="${ratingValId}" x="${col3X}" y="${statsY}"
        font-family="'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        font-size="32" font-weight="700" fill="${colors.primaryText}">${safeStatValue}</text>
      <text id="${ratingLblId}" x="${col3X}" y="${statsY + 20}"
        font-family="'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        font-size="11" fill="${colors.mutedText}" letter-spacing="0.3">${safeStatLabel}</text>
    </g>
  `;
}

function renderCodeforcesCard(x, y, width, data, colors) {
  const statsY = y + 85;
  const [col1X, col2X, col3X] = getColumnXs(x, width);

  const rankShort = CF_RANK_MAP[data.rank?.toLowerCase()] ?? data.rank ?? 'unrated';
  const solved = data.problemsSolved ?? 0;
  const safeRating = sanitizeSvgValue(data.rating);
  const safeRankShort = sanitizeSvgValue(rankShort);
  const safeSolved = sanitizeSvgValue(solved);
  const safeMaxRating = sanitizeSvgValue(data.maxRating);

  const cfRatingValId = `val-rating-cf-${col1X}-${statsY}`;
  const cfRatingLblId = `lbl-rating-cf-${col1X}-${statsY}`;

  const cfRankValId = `val-rank-cf-${col2X}-${statsY}`;
  const cfRankLblId = `lbl-rank-cf-${col2X}-${statsY}`;

  const cfSolvedValId = `val-solved-cf-${col2X}-${statsY}`;
  const cfSolvedLblId = `lbl-solved-cf-${col2X}-${statsY}`;

  const cfMaxRatingValId = `val-maxrating-cf-${col3X}-${statsY}`;
  const cfMaxRatingLblId = `lbl-maxrating-cf-${col3X}-${statsY}`;

  return `
    <!-- Rating -->
    <g role="group" aria-labelledby="${cfRatingLblId} ${cfRatingValId}">
      <text id="${cfRatingValId}" x="${col1X}" y="${statsY}"
        font-family="'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        font-size="32" font-weight="700" fill="${colors.primaryText}">${safeRating}</text>
      <text id="${cfRatingLblId}" x="${col1X}" y="${statsY + 20}"
        font-family="'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        font-size="11" fill="${colors.mutedText}" letter-spacing="0.3">Rating</text>
    </g>

    <!-- Rank + Solved -->
    <g role="group" aria-label="Competitive Rank and Problems Solved">
      <g role="group" aria-labelledby="${cfRankLblId} ${cfRankValId}">
        <text id="${cfRankLblId}" x="${col2X+6}" y="${statsY - 18}"
          font-family="'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
          font-size="11" font-weight="600" fill="#6366f1">R</text>
        <text id="${cfRankValId}" x="${col2X + 18}" y="${statsY - 18}"
          font-family="'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
          font-size="11" font-weight="700" fill="${colors.primaryText}">${safeRankShort}</text>
      </g>

      <g role="group" aria-labelledby="${cfSolvedLblId} ${cfSolvedValId}">
        <text id="${cfSolvedLblId}" x="${col2X+6}" y="${statsY + 2}"
          font-family="'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
          font-size="11" font-weight="600" fill="#10b981">S</text>
        <text id="${cfSolvedValId}" x="${col2X + 18}" y="${statsY + 2}"
          font-family="'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
          font-size="11" font-weight="700" fill="${colors.primaryText}">${safeSolved}</text>
      </g>
    </g>

    <!-- Max Rating -->
    <g role="group" aria-labelledby="${cfMaxRatingLblId} ${cfMaxRatingValId}">
      <text id="${cfMaxRatingValId}" x="${col3X+6}" y="${statsY}"
        font-family="'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        font-size="32" font-weight="700" fill="${colors.primaryText}">${safeMaxRating}</text>
      <text id="${cfMaxRatingLblId}" x="${col3X}" y="${statsY + 20}"
        font-family="'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        font-size="11" fill="${colors.mutedText}" letter-spacing="0.3">Max Rating</text>
    </g>
  `;
}

function renderCodeChefCard(x, y, width, data, colors) {
  const statsY = y + 85;
  const [col1X, col2X, col3X] = getColumnXs(x, width);

  const globalRank = data.globalRank ?? 'N/A';
  const division = data.division ?? 'Div 4';
  const safeCurrentRating = sanitizeSvgValue(data.currentRating);
  const safeStars = sanitizeSvgValue(data.stars ?? '1\u2605');
  const safeDivision = sanitizeSvgValue(division);
  const safeGlobalRank = sanitizeSvgValue(globalRank);

  const ccRatingValId = `val-rating-cc-${col1X}-${statsY}`;
  const ccRatingLblId = `lbl-rating-cc-${col1X}-${statsY}`;

  const ccStarsValId = `val-stars-cc-${col2X}-${statsY}`;
  const ccStarsLblId = `lbl-stars-cc-${col2X}-${statsY}`;

  const ccGlobalRankValId = `val-rank-cc-${col3X}-${statsY}`;
  const ccGlobalRankLblId = `lbl-rank-cc-${col3X}-${statsY}`;

  return `
    <!-- Current Rating -->
    <g role="group" aria-labelledby="${ccRatingLblId} ${ccRatingValId}">
      <text id="${ccRatingValId}" x="${col1X}" y="${statsY}"
        font-family="'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        font-size="32" font-weight="700" fill="${colors.primaryText}">${safeCurrentRating}</text>
      <text id="${ccRatingLblId}" x="${col1X}" y="${statsY + 20}"
        font-family="'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        font-size="11" fill="${colors.mutedText}" letter-spacing="0.3">Rating</text>
    </g>

    <!-- Stars & Division -->
    <g role="group" aria-labelledby="${ccStarsLblId} ${ccStarsValId}" aria-label="CodeChef Star and Division Rating">
      <text id="${ccStarsValId}" x="${col2X + 10}" y="${statsY - 8}"
        font-family="'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        font-size="22" font-weight="700" fill="#f59e0b">${safeStars}</text>
      <text id="${ccStarsLblId}" x="${col2X + 10}" y="${statsY + 10}"
        font-family="'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        font-size="11" fill="${colors.mutedText}" letter-spacing="0.3">Stars</text>

      <!-- Division badge -->
      <rect x="${col2X + 6}" y="${statsY + 17}" width="44" height="16" rx="4"
        fill="#8b5cf6" opacity="0.18"/>
      <text x="${col2X + 28}" y="${statsY + 29}"
        font-family="'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        font-size="10" font-weight="600" fill="#a78bfa" text-anchor="middle">${safeDivision}</text>
    </g>

    <!-- Global Rank -->
    <g role="group" aria-labelledby="${ccGlobalRankLblId} ${ccGlobalRankValId}">
      <text id="${ccGlobalRankValId}" x="${col3X}" y="${statsY - 8}"
        font-family="'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        font-size="24" font-weight="700" fill="${colors.primaryText}">${safeGlobalRank}</text>
      <text id="${ccGlobalRankLblId}" x="${col3X}" y="${statsY + 10}"
        font-family="'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        font-size="11" fill="${colors.mutedText}" letter-spacing="0.3">Global Rank</text>
    </g>
  `;
}
