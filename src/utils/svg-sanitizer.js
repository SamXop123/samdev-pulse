const SAFE_IMAGE_HREF_REGEX = /^(https?:\/\/|data:image\/(?:png|jpe?g|gif|webp|svg\+xml);base64,)/i;
const CONTROL_CHARS_REGEX = /[\u0000-\u001F\u007F]/g;

export function sanitizeSvgValue(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function sanitizeSvgAttribute(value = '') {
  return sanitizeSvgValue(String(value).replace(CONTROL_CHARS_REGEX, ''));
}

export function sanitizeSvgHref(value = '') {
  const normalized = String(value).trim();
  if (!normalized || !SAFE_IMAGE_HREF_REGEX.test(normalized)) {
    return '';
  }

  return sanitizeSvgAttribute(normalized);
}
