import { describe, expect, test } from '@jest/globals';
import { loadConfig, validateConfig } from './index.js';

describe('config', () => {
  test('loads defaults for optional runtime settings', () => {
    const config = loadConfig({});

    expect(config).toMatchObject({
      env: 'development',
      isProduction: false,
      port: 3000,
      github: {
        token: null,
        enabled: false,
      },
      admin: {
        apiKey: null,
        cacheStatsProtected: false,
      },
      analytics: {
        disabled: false,
        enabled: false,
        mongoUri: null,
      },
      cache: {
        maxSize: 1000,
        defaultTtlMs: 300000,
      },
      defaults: {
        username: 'SamXop123',
      },
    });
    expect(config.diagnostics.missingOptional).toEqual([
      'GITHUB_TOKEN',
      'MONGODB_URI',
      'ADMIN_API_KEY',
    ]);
  });

  test('enables optional features from environment values', () => {
    const config = loadConfig({
      NODE_ENV: 'production',
      PORT: '8080',
      GITHUB_TOKEN: 'ghp_test',
      ADMIN_API_KEY: 'secret',
      MONGODB_URI: 'mongodb://localhost:27017/samdev',
      MONGODB_DB: 'samdev_test',
      CACHE_MAX_SIZE: '42',
      DEFAULT_USERNAME: 'octocat',
    });

    expect(config).toMatchObject({
      env: 'production',
      isProduction: true,
      port: 8080,
      github: {
        token: 'ghp_test',
        enabled: true,
      },
      admin: {
        apiKey: 'secret',
        cacheStatsProtected: true,
      },
      analytics: {
        disabled: false,
        enabled: true,
        mongoUri: 'mongodb://localhost:27017/samdev',
        dbName: 'samdev_test',
      },
      cache: {
        maxSize: 42,
        defaultTtlMs: 1800000,
      },
      defaults: {
        username: 'octocat',
      },
    });
    expect(config.diagnostics.missingOptional).toEqual([]);
  });

  test('reports invalid ports as startup errors', () => {
    const config = loadConfig({ PORT: 'not-a-port' });

    expect(config.port).toBe(3000);
    expect(config.diagnostics.errors).toEqual([
      'PORT must be an integer between 1 and 65535. Received: not-a-port',
    ]);
    expect(() => validateConfig(config)).toThrow('Invalid configuration');
  });

  test('warns and falls back for invalid cache sizes', () => {
    const config = loadConfig({ CACHE_MAX_SIZE: '0' });

    expect(config.cache.maxSize).toBe(1000);
    expect(config.diagnostics.warnings).toContain('CACHE_MAX_SIZE is invalid; using default 1000.');
  });

  test('keeps analytics disabled when explicitly requested', () => {
    const config = loadConfig({
      DISABLE_ANALYTICS: 'yes',
      MONGODB_URI: 'mongodb://localhost:27017/samdev',
    });

    expect(config.analytics.disabled).toBe(true);
    expect(config.analytics.enabled).toBe(false);
    expect(config.diagnostics.features.analytics).toBe(false);
    expect(config.diagnostics.missingOptional).not.toContain('MONGODB_URI');
  });
});
