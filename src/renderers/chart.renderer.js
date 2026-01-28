// Chart Renderer - Reusable SVG chart components

import darkTheme from '../themes/dark.theme.js';

let currentTheme = darkTheme;

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

