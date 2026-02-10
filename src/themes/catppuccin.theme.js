const catppuccinTheme = {
  name: 'catppuccin',
  colors: {
    // Main backgrounds
    background: '#1e1e2e',
    backgroundAlt: '#181825',
    cardBackground: '#11111b',
    cardBackgroundAlt: '#1e1e2e',

    // Borders & lines
    border: '#313244',
    borderLight: '#45475a',
    borderGlow: '#f38ba833',

    // Text
    primaryText: '#cdd6f4',
    secondaryText: '#bac2de',
    mutedText: '#a6adc8',

    // Accents - Catppuccin Mocha colors
    accent: '#f38ba8',
    accentSecondary: '#89b4fa',
    accentTertiary: '#a6e3a1',
    accentWarm: '#f9e2af',
    accentHot: '#eba0ac',

    // Gradients
    gradientStart: '#f38ba8',
    gradientMid: '#89b4fa',
    gradientEnd: '#a6e3a1',

    // Status colors
    success: '#a6e3a1',
    warning: '#f9e2af',
    error: '#eba0ac',

    // Special
    glow: '#f38ba8',
    glowSecondary: '#89b4fa',
  },
  chartColors: [
    '#f38ba8', // Maroon
    '#89b4fa', // Blue
    '#a6e3a1', // Green
    '#f9e2af', // Yellow
    '#eba0ac', // Red
    '#94e2d5', // Teal
  ],
  // Icon paths for stats
  icons: {
    followers: 'M16 8a6 6 0 1 0-12 0 6 6 0 0 0 12 0zm-1.5 0a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0zM18 19a3 3 0 0 0-3-3H9a3 3 0 0 0-3 3v1h12v-1z',
    repos: 'M3 2.75A2.75 2.75 0 0 1 5.75 0h14.5a.75.75 0 0 1 .75.75v20.5a.75.75 0 0 1-.75.75h-6a.75.75 0 0 1 0-1.5h5.25v-4H6A1.5 1.5 0 0 0 4.5 18v.75c0 .716.43 1.334 1.05 1.605a.75.75 0 0 1-.6 1.374A3.251 3.251 0 0 1 3 18.75v-16zM19 15V1.5H5.75c-.69 0-1.25.56-1.25 1.25v12.651A2.989 2.989 0 0 1 6 15h13z',
    stars: 'M12 .587l3.668 7.431 8.2 1.193-5.934 5.786 1.4 8.173L12 19.256l-7.334 3.914 1.4-8.173L.132 9.211l8.2-1.193z',
    streak: 'M11.3 1.046A1 1 0 0 1 12 2v5h4a1 1 0 0 1 .82 1.573l-7 10A1 1 0 0 1 8 18v-5H4a1 1 0 0 1-.82-1.573l7-10a1 1 0 0 1 1.12-.38z',
    code: 'M14.447 3.027a.75.75 0 0 1 .527.92l-4.5 16.5a.75.75 0 0 1-1.448-.394l4.5-16.5a.75.75 0 0 1 .921-.526zM16.72 6.22a.75.75 0 0 1 1.06 0l5.5 5.5a.75.75 0 0 1 0 1.06l-5.5 5.5a.75.75 0 1 1-1.06-1.06l4.97-4.97-4.97-4.97a.75.75 0 0 1 0-1.06zM7.28 6.22a.75.75 0 0 1 0 1.06L2.31 12.25l4.97 4.97a.75.75 0 0 1-1.06 1.06l-5.5-5.5a.75.75 0 0 1 0-1.06l5.5-5.5a.75.75 0 0 1 1.06 0z',
    trophy: 'M5 2h14l-2.5 9h-9L5 2zm0 0L3 6m14-4l2 4M7.5 11L6 16h12l-1.5-5M12 16v5m-4 0h8',
  },
};

export default catppuccinTheme;
