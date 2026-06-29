const gamedevTheme = {
  name: 'gamedev',
  category: 'domain',
  colors: {
    background: '#1c1c1e',
    backgroundAlt: '#121212',
    cardBackground: '#161618',
    cardBackgroundAlt: '#1c1c1e',
    border: '#2d2d30',
    borderLight: '#434347',
    borderGlow: '#ff9c0022',
    primaryText: '#e1e1e3',
    secondaryText: '#909094',
    mutedText: '#6a6a6e',
    accent: '#ff9c00',
    accentSecondary: '#82ff00',
    accentTertiary: '#00d4ff',
    accentWarm: '#ffcf00',
    accentHot: '#ff3e3e',
    gradientStart: '#ff9c00',
    gradientMid: '#82ff00',
    gradientEnd: '#00d4ff',
    success: '#82ff00',
    warning: '#ffcf00',
    error: '#ff3e3e',
    glow: '#ff9c00',
    glowSecondary: '#00d4ff',
  },
  chartColors: [
    '#ff9c00',
    '#82ff00',
    '#00d4ff',
    '#ff3e3e',
    '#ffcf00',
    '#6a6a6e',
  ],
  domainConfig: {
    watermark: `
       <g transform="translate(840, 25)" fill="none" stroke="#ff9c00" stroke-width="1.5" opacity="0.04" aria-hidden="true">
         <!-- Retro crosshair -->
         <circle cx="45" cy="45" r="25" />
         <circle cx="45" cy="45" r="8" />
         <line x1="45" y1="10" x2="45" y2="30" />
         <line x1="45" y1="60" x2="45" y2="80" />
         <line x1="10" y1="45" x2="30" y2="45" />
         <line x1="60" y1="45" x2="80" y2="45" />
         <circle cx="45" cy="45" r="1.5" fill="#ff9c00" />
       </g>
    `,
    cardAccent: (x, y, w, h, colors) => {
      const offset = 8;
      const len = 10;
      return `
        <!-- Gaming HUD corner brackets -->
        <path d="M ${x + offset} ${y + offset + len} L ${x + offset} ${y + offset} L ${x + offset + len} ${y + offset}" fill="none" stroke="${colors.accent}" stroke-width="1.5" opacity="0.8"/>
        <path d="M ${x + w - offset - len} ${y + offset} L ${x + w - offset} ${y + offset} L ${x + w - offset} ${y + offset + len}" fill="none" stroke="${colors.accent}" stroke-width="1.5" opacity="0.8"/>
        <path d="M ${x + offset} ${y + h - offset - len} L ${x + offset} ${y + h - offset} L ${x + offset + len} ${y + h - offset}" fill="none" stroke="${colors.accent}" stroke-width="1.5" opacity="0.8"/>
        <path d="M ${x + w - offset - len} ${y + h - offset} L ${x + w - offset} ${y + h - offset} L ${x + w - offset} ${y + h - offset - len}" fill="none" stroke="${colors.accent}" stroke-width="1.5" opacity="0.8"/>
      `;
    },
    headerAccent: (x, y, w, align, colors, hasSubtitle) => {
      const decY = hasSubtitle ? y + 36 : y + 12;
      const decWidth = 60;
      const decX = align === 'center' ? x - decWidth / 2 : (align === 'right' ? x - decWidth : x);
      return `
        <rect x="${decX}" y="${decY}" width="${decWidth}" height="2.5" rx="1.25" fill="${colors.accent}" opacity="0.85"/>
        <circle cx="${align === 'center' ? x + decWidth / 2 + 8 : (align === 'right' ? x - decWidth - 8 : x + decWidth + 8)}" cy="${decY + 1.25}" r="2" fill="${colors.accentSecondary || colors.accent}" opacity="0.85"/>
      `;
    },
    trophyLabels: {
      commits: 'Game Director',
      prs: 'Engine Optimizer',
      stars: 'Shader Artist',
      followers: 'Level Designer',
    },
    highlightedLanguages: ['c#', 'c++', 'gdscript', 'shaderlab'],
    languagePrefix: '🎮',
    calculateInsights: (repos) => {
      const totalRepos = Array.isArray(repos) ? repos.length : 0;
      let gdRepos = 0;
      let gameCount = 0;
      let engineCount = 0;
      if (totalRepos > 0) {
        repos.forEach(r => {
          const lang = (r.language || '').toLowerCase();
          const name = (r.name || '').toLowerCase();
          const desc = (r.description || '').toLowerCase();
          if (lang === 'c#' || lang === 'c++' || lang === 'gdscript') gdRepos++;
          if (name.includes('game') || desc.includes('game') || name.includes('unity') || desc.includes('unity') || name.includes('unreal') || desc.includes('unreal') || name.includes('godot') || desc.includes('godot') || name.includes('directx') || desc.includes('directx') || name.includes('opengl') || desc.includes('opengl') || name.includes('vulkan') || desc.includes('vulkan') || name.includes('sdl') || desc.includes('sdl')) {
            gameCount++;
          }
          if (name.includes('unity') || desc.includes('unity') || name.includes('unreal') || desc.includes('unreal') || name.includes('godot') || desc.includes('godot')) {
            engineCount++;
          }
        });
      }
      if (totalRepos === 0) return null;
      const ratio = Math.round((gdRepos / totalRepos) * 100);
      return {
        title: 'Game Dev Insights',
        stats: [
          { label: 'C# & C++ Ratio', value: `${ratio}%` },
          { label: 'Game Repos', value: String(gameCount) },
          { label: 'Engine Projects', value: engineCount > 0 ? `${engineCount} Repos` : 'Inactive' }
        ]
      };
    }
  }
};

export default gamedevTheme;
