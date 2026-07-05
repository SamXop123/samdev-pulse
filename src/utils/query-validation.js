import { SUPPORTED_THEME_NAMES } from '../renderers/svg.renderer.js';
import config from '../config/index.js';

const DEFAULT_THEME = 'dark';
const DEFAULT_ALIGN = 'left';
const ALIGNMENTS = Object.freeze(['left', 'center', 'right']);
const TRUE_VALUES = Object.freeze(['true', '1', 'yes']);
const FALSE_VALUES = Object.freeze(['false', '0', 'no']);
const GITHUB_USERNAME_REGEX = /^(?!.*--)[a-zA-Z0-9]([a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/;
const HANDLE_SAFE_CHARS_REGEX = /[^a-zA-Z0-9_.-]/g;

function firstQueryValue(value) {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}

export function normalizeString(value) {
  const firstValue = firstQueryValue(value);
  return typeof firstValue === 'string' ? firstValue.trim() : '';
}

export function normalizeBoolean(value, fallback = false) {
  const normalized = normalizeString(value).toLowerCase();
  if (TRUE_VALUES.includes(normalized)) return true;
  if (FALSE_VALUES.includes(normalized)) return false;
  return fallback;
}

export function normalizeTheme(value) {
  const theme = normalizeString(value).toLowerCase();
  return SUPPORTED_THEME_NAMES.includes(theme) ? theme : DEFAULT_THEME;
}

export function normalizeAlign(value) {
  const align = normalizeString(value).toLowerCase();
  return ALIGNMENTS.includes(align) ? align : DEFAULT_ALIGN;
}

export function normalizeGitHubUsername(value) {
  const username = normalizeString(value);

  if (!username) {
    return { username: '', isValid: false };
  }

  return {
    username,
    isValid: GITHUB_USERNAME_REGEX.test(username),
  };
}

export function normalizeCPHandle(value) {
  const rawHandle = normalizeString(value);
  if (!rawHandle || normalizeBoolean(rawHandle, null) !== null) {
    return null;
  }

  const handle = rawHandle
    .replace(/^@+/, '')
    .replace(HANDLE_SAFE_CHARS_REGEX, '')
    .slice(0, 64);

  return handle || null;
}

export function isValidHexColor(value) {
  const normalized = normalizeString(value);
  if (!normalized) return false;
  return /^#?([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/.test(normalized);
}

export function normalizeHexColor(value) {
  const normalized = normalizeString(value);
  if (!isValidHexColor(normalized)) return null;
  let clean = normalized.replace('#', '');
  if (clean.length === 3) {
    clean = clean.split('').map(c => c + c).join('');
  }
  return `#${clean.toLowerCase()}`;
}

export function normalizeProfileQuery(query) {
  const usernameResult = normalizeGitHubUsername(query.username || config.defaults.username);
  const leetcode = normalizeCPHandle(query.leetcode);
  const codeforces = normalizeCPHandle(query.codeforces);
  const codechef = normalizeCPHandle(query.codechef);

  // Input Hardening: Enforce strict regex validation for platform usernames
  const platformRegex = /^@?[a-zA-Z0-9_-]{1,40}$/;
  const rawLeetcode = normalizeString(query.leetcode);
  const rawCodeforces = normalizeString(query.codeforces);
  const rawCodechef = normalizeString(query.codechef);

  const isLeetcodeValid = !rawLeetcode || rawLeetcode === 'false' || platformRegex.test(rawLeetcode);
  const isCodeforcesValid = !rawCodeforces || platformRegex.test(rawCodeforces);
  const isCodechefValid = !rawCodechef || platformRegex.test(rawCodechef);

  const isPlatformHandlesValid = isLeetcodeValid && isCodeforcesValid && isCodechefValid;

  const customThemeOverrides = {};
  const overrideKeys = ['bg', 'text', 'accent', 'card_bg', 'border', 'sec_text', 'muted_text'];
  overrideKeys.forEach(key => {
    if (query[key] && isValidHexColor(query[key])) {
      customThemeOverrides[key] = normalizeHexColor(query[key]);
    }
  });

  return {
    theme: normalizeTheme(query.theme),
    align: normalizeAlign(query.align),
    hideTrophies: normalizeBoolean(query.hide_trophies, false),
    username: usernameResult.username,
    isUsernameValid: usernameResult.isValid && isPlatformHandlesValid,
    leetcode,
    codeforces,
    codechef,
    shouldRenderLeetCode: Boolean(leetcode),
    customThemeOverrides,
  };
}
