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

test('normalizeGitHubUsername trims values and preserves invalid username handling', () => {
  assert.deepEqual(
    normalizeGitHubUsername(' octocat ', 'SamXop123'),
    { username: 'octocat', isValid: true }
  );
  assert.deepEqual(
    normalizeGitHubUsername('bad/name', 'SamXop123'),
    { username: 'bad/name', isValid: false }
  );
  assert.deepEqual(
    normalizeGitHubUsername('', 'SamXop123'),
    { username: 'SamXop123', isValid: true }
  );
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
