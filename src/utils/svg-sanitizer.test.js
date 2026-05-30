import { describe, test, expect } from '@jest/globals';
import { sanitizeSvgValue, sanitizeSvgAttribute, sanitizeSvgHref } from './svg-sanitizer.js';

describe('svg-sanitizer.js', () => {
  test('sanitizeSvgValue escapes script-like content', () => {
    const payload = '<script>alert("xss")</script>';
    expect(
      sanitizeSvgValue(payload)
    ).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
  });

  test('sanitizeSvgValue escapes ampersands and quotes', () => {
    const payload = `Tom & Jerry's "Show"`;
    expect(
      sanitizeSvgValue(payload)
    ).toBe('Tom &amp; Jerry&#39;s &quot;Show&quot;');
  });

  test('sanitizeSvgValue handles malformed SVG/XML text safely', () => {
    const payload = '</text><image href="javascript:alert(1)"/><text>';
    expect(
      sanitizeSvgValue(payload)
    ).toBe('&lt;/text&gt;&lt;image href=&quot;javascript:alert(1)&quot;/&gt;&lt;text&gt;');
  });

  test('sanitizeSvgAttribute strips control chars and escapes entities', () => {
    const payload = 'line 1\u0000 & "line 2"';
    expect(
      sanitizeSvgAttribute(payload)
    ).toBe('line 1 &amp; &quot;line 2&quot;');
  });

  test('sanitizeSvgHref allows safe image href values', () => {
    const safeUrl = 'https://avatars.githubusercontent.com/u/583231?v=4&size=64';
    expect(
      sanitizeSvgHref(safeUrl)
    ).toBe('https://avatars.githubusercontent.com/u/583231?v=4&amp;size=64');
  });

  test('sanitizeSvgHref rejects unsafe protocols', () => {
    expect(sanitizeSvgHref('javascript:alert(1)')).toBe('');
  });
});
