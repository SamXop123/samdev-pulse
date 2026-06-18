export function hexToRgb(hex) {
  const normalized = hex.replace('#', '');

  const bigint = parseInt(normalized, 16);

  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  };
}

function luminance(r, g, b) {
  const values = [r, g, b].map((v) => {
    v /= 255;

    return v <= 0.03928
      ? v / 12.92
      : Math.pow((v + 0.055) / 1.055, 2.4);
  });

  return (
    0.2126 * values[0] +
    0.7152 * values[1] +
    0.0722 * values[2]
  );
}

export function contrastRatio(color1, color2) {
  const c1 = hexToRgb(color1);
  const c2 = hexToRgb(color2);

  const l1 = luminance(c1.r, c1.g, c1.b);
  const l2 = luminance(c2.r, c2.g, c2.b);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
}

export function validateThemeAccessibility(theme) {
  const bg =
    theme.colors.background ||
    '#000000';

  const primary =
    theme.colors.primaryText ||
    '#ffffff';

  const secondary =
    theme.colors.secondaryText ||
    '#cccccc';

  return {
    primaryPass:
      contrastRatio(primary, bg) >= 4.5,

    secondaryPass:
      contrastRatio(secondary, bg) >= 3,

    primaryContrast:
      contrastRatio(primary, bg),

    secondaryContrast:
      contrastRatio(secondary, bg),
  };
}

export function createHybridTheme(baseTheme, overrides = {}) {
  const newTheme = {
    ...baseTheme,
    colors: { ...baseTheme.colors },
    chartColors: [...baseTheme.chartColors],
  };

  function adjustColorBrightness(hex, percent) {
    const rgb = hexToRgb(hex);
    if (!rgb) return hex;

    let { r, g, b } = rgb;
    r = Math.min(255, Math.max(0, r + (percent * 255) / 100));
    g = Math.min(255, Math.max(0, g + (percent * 255) / 100));
    b = Math.min(255, Math.max(0, b + (percent * 255) / 100));

    const toHex = (c) => Math.round(c).toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }

  // 1. Override background
  if (overrides.bg) {
    newTheme.colors.background = overrides.bg;

    const rgb = hexToRgb(overrides.bg);
    const isDark = rgb ? (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000 < 128 : true;

    const bgPercent = isDark ? 2 : -2;
    const cardPercent = isDark ? 4 : -4;
    const cardAltPercent = isDark ? 6 : -6;

    newTheme.colors.backgroundAlt = overrides.bg_alt || adjustColorBrightness(overrides.bg, bgPercent);
    newTheme.colors.cardBackground = overrides.card_bg || adjustColorBrightness(overrides.bg, cardPercent);
    newTheme.colors.cardBackgroundAlt = overrides.card_bg_alt || adjustColorBrightness(overrides.bg, cardAltPercent);
  }

  // 2. Override text
  if (overrides.text) {
    newTheme.colors.primaryText = overrides.text;

    const rgb = hexToRgb(overrides.text);
    const isDarkText = rgb ? (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000 < 128 : false;

    newTheme.colors.secondaryText = overrides.sec_text || adjustColorBrightness(overrides.text, isDarkText ? 15 : -15);
    newTheme.colors.mutedText = overrides.muted_text || adjustColorBrightness(overrides.text, isDarkText ? 30 : -30);
  }

  // 3. Override accent
  if (overrides.accent) {
    newTheme.colors.accent = overrides.accent;
    newTheme.colors.glow = overrides.accent;
    newTheme.colors.gradientStart = overrides.accent;
    newTheme.colors.gradientEnd = overrides.accent;
    newTheme.colors.glowSecondary = overrides.accent_secondary || overrides.accent;
    newTheme.colors.accentSecondary = overrides.accent_secondary || overrides.accent;

    if (overrides.gradient_start) newTheme.colors.gradientStart = overrides.gradient_start;
    if (overrides.gradient_end) newTheme.colors.gradientEnd = overrides.gradient_end;
  }

  // 4. Specific overrides
  if (overrides.border) newTheme.colors.border = overrides.border;
  if (overrides.border_light) newTheme.colors.borderLight = overrides.border_light;
  if (overrides.border_glow) newTheme.colors.borderGlow = overrides.border_glow;
  if (overrides.success) newTheme.colors.success = overrides.success;
  if (overrides.warning) newTheme.colors.warning = overrides.warning;
  if (overrides.error) newTheme.colors.error = overrides.error;

  return newTheme;
}
