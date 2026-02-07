// Chart Renderer

import { getTheme, LAYOUT } from './svg.renderer.js';

// generate a smooth SVG path using cardinal spline interpolation
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

// scale data points to fit within chart dimensions
function scaleData(data, width, height, padding) {
  const maxVal = Math.max(...data);
  const minVal = Math.min(...data);
  const range = maxVal - minVal || 1;

  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  return data.map((val, i) => ({
    x: padding + (i / (data.length - 1)) * chartWidth,
    y: padding + chartHeight - ((val - minVal) / range) * chartHeight,
    value: val,
  }));
}

// render a modern line/area chart with glow effects
export function renderLineChart({ x, y, width, height, data, showArea = true, showLine = true, showDots = false, uniqueId }) {
  const { colors } = getTheme();
  const padding = 12;
  const id = uniqueId || `chart-${x}-${y}`;

  const points = scaleData(data, width, height, padding);
  const pathD = smoothPath(points);

  let elements = [];

  // gradient definitions for this chart
  elements.push(`
    <defs>
      <linearGradient id="lineGradient-${id}" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="${colors.gradientStart}"/>
        <stop offset="50%" stop-color="${colors.gradientMid}"/>
        <stop offset="100%" stop-color="${colors.gradientEnd}"/>
      </linearGradient>
      <linearGradient id="areaGradient-${id}" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="${colors.accent}" stop-opacity="0.4"/>
        <stop offset="50%" stop-color="${colors.accentSecondary}" stop-opacity="0.2"/>
        <stop offset="100%" stop-color="${colors.accent}" stop-opacity="0"/>
      </linearGradient>
      <filter id="lineGlow-${id}" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="3" result="blur"/>
        <feMerge>
          <feMergeNode in="blur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
  `);

  // subtle grid lines
  const gridLines = [];
  for (let i = 0; i <= 4; i++) {
    const lineY = padding + (i / 4) * (height - padding * 2);
    gridLines.push(`<line x1="${padding}" y1="${lineY}" x2="${width - padding}" y2="${lineY}" stroke="${colors.border}" stroke-width="1" opacity="0.3" stroke-dasharray="4 4"/>`);
  }
  elements.push(gridLines.join('\n'));

  // area fill with gradient
  if (showArea && points.length > 1) {
    const areaPath = `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;
    elements.push(`<path d="${areaPath}" fill="url(#areaGradient-${id})"/>`);
  }

  // line stroke with glow
  if (showLine && pathD) {
    // glow layer
    elements.push(`<path d="${pathD}" fill="none" stroke="url(#lineGradient-${id})" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" opacity="0.4" filter="url(#lineGlow-${id})"/>`);
    // main line
    elements.push(`<path d="${pathD}" fill="none" stroke="url(#lineGradient-${id})" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>`);
  }

  // dots at data points with glow
  if (showDots && points.length <= 15) {
    points.forEach((point, i) => {
      const dotColor = i === points.length - 1 ? colors.gradientEnd : colors.gradientStart;
      elements.push(`
        <circle cx="${point.x}" cy="${point.y}" r="5" fill="${dotColor}" opacity="0.3" filter="url(#lineGlow-${id})"/>
        <circle cx="${point.x}" cy="${point.y}" r="3" fill="${dotColor}"/>
        <circle cx="${point.x}" cy="${point.y}" r="1.5" fill="#fff" opacity="0.8"/>
      `);
    });
  }

  // end point highlight
  if (points.length > 0) {
    const lastPoint = points[points.length - 1];
    elements.push(`
      <circle cx="${lastPoint.x}" cy="${lastPoint.y}" r="6" fill="${colors.gradientEnd}" opacity="0.3"/>
      <circle cx="${lastPoint.x}" cy="${lastPoint.y}" r="4" fill="${colors.gradientEnd}"/>
      <circle cx="${lastPoint.x}" cy="${lastPoint.y}" r="2" fill="#fff" opacity="0.9"/>
    `);
  }

  return `
  <g transform="translate(${x}, ${y})">
    ${elements.join('\n    ')}
  </g>`;
}

// render a modern contribution chart card
export function renderContributionChart({ x, y, width, height, title, data }) {
  const { colors } = getTheme();
  const chartX = 0;
  const chartY = 44;
  const chartWidth = width - 40;
  const chartHeight = height - 64;

  return `
  <g>
    <!-- card glow -->
    <rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${LAYOUT.cardRadius}" ry="${LAYOUT.cardRadius}" fill="${colors.glow}" opacity="0.03" filter="url(#cardGlow)"/>
    
    <!-- card background -->
    <rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${LAYOUT.cardRadius}" ry="${LAYOUT.cardRadius}" fill="${colors.cardBackground}"/>
    
    <!-- inner gradient -->
    <rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${LAYOUT.cardRadius}" ry="${LAYOUT.cardRadius}" fill="url(#mainGradient)" opacity="0.3"/>
    
    <!-- border -->
    <rect x="${x + 0.5}" y="${y + 0.5}" width="${width - 1}" height="${height - 1}" rx="${LAYOUT.cardRadius}" ry="${LAYOUT.cardRadius}" fill="none" stroke="${colors.borderLight}" stroke-width="1" opacity="0.4"/>
    
    <!-- title -->
    <text x="${x + 20}" y="${y + 28}" font-family="'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="13" font-weight="600" fill="${colors.secondaryText}" letter-spacing="0.5">${title.toUpperCase()}</text>
    
    <!-- title accent -->
    <rect x="${x + 20}" y="${y + 36}" width="28" height="2" rx="1" fill="url(#accentGradient)" opacity="0.7"/>
    
    <!-- chart -->
    <g transform="translate(${x + 20}, ${y})">
      ${renderLineChart({ x: chartX, y: chartY, width: chartWidth, height: chartHeight, data, showArea: true, showLine: true, showDots: false, uniqueId: 'contrib' })}
    </g>
  </g>`;
}

// generate fake contribution data with realistic pattern
export function generateFakeContributionData(days = 30) {
  const data = [];
  let base = 8;
  const weekPattern = [0.3, 0.7, 1.0, 1.2, 1.0, 0.5, 0.2];

  for (let i = 0; i < days; i++) {
    const dayOfWeek = i % 7;
    const weekMultiplier = weekPattern[dayOfWeek];
    const randomVariation = Math.floor(Math.random() * 8) - 3;
    const trend = Math.sin(i / 5) * 3;

    base = Math.max(1, Math.min(20, base + randomVariation * 0.3));
    const value = Math.max(0, Math.floor(base * weekMultiplier + trend));
    data.push(value);
  }

  return data;
}

// create an SVG arc path for a donut slice
function describeArc(cx, cy, outerR, innerR, startAngle, endAngle) {
  const gap = 0.03;
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

// render a modern donut chart with legend
export function renderDonutChart({ x, y, width, height, title, data }) {
  const { colors, chartColors } = getTheme();

  // donut dimensions
  const chartAreaWidth = width * 0.42;
  const centerX = x + chartAreaWidth / 2 + 20;
  const centerY = y + height / 2 + 12;
  const outerRadius = Math.min(chartAreaWidth, height - 70) / 2 - 4;
  const innerRadius = outerRadius * 0.62;

  // calculate total for percentages
  const total = data.reduce((sum, item) => sum + item.value, 0);

  // build pie slices with shadows
  let currentAngle = -Math.PI / 2;
  const slices = [];

  data.forEach((item, i) => {
    const sliceAngle = (item.value / total) * Math.PI * 2;
    const path = describeArc(centerX, centerY, outerRadius, innerRadius, currentAngle, currentAngle + sliceAngle);
    const color = chartColors[i % chartColors.length];

    if (path) {
      slices.push(`<path d="${path}" fill="${color}" opacity="0.2" filter="url(#softGlow)"/>`);
      slices.push(`<path d="${path}" fill="${color}" />`);
    }

    currentAngle += sliceAngle;
  });

  // center decoration
  const centerDeco = `
    <circle cx="${centerX}" cy="${centerY}" r="${innerRadius - 4}" fill="${colors.cardBackground}" opacity="0.9"/>
    <circle cx="${centerX}" cy="${centerY}" r="${innerRadius - 8}" fill="url(#mainGradient)" opacity="0.5"/>
    <text x="${centerX}" y="${centerY + 4}" font-family="'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="16" font-weight="700" fill="${colors.primaryText}" text-anchor="middle">${total}</text>
    <text x="${centerX}" y="${centerY + 18}" font-family="'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="9" fill="${colors.mutedText}" text-anchor="middle">REPOS</text>
  `;

  // build legend with modern styling
  const legendX = x + chartAreaWidth + 32;
  const legendStartY = y + 56;
  const legendItemHeight = 28;

  const legendItems = data.map((item, i) => {
    const itemY = legendStartY + i * legendItemHeight;
    const percentage = ((item.value / total) * 100).toFixed(0);
    const color = chartColors[i % chartColors.length];

    return `
      <g>
        <rect x="${legendX - 2}" y="${itemY - 8}" width="${width - chartAreaWidth - 50}" height="24" rx="6" fill="${color}" opacity="0.08"/>
        <circle cx="${legendX + 6}" cy="${itemY + 4}" r="4" fill="${color}"/>
        <text x="${legendX + 18}" y="${itemY + 8}" font-family="'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="12" font-weight="500" fill="${colors.primaryText}">${item.label}</text>
        <text x="${x + width - 24}" y="${itemY + 8}" font-family="'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="11" font-weight="600" fill="${color}" text-anchor="end">${percentage}%</text>
      </g>
    `;
  }).join('');

  return `
  <g>
    <!-- card glow -->
    <rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${LAYOUT.cardRadius}" ry="${LAYOUT.cardRadius}" fill="${colors.glowSecondary}" opacity="0.03" filter="url(#cardGlow)"/>
    
    <!-- card background -->
    <rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${LAYOUT.cardRadius}" ry="${LAYOUT.cardRadius}" fill="${colors.cardBackground}"/>
    
    <!-- inner gradient -->
    <rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${LAYOUT.cardRadius}" ry="${LAYOUT.cardRadius}" fill="url(#mainGradient)" opacity="0.3"/>
    
    <!-- border -->
    <rect x="${x + 0.5}" y="${y + 0.5}" width="${width - 1}" height="${height - 1}" rx="${LAYOUT.cardRadius}" ry="${LAYOUT.cardRadius}" fill="none" stroke="${colors.borderLight}" stroke-width="1" opacity="0.4"/>
    
    <!-- title -->
    <text x="${x + 20}" y="${y + 28}" font-family="'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="13" font-weight="600" fill="${colors.secondaryText}" letter-spacing="0.5">${title.toUpperCase()}</text>
    
    <!-- title accent -->
    <rect x="${x + 20}" y="${y + 36}" width="28" height="2" rx="1" fill="url(#accentGradient)" opacity="0.7"/>
    
    <!-- donut chart -->
    ${slices.join('\n    ')}
    ${centerDeco}
    
    <!-- legend -->
    ${legendItems}
  </g>`;
}
