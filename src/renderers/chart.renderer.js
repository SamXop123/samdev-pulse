// Chart Renderer - Reusable SVG chart components

import { getTheme } from './svg.renderer.js';

/**
 * Generate a smooth SVG path using cardinal spline interpolation
 */

function smoothPath(points) {
  if (points.length < 2) return '';

  const tension = 0.3;
  let path = `M ${points[0].x} ${points[0].y}`;

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i === 0 ? i : i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2 >= points.length ? i + 1 : i + 2];

    const cp1x = p1.x + (p2.x - p0.x) * tension;
    const cp1y = p1.y + (p2.y - p0.y) * tension;
    const cp2x = p2.x - (p3.x - p1.x) * tension;
    const cp2y = p2.y - (p3.y - p1.y) * tension;

    path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }

  return path;
}

/**
 * Scale data points to fit within chart dimensions
 */
function scaleData(data, width, height, padding) {
  const maxVal = Math.max(...data);
  const minVal = Math.min(...data);
  const range = maxVal - minVal || 1;

  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  return data.map((val, i) => ({
    x: padding + (i / (data.length - 1)) * chartWidth,
    y: padding + chartHeight - ((val - minVal) / range) * chartHeight,
  }));
}

/**
 * Render a line/area chart
 */
export function renderLineChart({ x, y, width, height, data, showArea = true, showLine = true, showDots = false }) {
  const { colors } = getTheme();
  const padding = 8;

  const points = scaleData(data, width, height, padding);
  const pathD = smoothPath(points);

  let elements = [];

  // Area fill
  if (showArea && points.length > 1) {
    const areaPath = `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;
    elements.push(
      `<path d="${areaPath}" fill="url(#areaGradient-${x}-${y})" opacity="0.3"/>`
    );
  }

  // Line stroke
  if (showLine && pathD) {
    elements.push(
      `<path d="${pathD}" fill="none" stroke="${colors.accent}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`
    );
  }

  // Dots at data points
  if (showDots) {
    points.forEach((point) => {
      elements.push(
        `<circle cx="${point.x}" cy="${point.y}" r="3" fill="${colors.accent}"/>`
      );
    });
  }

  // Gradient definition
  const gradient = `
    <defs>
      <linearGradient id="areaGradient-${x}-${y}" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="${colors.accent}" stop-opacity="0.4"/>
        <stop offset="100%" stop-color="${colors.accent}" stop-opacity="0"/>
      </linearGradient>
    </defs>`;

  return `
  <g transform="translate(${x}, ${y})">
    ${gradient}
    ${elements.join('\n    ')}
  </g>`;
}

/**
 * Render a contribution chart card
 */
export function renderContributionChart({ x, y, width, height, title, data }) {
  const { colors } = getTheme();
  const titleY = y + 24;
  const chartX = 0;
  const chartY = 36;
  const chartWidth = width - 32;
  const chartHeight = height - 52;

  return `
  <g>
    <rect x="${x}" y="${y}" width="${width}" height="${height}" rx="12" ry="12" fill="${colors.cardBackground}" stroke="${colors.border}" stroke-width="1"/>
    <text x="${x + 16}" y="${titleY}" font-family="Segoe UI, Ubuntu, sans-serif" font-size="14" font-weight="600" fill="${colors.secondaryText}">${title}</text>
    <g transform="translate(${x + 16}, ${y})">
      ${renderLineChart({ x: chartX, y: chartY, width: chartWidth, height: chartHeight, data, showArea: true, showLine: true, showDots: false })}
    </g>
  </g>`;
}

/**
 * Generate fake contribution data
 */
export function generateFakeContributionData(days = 30) {
  const data = [];
  let base = 5;

  for (let i = 0; i < days; i++) {
    base += Math.floor(Math.random() * 7) - 3;
    base = Math.max(0, Math.min(20, base));
    data.push(base);
  }

  return data;
}

/**
 * Create an SVG arc path for a donut slice
 */
