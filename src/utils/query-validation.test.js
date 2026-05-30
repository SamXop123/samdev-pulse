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
    expect(normalizeGitHubUsername(' octocat ', 'SamXop123')).toEqual({ username: 'octocat', isValid: true });
    expect(normalizeGitHubUsername('a-b', 'SamXop123')).toEqual({ username: 'a-b', isValid: true });
    expect(normalizeGitHubUsername('abc-def-ghi', 'SamXop123')).toEqual({ username: 'abc-def-ghi', isValid: true });
    expect(normalizeGitHubUsername('a', 'SamXop123')).toEqual({ username: 'a', isValid: true });
    expect(normalizeGitHubUsername('1', 'SamXop123')).toEqual({ username: '1', isValid: true });
    expect(normalizeGitHubUsername('a'.repeat(39), 'SamXop123')).toEqual({ username: 'a'.repeat(39), isValid: true });

    // Empty values use fallback default
    expect(normalizeGitHubUsername('', 'SamXop123')).toEqual({ username: 'SamXop123', isValid: true });

    // Invalid usernames
    expect(normalizeGitHubUsername('bad/name', 'SamXop123')).toEqual({ username: 'bad/name', isValid: false });
    expect(normalizeGitHubUsername('a--b', 'SamXop123')).toEqual({ username: 'a--b', isValid: false });
    expect(normalizeGitHubUsername('a---b', 'SamXop123')).toEqual({ username: 'a---b', isValid: false });
    expect(normalizeGitHubUsername('-ab', 'SamXop123')).toEqual({ username: '-ab', isValid: false });
    expect(normalizeGitHubUsername('ab-', 'SamXop123')).toEqual({ username: 'ab-', isValid: false });
    expect(normalizeGitHubUsername('a'.repeat(40), 'SamXop123')).toEqual({ username: 'a'.repeat(40), isValid: false });
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
        },
        { defaultUsername: 'SamXop123' }
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
    });
  });

  test('normalizeProfileQuery rejects invalid platform handles securely', () => {
    // Invalid leetcode injection
    const q1 = normalizeProfileQuery({ leetcode: '<script>alert(1)</script>' }, { defaultUsername: 'SamXop123' });
    expect(q1.isUsernameValid).toBe(false);

    // Invalid codeforces handle
    const q2 = normalizeProfileQuery({ codeforces: 'bad.user!' }, { defaultUsername: 'SamXop123' });
    expect(q2.isUsernameValid).toBe(false);

    // Overlong platform handle (41 characters)
    const q3 = normalizeProfileQuery({ codechef: 'a'.repeat(41) }, { defaultUsername: 'SamXop123' });
    expect(q3.isUsernameValid).toBe(false);

    // Valid handles with letters, numbers, underscore, hyphen
    const q4 = normalizeProfileQuery({ leetcode: 'user_1-2' }, { defaultUsername: 'SamXop123' });
    expect(q4.isUsernameValid).toBe(true);
  });
});
