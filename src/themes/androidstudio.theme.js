const androidstudioTheme = {
  name: 'androidstudio',
  category: 'domain',
  colors: {
    background: '#1e1e24',
    backgroundAlt: '#1a1a1f',
    cardBackground: '#131317',
    cardBackgroundAlt: '#1e1e24',
    border: '#2d2d38',
    borderLight: '#3d3d4c',
    borderGlow: '#3ddc8422',
    primaryText: '#e3e3e6',
    secondaryText: '#a9b7c6',
    mutedText: '#7f8a96',
    accent: '#3ddc84',
    accentSecondary: '#6897bb',
    accentTertiary: '#ffc66d',
    accentWarm: '#bbb529',
    accentHot: '#ff5353',
    gradientStart: '#3ddc84',
    gradientMid: '#22a061',
    gradientEnd: '#4285f4',
    success: '#3ddc84',
    warning: '#bbb529',
    error: '#ff5353',
    glow: '#3ddc84',
    glowSecondary: '#4285f4',
  },
  chartColors: [
    '#3ddc84',
    '#6897bb',
    '#ffc66d',
    '#9876aa',
    '#cc7832',
    '#4285f4',
  ],
  domainConfig: {
    watermark: `
       <g transform="translate(840, 20)" fill="#3ddc84" opacity="0.04" aria-hidden="true">
         <!-- Android head -->
         <path d="M 30,35 A 20,20 0 0,1 70,35 Z" />
         <!-- Antennae -->
         <line x1="40" y1="20" x2="45" y2="28" stroke="#3ddc84" stroke-width="2.5" stroke-linecap="round"/>
         <line x1="60" y1="20" x2="55" y2="28" stroke="#3ddc84" stroke-width="2.5" stroke-linecap="round"/>
         <!-- Eyes -->
         <circle cx="42" cy="28" r="2" fill="#1e1e24"/>
         <circle cx="58" cy="28" r="2" fill="#1e1e24"/>
         <!-- Body -->
         <rect x="30" y="38" width="40" height="35" rx="4" ry="4" />
         <!-- Arms -->
         <rect x="23" y="38" width="5" height="25" rx="2.5" ry="2.5" />
         <rect x="72" y="38" width="5" height="25" rx="2.5" ry="2.5" />
         <!-- Legs -->
         <rect x="38" y="73" width="6" height="12" rx="3" ry="3" />
         <rect x="56" y="73" width="6" height="12" rx="3" ry="3" />
       </g>
       <!-- Material Design curves / shapes -->
       <path d="M 0 120 C 150 140, 250 80, 400 130 C 550 180, 650 120, 800 160" fill="none" stroke="#3ddc84" stroke-width="1.5" opacity="0.03" aria-hidden="true"/>
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
      commits: 'Android Builder',
      prs: 'Compose Wizard',
      stars: 'Material Designer',
      followers: 'Kotlin Expert',
    },
    highlightedLanguages: ['kotlin', 'java', 'xml', 'gradle kotlin dsl', 'gradle'],
    languagePrefix: '🤖',
    calculateInsights: (repos) => {
      const totalRepos = Array.isArray(repos) ? repos.length : 0;
      let kotlinRepos = 0;
      let androidCount = 0;
      let composeCount = 0;
      if (totalRepos > 0) {
        repos.forEach(r => {
          const lang = (r.language || '').toLowerCase();
          const name = (r.name || '').toLowerCase();
          const desc = (r.description || '').toLowerCase();
          if (lang === 'kotlin' || lang === 'java') kotlinRepos++;
          if (name.includes('android') || desc.includes('android') || name.includes('kotlin') || desc.includes('kotlin') || name.includes('gradle') || desc.includes('gradle')) {
            androidCount++;
          }
          if (name.includes('compose') || desc.includes('compose') || name.includes('jetpack') || desc.includes('jetpack')) {
            composeCount++;
          }
        });
      }
      if (totalRepos === 0) return null;
      const ratio = Math.round((kotlinRepos / totalRepos) * 100);
      return {
        title: 'Android Insights',
        stats: [
          { label: 'Kotlin Ratio', value: `${ratio}%` },
          { label: 'Android Repos', value: String(androidCount) },
          { label: 'Jetpack Compose', value: composeCount > 0 ? `${composeCount} Repos` : 'Inactive' }
        ]
      };
    }
  }
};

export default androidstudioTheme;