function describeArc(cx, cy, outerR, innerR, startAngle, endAngle) {
  const gap = 0.02; // Small gap between slices in radians
  const adjustedStart = startAngle + gap;
  const adjustedEnd = endAngle - gap;

  if (adjustedEnd <= adjustedStart) {
    return '';
  }

  const startOuter = {
    x: cx + outerR * Math.cos(adjustedStart),
    y: cy + outerR * Math.sin(adjustedStart),
  };
  const endOuter = {
    x: cx + outerR * Math.cos(adjustedEnd),
    y: cy + outerR * Math.sin(adjustedEnd),
  };
  const startInner = {
    x: cx + innerR * Math.cos(adjustedEnd),
    y: cy + innerR * Math.sin(adjustedEnd),
  };
  const endInner = {
    x: cx + innerR * Math.cos(adjustedStart),
    y: cy + innerR * Math.sin(adjustedStart),
  };

  const largeArc = adjustedEnd - adjustedStart > Math.PI ? 1 : 0;

  return [
    `M ${startOuter.x} ${startOuter.y}`,
    `A ${outerR} ${outerR} 0 ${largeArc} 1 ${endOuter.x} ${endOuter.y}`,
    `L ${startInner.x} ${startInner.y}`,
    `A ${innerR} ${innerR} 0 ${largeArc} 0 ${endInner.x} ${endInner.y}`,
    `Z`,
  ].join(' ');
}

/**
 * Render a donut chart with legend
 * @param {Object} options
 * @param {number} options.x - X position
 * @param {number} options.y - Y position
 * @param {number} options.width - Width of the card
 * @param {number} options.height - Height of the card
 * @param {string} options.title - Card title
 * @param {Array} options.data - Array of { label, value, percentage }
 */
export function renderDonutChart({ x, y, width, height, title, data }) {
  const { colors, chartColors } = getTheme();
  const titleY = y + 24;

  // Donut dimensions
  const chartAreaWidth = width * 0.45;
  const centerX = x + chartAreaWidth / 2 + 16;
  const centerY = y + height / 2 + 10;
  const outerRadius = Math.min(chartAreaWidth, height - 60) / 2 - 8;
  const innerRadius = outerRadius * 0.55;

  // Calculate total for percentages
  const total = data.reduce((sum, item) => sum + item.value, 0);

  // Build pie slices
  let currentAngle = -Math.PI / 2; // Start from top
  const slices = [];

  data.forEach((item, i) => {
    const sliceAngle = (item.value / total) * Math.PI * 2;
    const path = describeArc(centerX, centerY, outerRadius, innerRadius, currentAngle, currentAngle + sliceAngle);

    if (path) {
      slices.push(`<path d="${path}" fill="${chartColors[i % chartColors.length]}" />`);
    }

    currentAngle += sliceAngle;
  });

  // Build legend
  const legendX = x + chartAreaWidth + 24;
  const legendStartY = y + 50;
  const legendItemHeight = 24;

  const legendItems = data.map((item, i) => {
    const itemY = legendStartY + i * legendItemHeight;
    const percentage = ((item.value / total) * 100).toFixed(1);

    return `
      <circle cx="${legendX}" cy="${itemY}" r="5" fill="${chartColors[i % chartColors.length]}"/>
      <text x="${legendX + 14}" y="${itemY + 4}" font-family="Segoe UI, Ubuntu, sans-serif" font-size="12" fill="${colors.primaryText}">${item.label}</text>
      <text x="${legendX + 14}" y="${itemY + 16}" font-family="Segoe UI, Ubuntu, sans-serif" font-size="10" fill="${colors.secondaryText}">${percentage}%</text>
    `;
  }).join('');

  return `
  <g>
    <rect x="${x}" y="${y}" width="${width}" height="${height}" rx="12" ry="12" fill="${colors.cardBackground}" stroke="${colors.border}" stroke-width="1"/>
    <text x="${x + 16}" y="${titleY}" font-family="Segoe UI, Ubuntu, sans-serif" font-size="14" font-weight="600" fill="${colors.secondaryText}">${title}</text>
    ${slices.join('\n    ')}
    ${legendItems}
  </g>`;
}

