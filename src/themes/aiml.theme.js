const aimlTheme = {
  name: 'aiml',
  category: 'domain',
  colors: {
    background: '#0d0b18',
    backgroundAlt: '#06050b',
    cardBackground: '#110e1e',
    cardBackgroundAlt: '#0d0b18',
    border: '#282142',
    borderLight: '#3e3366',
    borderGlow: '#8b5cf622',
    primaryText: '#e9e3ff',
    secondaryText: '#a78bfa',
    mutedText: '#7c6da6',
    accent: '#00f5ff',
    accentSecondary: '#8b5cf6',
    accentTertiary: '#ee4c2c',
    accentWarm: '#ffcf00',
    accentHot: '#ec4899',
    gradientStart: '#8b5cf6',
    gradientMid: '#00f5ff',
    gradientEnd: '#ee4c2c',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    glow: '#8b5cf6',
    glowSecondary: '#00f5ff',
  },
  chartColors: [
    '#00f5ff',
    '#8b5cf6',
    '#ee4c2c',
    '#ec4899',
    '#ffcf00',
    '#10b981',
  ],
  domainConfig: {
    watermark: `
       <g transform="translate(830, 25)" fill="#00f5ff" stroke="#00f5ff" stroke-width="1" opacity="0.05" aria-hidden="true">
         <!-- Neural net nodes -->
         <circle cx="20" cy="20" r="3"/>
         <circle cx="20" cy="50" r="3"/>
         <circle cx="20" cy="80" r="3"/>
         <circle cx="55" cy="35" r="3"/>
         <circle cx="55" cy="65" r="3"/>
         <circle cx="90" cy="50" r="3"/>
         <!-- Connections -->
         <line x1="20" y1="20" x2="55" y2="35"/>
         <line x1="20" y1="20" x2="55" y2="65"/>
         <line x1="20" y1="50" x2="55" y2="35"/>
         <line x1="20" y1="50" x2="55" y2="65"/>
         <line x1="20" y1="80" x2="55" y2="35"/>
         <line x1="20" y1="80" x2="55" y2="65"/>
         <line x1="55" y1="35" x2="90" y2="50"/>
         <line x1="55" y1="65" x2="90" y2="50"/>
       </g>
    `,
    cardAccent: (x, y, w, h, colors) => `
      <rect x="${x}" y="${y + 20}" width="3" height="30" rx="1.5" fill="${colors.accent}" opacity="0.9"/>
    `,
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
      commits: 'Model Builder',
      prs: 'Data Wrangler',
      stars: 'Loss Optimizer',
      followers: 'Neural Wizard',
    },
    highlightedLanguages: ['python', 'r', 'julia', 'jupyter notebook'],
    languagePrefix: '🧠',
    calculateInsights: (repos) => {
      const totalRepos = Array.isArray(repos) ? repos.length : 0;
      let pythonRepos = 0;
      let aimlCount = 0;
      let modelCount = 0;
      if (totalRepos > 0) {
        repos.forEach(r => {
          const lang = (r.language || '').toLowerCase();
          const name = (r.name || '').toLowerCase();
          const desc = (r.description || '').toLowerCase();
          if (lang === 'python' || lang === 'r' || lang === 'julia') pythonRepos++;
          if (name.includes('ai') || desc.includes('ai') || name.includes('ml') || desc.includes('ml') || name.includes('tensorflow') || desc.includes('tensorflow') || name.includes('pytorch') || desc.includes('pytorch') || name.includes('keras') || desc.includes('keras') || name.includes('scikit') || desc.includes('scikit') || name.includes('neural') || desc.includes('neural') || name.includes('deep-learning') || desc.includes('deep-learning') || name.includes('dataset') || desc.includes('dataset') || name.includes('model') || desc.includes('model')) {
            aimlCount++;
          }
          if (name.includes('model') || desc.includes('model') || name.includes('pytorch') || desc.includes('pytorch') || name.includes('keras') || desc.includes('keras') || name.includes('tensorflow') || desc.includes('tensorflow')) {
            modelCount++;
          }
        });
      }
      if (totalRepos === 0) return null;
      const ratio = Math.round((pythonRepos / totalRepos) * 100);
      return {
        title: 'AI / ML Insights',
        stats: [
          { label: 'Python Ratio', value: `${ratio}%` },
          { label: 'AI & ML Repos', value: String(aimlCount) },
          { label: 'Models Trained', value: modelCount > 0 ? `${modelCount} Repos` : 'Inactive' }
        ]
      };
    }
  }
};

export default aimlTheme;
