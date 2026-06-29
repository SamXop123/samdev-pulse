const SENSITIVE_PATTERNS = [
  /(gh[ps]_[a-zA-Z0-9_]{10,})/gi,
  /(gho_[a-zA-Z0-9_]{10,})/gi,
  /(github_pat_[a-zA-Z0-9_]{10,})/gi,
  /(Bearer\s+[a-zA-Z0-9\-._~+/]{10,})/gi,
  /(Authorization:\s*[a-zA-Z0-9\-._~+/]{10,})/gi,
  /(token\s*[:=]\s*['"][^'"]+['"])/gi,
  /(api[_-]?key\s*[:=]\s*['"][^'"]+['"])/gi,
];

function hasSensitiveContent(value) {
  if (typeof value !== 'string') return false;
  return SENSITIVE_PATTERNS.some(pattern => pattern.test(value));
}

function redactSensitiveStrings(obj, depth = 0) {
  if (depth > 5 || obj === null || obj === undefined) return obj;
  if (typeof obj === 'string') {
    let result = obj;
    for (const pattern of SENSITIVE_PATTERNS) {
      result = result.replace(pattern, '[REDACTED]');
    }
    return result;
  }
  if (Array.isArray(obj)) {
    return obj.map(item => redactSensitiveStrings(item, depth + 1));
  }
  if (typeof obj === 'object') {
    const result = {};
    for (const [key, value] of Object.entries(obj)) {
      if (key.toLowerCase().includes('authorization') || key.toLowerCase().includes('token')) {
        result[key] = '[REDACTED]';
      } else {
        result[key] = redactSensitiveStrings(value, depth + 1);
      }
    }
    return result;
  }
  return obj;
}

export function sanitizeErrorForLogging(error) {
  if (error === null || error === undefined) return { message: 'Unknown error' };

  const sensitiveKeys = new Set([
    'config', 'request', 'response',
    '_config', '_request', '_response',
    'headers', 'rawHeaders',
  ]);

  const safe = {};

  for (const key of Object.getOwnPropertyNames(error)) {
    if (sensitiveKeys.has(key)) continue;
    if (key.toLowerCase().includes('stack')) continue;

    try {
      const value = error[key];
      if (typeof value === 'function') continue;
      safe[key] = redactSensitiveStrings(value);
    } catch {
      safe[key] = '[Unreadable]';
    }
  }

  if (!('name' in safe)) safe.name = error.name || 'Error';
  if (!('message' in safe)) safe.message = error.message || '';

  const sanitized = JSON.parse(JSON.stringify(safe, (key, value) => {
    if (typeof value === 'object' && value !== null) {
      const stringified = value.toString && value.toString !== Object.prototype.toString
        ? value.toString()
        : null;
      return stringified !== null && stringified !== '[object Object]' ? stringified : value;
    }
    return value;
  }));

  return sanitized;
}

export function sanitizeErrorResponse(error) {
  return {
    error: 'An internal error occurred. Please try again.',
    status: error.status || error.statusCode || 500,
  };
}
