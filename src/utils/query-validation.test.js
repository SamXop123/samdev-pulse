import { describe, test, expect } from '@jest/globals';
import {
  normalizeAlign,
  normalizeBoolean,
  normalizeCPHandle,
  normalizeGitHubUsername,
  normalizeProfileQuery,
  normalizeTheme,
} from './query-validation.js';

describe('query-validation.js', () => {
  test('normalizeBoolean supports common true and false query values', () => {
    expect(normalizeBoolean(' true ')).toBe(true);
    expect(normalizeBoolean('1')).toBe(true);
    expect(normalizeBoolean('YES')).toBe(true);
    expect(normalizeBoolean(' false ')).toBe(false);
    expect(normalizeBoolean('0')).toBe(false);
    expect(normalizeBoolean('NO')).toBe(false);
  });

  test('normalizeTheme and normalizeAlign trim, lowercase, and fall back safely', () => {
    expect(normalizeTheme(' TokyoNight ')).toBe('tokyonight');
    expect(normalizeTheme('unknown-theme')).toBe('dark');
    expect(normalizeAlign(' CENTER ')).toBe('center');
    expect(normalizeAlign('middle')).toBe('left');
  });

  test('normalizeGitHubUsername validates usernames correctly (lookahead rules, hyphens, and lengths)', () => {
    // Valid usernames
    expect(normalizeGitHubUsername(' octocat ')).toEqual({ username: 'octocat', isValid: true });
    expect(normalizeGitHubUsername('a-b')).toEqual({ username: 'a-b', isValid: true });
    expect(normalizeGitHubUsername('abc-def-ghi')).toEqual({ username: 'abc-def-ghi', isValid: true });
    expect(normalizeGitHubUsername('a')).toEqual({ username: 'a', isValid: true });
    expect(normalizeGitHubUsername('1')).toEqual({ username: '1', isValid: true });
    expect(normalizeGitHubUsername('a'.repeat(39))).toEqual({ username: 'a'.repeat(39), isValid: true });

    // Empty values are invalid so the route can render the fallback error SVG
    expect(normalizeGitHubUsername('')).toEqual({ username: '', isValid: false });

    // Invalid usernames
    expect(normalizeGitHubUsername('bad/name')).toEqual({ username: 'bad/name', isValid: false });
    expect(normalizeGitHubUsername('a--b')).toEqual({ username: 'a--b', isValid: false });
    expect(normalizeGitHubUsername('a---b')).toEqual({ username: 'a---b', isValid: false });
    expect(normalizeGitHubUsername('-ab')).toEqual({ username: '-ab', isValid: false });
    expect(normalizeGitHubUsername('ab-')).toEqual({ username: 'ab-', isValid: false });
    expect(normalizeGitHubUsername('a'.repeat(40))).toEqual({ username: 'a'.repeat(40), isValid: false });
  });

  test('normalizeCPHandle sanitizes handles and treats boolean-like values as disabled', () => {
    expect(normalizeCPHandle(' @tourist ')).toBe('tourist');
    expect(normalizeCPHandle('user/name?<x>')).toBe('usernamex');
    expect(normalizeCPHandle('false')).toBe(null);
    expect(normalizeCPHandle('0')).toBe(null);
    expect(normalizeCPHandle('yes')).toBe(null);
  });

  test('normalizeProfileQuery returns normalized values for the profile route', () => {
    expect(
      normalizeProfileQuery(
        {
          username: ' octocat ',
          theme: ' Dracula ',
          align: 'RIGHT',
          hide_trophies: 'yes',
          leetcode: 'false',
          codeforces: ' tourist ',
          codechef: '@chef-user',
        }
      )
    ).toEqual({
      theme: 'dracula',
      align: 'right',
      hideTrophies: true,
      username: 'octocat',
      isUsernameValid: true,
      leetcode: null,
      codeforces: 'tourist',
      codechef: 'chef-user',
      shouldRenderLeetCode: false,
      customThemeOverrides: {},
    });
  });

  test('normalizeProfileQuery falls back to the configured default username', () => {
    const result = normalizeProfileQuery(
      {}
    );

    expect(result.isUsernameValid).toBe(true);
    expect(result.username).toBe('SamXop123');
  });

  test('normalizeProfileQuery rejects invalid platform handles securely', () => {
    // Invalid leetcode injection
    const q1 = normalizeProfileQuery(
      {
        username: 'SamXop123',
        leetcode: '<script>alert(1)</script>'
      }
    );
    expect(q1.isUsernameValid).toBe(false);

    // Invalid codeforces handle
    const q2 = normalizeProfileQuery(
      {
        username: 'SamXop123',
        codeforces: 'bad.user!'
      }
    );
    expect(q2.isUsernameValid).toBe(false);

    // Overlong platform handle (41 characters)
    const q3 = normalizeProfileQuery(
      {
        username: 'SamXop123',
        codechef: 'a'.repeat(41)
      }
    );
    expect(q3.isUsernameValid).toBe(false);

    // Valid handles with letters, numbers, underscore, hyphen
    const q4 = normalizeProfileQuery(
      {
        username: 'SamXop123',
        leetcode: 'user_1-2'
      }
    );
    expect(q4.isUsernameValid).toBe(true);
  });
});
