const hcLightTheme = {
  name: 'hc-light',
  colors: {
    // Main backgrounds — pure white
    background: '#FFFFFF',
    backgroundAlt: '#F5F5F5',
    cardBackground: '#FFFFFF',
    cardBackgroundAlt: '#F0F0F0',

    // Borders & lines — high-contrast grays
    border: '#999999',
    borderLight: '#BBBBBB',
    borderGlow: '#0055CC22',

    // Text — WCAG AAA (7:1+)
    primaryText: '#000000',
    secondaryText: '#333333',
    mutedText: '#666666',

    // Accents — strong blue
    accent: '#0055CC',
    accentSecondary: '#0044AA',
    accentTertiary: '#003388',
    accentWarm: '#BB6600',
    accentHot: '#CC0000',

    // Gradients — flat (solid accent, no gradient)
    gradientStart: '#0055CC',
    gradientMid: '#0055CC',
    gradientEnd: '#0055CC',

    // Status
    success: '#008800',
    warning: '#BB6600',
    error: '#CC0000',
    danger: '#CC0000',

    // Special — no glow effects
    glow: '#0055CC',
    glowSecondary: '#0055CC',
  },
  chartColors: [
    '#0055CC', // Deep Blue
    '#0044AA', // Navy
    '#008800', // Green
    '#BB6600', // Amber
    '#CC0000', // Red
    '#6600AA', // Purple
  ],
};

export default hcLightTheme;
