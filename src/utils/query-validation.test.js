import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeAlign,
  normalizeBoolean,
  normalizeCPHandle,
  normalizeGitHubUsername,
  normalizeProfileQuery,
  normalizeTheme,
} from './query-validation.js';

test('normalizeBoolean supports common true and false query values', () => {
  assert.equal(normalizeBoolean(' true '), true);
  assert.equal(normalizeBoolean('1'), true);
  assert.equal(normalizeBoolean('YES'), true);
  assert.equal(normalizeBoolean(' false '), false);
  assert.equal(normalizeBoolean('0'), false);
  assert.equal(normalizeBoolean('NO'), false);
});

test('normalizeTheme and normalizeAlign trim, lowercase, and fall back safely', () => {
  assert.equal(normalizeTheme(' TokyoNight '), 'tokyonight');
  assert.equal(normalizeTheme('unknown-theme'), 'dark');
  assert.equal(normalizeAlign(' CENTER '), 'center');
  assert.equal(normalizeAlign('middle'), 'left');
});

test('normalizeGitHubUsername validates usernames correctly (lookahead rules, hyphens, and lengths)', () => {
  // Valid usernames
  assert.deepEqual(normalizeGitHubUsername(' octocat ', 'SamXop123'), { username: 'octocat', isValid: true });
  assert.deepEqual(normalizeGitHubUsername('a-b', 'SamXop123'), { username: 'a-b', isValid: true });
  assert.deepEqual(normalizeGitHubUsername('abc-def-ghi', 'SamXop123'), { username: 'abc-def-ghi', isValid: true });
  assert.deepEqual(normalizeGitHubUsername('a', 'SamXop123'), { username: 'a', isValid: true });
  assert.deepEqual(normalizeGitHubUsername('1', 'SamXop123'), { username: '1', isValid: true });
  assert.deepEqual(normalizeGitHubUsername('a'.repeat(39), 'SamXop123'), { username: 'a'.repeat(39), isValid: true });
  
  // Empty values use fallback default
  assert.deepEqual(normalizeGitHubUsername('', 'SamXop123'), { username: 'SamXop123', isValid: true });

  // Invalid usernames
  assert.deepEqual(normalizeGitHubUsername('bad/name', 'SamXop123'), { username: 'bad/name', isValid: false });
  assert.deepEqual(normalizeGitHubUsername('a--b', 'SamXop123'), { username: 'a--b', isValid: false });
  assert.deepEqual(normalizeGitHubUsername('a---b', 'SamXop123'), { username: 'a---b', isValid: false });
  assert.deepEqual(normalizeGitHubUsername('-ab', 'SamXop123'), { username: '-ab', isValid: false });
  assert.deepEqual(normalizeGitHubUsername('ab-', 'SamXop123'), { username: 'ab-', isValid: false });
  assert.deepEqual(normalizeGitHubUsername('a'.repeat(40), 'SamXop123'), { username: 'a'.repeat(40), isValid: false });
});

test('normalizeCPHandle sanitizes handles and treats boolean-like values as disabled', () => {
  assert.equal(normalizeCPHandle(' @tourist '), 'tourist');
  assert.equal(normalizeCPHandle('user/name?<x>'), 'usernamex');
  assert.equal(normalizeCPHandle('false'), null);
  assert.equal(normalizeCPHandle('0'), null);
  assert.equal(normalizeCPHandle('yes'), null);
});

test('normalizeProfileQuery returns normalized values for the profile route', () => {
  assert.deepEqual(
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
    ),
    {
      theme: 'dracula',
      align: 'right',
      hideTrophies: true,
      username: 'octocat',
      isUsernameValid: true,
      leetcode: null,
      codeforces: 'tourist',
      codechef: 'chef-user',
      shouldRenderLeetCode: false,
    }
  );
});

test('normalizeProfileQuery rejects invalid platform handles securely', () => {
  // Invalid leetcode injection
  const q1 = normalizeProfileQuery({ leetcode: '<script>alert(1)</script>' }, { defaultUsername: 'SamXop123' });
  assert.equal(q1.isUsernameValid, false);

  // Invalid codeforces handle
  const q2 = normalizeProfileQuery({ codeforces: 'bad.user!' }, { defaultUsername: 'SamXop123' });
  assert.equal(q2.isUsernameValid, false);

  // Overlong platform handle (41 characters)
  const q3 = normalizeProfileQuery({ codechef: 'a'.repeat(41) }, { defaultUsername: 'SamXop123' });
  assert.equal(q3.isUsernameValid, false);

  // Valid handles with letters, numbers, underscore, hyphen
  const q4 = normalizeProfileQuery({ leetcode: 'user_1-2' }, { defaultUsername: 'SamXop123' });
  assert.equal(q4.isUsernameValid, true);
});
