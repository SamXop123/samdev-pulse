import test from 'node:test';
import assert from 'node:assert/strict';
import { sanitizeSvgValue, sanitizeSvgAttribute, sanitizeSvgHref } from './svg-sanitizer.js';

test('sanitizeSvgValue escapes script-like content', () => {
  const payload = '<script>alert("xss")</script>';
  assert.equal(
    sanitizeSvgValue(payload),
    '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
  );
});

test('sanitizeSvgValue escapes ampersands and quotes', () => {
  const payload = `Tom & Jerry's "Show"`;
  assert.equal(
    sanitizeSvgValue(payload),
    'Tom &amp; Jerry&#39;s &quot;Show&quot;'
  );
});

test('sanitizeSvgValue handles malformed SVG/XML text safely', () => {
  const payload = '</text><image href="javascript:alert(1)"/><text>';
  assert.equal(
    sanitizeSvgValue(payload),
    '&lt;/text&gt;&lt;image href=&quot;javascript:alert(1)&quot;/&gt;&lt;text&gt;'
  );
});

test('sanitizeSvgAttribute strips control chars and escapes entities', () => {
  const payload = 'line 1\u0000 & "line 2"';
  assert.equal(
    sanitizeSvgAttribute(payload),
    'line 1 &amp; &quot;line 2&quot;'
  );
});

test('sanitizeSvgHref allows safe image href values', () => {
  const safeUrl = 'https://avatars.githubusercontent.com/u/583231?v=4&size=64';
  assert.equal(
    sanitizeSvgHref(safeUrl),
    'https://avatars.githubusercontent.com/u/583231?v=4&amp;size=64'
  );
});

test('sanitizeSvgHref rejects unsafe protocols', () => {
  assert.equal(sanitizeSvgHref('javascript:alert(1)'), '');
});
