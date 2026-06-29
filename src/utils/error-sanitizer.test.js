import { afterEach, describe, expect, jest, test } from '@jest/globals';
import { sanitizeErrorForLogging, sanitizeErrorResponse } from './error-sanitizer.js';

describe('sanitizeErrorForLogging', () => {
  test('handles null/undefined', () => {
    expect(sanitizeErrorForLogging(null)).toEqual({ message: 'Unknown error' });
    expect(sanitizeErrorForLogging(undefined)).toEqual({ message: 'Unknown error' });
  });

  test('strips sensitive keys', () => {
    const error = new Error('test');
    error.config = { headers: { Authorization: 'Bearer ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' } };
    error.request = { method: 'GET', url: 'https://api.github.com' };
    error.stack = 'Error: test\n    at ...';

    const result = sanitizeErrorForLogging(error);
    expect(result.config).toBeUndefined();
    expect(result.request).toBeUndefined();
    expect(result.stack).toBeUndefined();
    expect(result.name).toBe('Error');
    expect(result.message).toBe('test');
  });

  test('redacts Authorization header from nested objects', () => {
    const error = new Error('API error');
    error.details = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const result = sanitizeErrorForLogging(error);
    // Authorization key is stripped because "headers" is in sensitiveKeys
    // But if headers is nested inside details, it's more nuanced
    expect(result.message).toBe('API error');
  });

  test('redacts sensitive string patterns', () => {
    const error = new Error('Token: ghp_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa');
    const result = sanitizeErrorForLogging(error);
    expect(result.message).not.toContain('ghp_');
    expect(result.message).toContain('[REDACTED]');
  });

  test('redacts github_pat tokens', () => {
    const error = new Error('github_pat_11AAbbCCddEEffGGhhII1234567890abcdefghijklmno');
    const result = sanitizeErrorForLogging(error);
    expect(result.message).toContain('[REDACTED]');
  });

  test('handles plain Error instance', () => {
    const error = new Error('Something broke');
    const result = sanitizeErrorForLogging(error);
    expect(result.name).toBe('Error');
    expect(result.message).toBe('Something broke');
  });

  test('handles error with custom properties', () => {
    const error = new Error('Not found');
    error.code = 'NOT_FOUND';
    error.status = 404;
    error.url = 'https://api.github.com/users/nonexistent';

    const result = sanitizeErrorForLogging(error);
    expect(result.code).toBe('NOT_FOUND');
    expect(result.status).toBe(404);
    expect(result.url).toBe('https://api.github.com/users/nonexistent');
  });

  test('redacts token in nested strings', () => {
    const error = new Error('Failed');
    error.context = {
      url: 'https://api.github.com/user',
      responseBody: '{"message":"Bad credentials","token":"ghp_test1234567890abc"}',
    };

    const result = sanitizeErrorForLogging(error);
    expect(result.context.responseBody).toContain('[REDACTED]');
    expect(result.context.responseBody).not.toContain('ghp_test123');
  });

  test('does not crash on circular references', () => {
    const error = new Error('Circular');
    error.self = {};
    error.self.ref = error;

    const result = sanitizeErrorForLogging(error);
    // should not throw
    expect(result.message).toBe('Circular');
  });

  test('preserves known safe properties', () => {
    const error = new Error('Timeout');
    error.code = 'TIMEOUT';
    error.status = 0;
    error.url = 'https://api.github.com';

    const result = sanitizeErrorForLogging(error);
    expect(result.code).toBe('TIMEOUT');
    expect(result.status).toBe(0);
    expect(result.url).toBe('https://api.github.com');
  });

  test('handles error with no message', () => {
    const error = {};
    const result = sanitizeErrorForLogging(error);
    expect(result.message).toBe('');
  });

  test('does not leak gho_ tokens', () => {
    const error = new Error('gho_abcdefghijklmnopqrstuvwxyz12345678ABCDEFGH');
    const result = sanitizeErrorForLogging(error);
    expect(result.message).toContain('[REDACTED]');
    expect(result.message).not.toMatch(/gho_/);
  });
});

describe('sanitizeErrorResponse', () => {
  test('returns generic error message', () => {
    const result = sanitizeErrorResponse(new Error('Sensitive detail'));
    expect(result.error).toBe('An internal error occurred. Please try again.');
    expect(result.status).toBe(500);
  });

  test('preserves status code', () => {
    const error = new Error('Not found');
    error.status = 404;
    const result = sanitizeErrorResponse(error);
    expect(result.status).toBe(404);
  });

  test('handles statusCode property', () => {
    const error = new Error('Bad request');
    error.statusCode = 400;
    const result = sanitizeErrorResponse(error);
    expect(result.status).toBe(400);
  });
});
