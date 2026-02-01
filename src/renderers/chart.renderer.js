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

