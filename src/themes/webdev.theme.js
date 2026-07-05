const webdevTheme = {
  name: 'webdev',
  category: 'domain',
  colors: {
    background: '#1a1a24',
    backgroundAlt: '#111116',
    cardBackground: '#15151c',
    cardBackgroundAlt: '#1a1a24',
    border: '#2d2d3d',
    borderLight: '#44445c',
    borderGlow: '#f0db4f22',
    primaryText: '#e3e3e9',
    secondaryText: '#8ab4f8',
    mutedText: '#73738c',
    accent: '#f0db4f',
    accentSecondary: '#e34c26',
    accentTertiary: '#264de4',
    accentWarm: '#f16529',
    accentHot: '#61dbfb',
    gradientStart: '#e34c26',
    gradientMid: '#264de4',
    gradientEnd: '#f0db4f',
    success: '#4caf50',
    warning: '#ff9800',
    error: '#f44336',
    glow: '#f0db4f',
    glowSecondary: '#61dbfb',
  },
  chartColors: [
    '#f0db4f',
    '#e34c26',
    '#264de4',
    '#61dbfb',
    '#f16529',
    '#73738c',
  ],
  domainConfig: {
    watermark: `
       <g transform="translate(830, 20)" fill="none" stroke="#f0db4f" stroke-width="2" opacity="0.04" aria-hidden="true">
         <!-- Code Tag < /> -->
         <path d="M 25,25 L 10,40 L 25,55" stroke-linecap="round" stroke-linejoin="round"/>
         <path d="M 45,20 L 35,60" stroke-linecap="round"/>
         <path d="M 55,25 L 70,40 L 55,55" stroke-linecap="round" stroke-linejoin="round"/>
         <!-- Code window mockup -->
         <rect x="0" y="0" width="80" height="80" rx="6" ry="6" stroke-width="1.5" />
         <circle cx="10" cy="10" r="2" fill="#f0db4f"/>
         <circle cx="16" cy="10" r="2" fill="#f0db4f"/>
         <circle cx="22" cy="10" r="2" fill="#f0db4f"/>
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
      commits: 'DOM Builder',
      prs: 'PR Deployer',
      stars: 'JS Artisan',
      followers: 'Net Citizen',
    },
    highlightedLanguages: ['javascript', 'typescript', 'html', 'css', 'scss', 'sass', 'vue', 'svelte'],
    languagePrefix: '🌐',
    calculateInsights: (repos) => {
      const totalRepos = Array.isArray(repos) ? repos.length : 0;
      let webRepos = 0;
      let webCount = 0;
      let jsCount = 0;
      if (totalRepos > 0) {
        repos.forEach(r => {
          const lang = (r.language || '').toLowerCase();
          const name = (r.name || '').toLowerCase();
          const desc = (r.description || '').toLowerCase();
          const isWebLang = ['javascript', 'typescript', 'html', 'css', 'scss', 'vue', 'svelte'].includes(lang);
          if (isWebLang) webRepos++;
          if (name.includes('web') || desc.includes('web') || name.includes('frontend') || desc.includes('frontend') || name.includes('react') || desc.includes('react') || name.includes('vue') || desc.includes('vue') || name.includes('angular') || desc.includes('angular') || name.includes('svelte') || desc.includes('svelte') || name.includes('html') || desc.includes('html') || name.includes('npm') || desc.includes('npm')) {
            webCount++;
          }
          if (lang === 'javascript' || lang === 'typescript') {
            jsCount++;
          }
        });
      }
      if (totalRepos === 0) return null;
      const ratio = Math.round((webRepos / totalRepos) * 100);
      return {
        title: 'Web Insights',
        stats: [
          { label: 'Web Ratio', value: `${ratio}%` },
          { label: 'Web Projects', value: String(webCount) },
          { label: 'JS & TS Repos', value: String(jsCount) }
        ]
      };
    }
  }
};

export default webdevTheme;
