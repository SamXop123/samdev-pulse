const xcodeTheme = {
  name: 'xcode',
  category: 'domain',
  colors: {
    background: '#292a30',
    backgroundAlt: '#202124',
    cardBackground: '#1f2124',
    cardBackgroundAlt: '#292a30',
    border: '#3d3f4a',
    borderLight: '#5a5e72',
    borderGlow: '#2f6ed322',
    primaryText: '#dfdfe0',
    secondaryText: '#a0a1a5',
    mutedText: '#7f8085',
    accent: '#2f6ed3',
    accentSecondary: '#fc5fa3',
    accentTertiary: '#41e0fd',
    accentWarm: '#fd8f3e',
    accentHot: '#fc6a5d',
    gradientStart: '#2f6ed3',
    gradientMid: '#64b5f6',
    gradientEnd: '#fc5fa3',
    success: '#2ecc71',
    warning: '#f1c40f',
    error: '#fc6a5d',
    glow: '#2f6ed3',
    glowSecondary: '#fc5fa3',
  },
  chartColors: [
    '#2f6ed3',
    '#fc5fa3',
    '#41e0fd',
    '#fd8f3e',
    '#fc6a5d',
    '#8a8a8a',
  ],
  domainConfig: {
    watermark: `
       <g transform="translate(850, 20)" fill="none" stroke="#2f6ed3" stroke-width="1.5" opacity="0.04" aria-hidden="true">
         <!-- Compass Outer Circle -->
         <circle cx="50" cy="50" r="30" />
         <circle cx="50" cy="50" r="2" fill="#2f6ed3" />
         <!-- Compass Needles -->
         <path d="M 50,20 L 55,45 L 50,50 Z" fill="#2f6ed3" />
         <path d="M 50,80 L 45,55 L 50,50 Z" fill="#2f6ed3" />
         <path d="M 20,50 L 45,45 L 50,50 Z" />
         <path d="M 80,50 L 55,55 L 50,50 Z" />
       </g>
       <!-- Speed curves -->
       <path d="M -150 180 C -50 120, 50 190, 150 110" fill="none" stroke="#2f6ed3" stroke-width="2" opacity="0.03" aria-hidden="true"/>
    `,
    cardAccent: (x, y, w, h, colors) => `
      <rect x="${x + 20}" y="${y}" width="40" height="3" rx="1.5" fill="${colors.accent}" opacity="0.9"/>
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
      commits: 'iOS Builder',
      prs: 'Swift Guru',
      stars: 'Cocoa Master',
      followers: 'Apple Dev',
    },
    highlightedLanguages: ['swift', 'objective-c'],
    languagePrefix: '🍎',
    calculateInsights: (repos) => {
      const totalRepos = Array.isArray(repos) ? repos.length : 0;
      let swiftRepos = 0;
      let appleCount = 0;
      let swiftuiCount = 0;
      if (totalRepos > 0) {
        repos.forEach(r => {
          const lang = (r.language || '').toLowerCase();
          const name = (r.name || '').toLowerCase();
          const desc = (r.description || '').toLowerCase();
          if (lang === 'swift' || lang === 'objective-c') swiftRepos++;
          if (name.includes('ios') || desc.includes('ios') || name.includes('swift') || desc.includes('swift') || name.includes('xcode') || desc.includes('xcode') || name.includes('macos') || desc.includes('macos')) {
            appleCount++;
          }
          if (name.includes('swiftui') || desc.includes('swiftui')) {
            swiftuiCount++;
          }
        });
      }
      if (totalRepos === 0) return null;
      const ratio = Math.round((swiftRepos / totalRepos) * 100);
      return {
        title: 'Apple Insights',
        stats: [
          { label: 'Swift Ratio', value: `${ratio}%` },
          { label: 'Apple Repos', value: String(appleCount) },
          { label: 'SwiftUI', value: swiftuiCount > 0 ? `${swiftuiCount} Repos` : 'Inactive' }
        ]
      };
    }
  }
};

export default xcodeTheme;
