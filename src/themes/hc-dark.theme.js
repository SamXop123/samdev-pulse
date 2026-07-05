const hcDarkTheme = {
  name: 'hc-dark',
  colors: {
    // Main backgrounds — pure black
    background: '#000000',
    backgroundAlt: '#0A0A0A',
    cardBackground: '#111111',
    cardBackgroundAlt: '#1A1A1A',

    // Borders & lines — high-contrast grays
    border: '#555555',
    borderLight: '#444444',
    borderGlow: '#66B3FF33',

    // Text — WCAG AAA (7:1+)
    primaryText: '#FFFFFF',
    secondaryText: '#CCCCCC',
    mutedText: '#999999',

    // Accents — light blue
    accent: '#66B3FF',
    accentSecondary: '#88CCFF',
    accentTertiary: '#AADDFF',
    accentWarm: '#FFCC66',
    accentHot: '#FF6666',

    // Gradients — flat (solid accent, no gradient)
    gradientStart: '#66B3FF',
    gradientMid: '#66B3FF',
    gradientEnd: '#66B3FF',

    // Status
    success: '#66FF66',
    warning: '#FFCC66',
    error: '#FF6666',
    danger: '#FF6666',

    // Special — no glow effects
    glow: '#66B3FF',
    glowSecondary: '#66B3FF',
  },
  chartColors: [
    '#66B3FF', // Light Blue
    '#88CCFF', // Sky
    '#66FF66', // Green
    '#FFCC66', // Amber
    '#FF6666', // Red
    '#CC88FF', // Purple
  ],
};

export default hcDarkTheme;
