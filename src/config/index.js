import dotenv from 'dotenv';

dotenv.config({ quiet: true });

const TRUE_VALUES = new Set(['true', '1', 'yes']);
const DEFAULT_PORT = 3000;
const DEFAULT_CACHE_MAX_SIZE = 1000;
const PRODUCTION_CACHE_TTL_MS = 1800000;
const DEVELOPMENT_CACHE_TTL_MS = 300000;
const KNOWN_NODE_ENVS = new Set(['development', 'production', 'test']);

function readString(env, key) {
  const value = env[key];
  return typeof value === 'string' && value.trim() ? value.trim() : '';
}

function readBoolean(env, key) {
  return TRUE_VALUES.has(readString(env, key).toLowerCase());
}

function normalizePort(rawPort, errors) {
  if (!rawPort) {
    return DEFAULT_PORT;
  }

  const port = Number(rawPort);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    errors.push(`PORT must be an integer between 1 and 65535. Received: ${rawPort}`);
    return DEFAULT_PORT;
  }

  return port;
}

function normalizePositiveInteger(rawValue, defaultValue, key, warnings) {
  if (!rawValue) {
    return defaultValue;
  }

  const value = parseInt(rawValue, 10);
  if (!Number.isInteger(value) || value < 1) {
    warnings.push(`${key} is invalid; using default ${defaultValue}.`);
    return defaultValue;
  }

  return value;
}

export function loadConfig(env = process.env) {
  const errors = [];
  const warnings = [];
  const nodeEnv = readString(env, 'NODE_ENV') || 'development';
  const isProduction = nodeEnv === 'production';
  const githubToken = readString(env, 'GITHUB_TOKEN');
  const mongoUri = readString(env, 'MONGODB_URI');
  const analyticsDisabled = readBoolean(env, 'ANALYTICS_DISABLED') || readBoolean(env, 'DISABLE_ANALYTICS');
  const analyticsEnabled = !analyticsDisabled && Boolean(mongoUri);
  const cacheMaxSize = normalizePositiveInteger(
    readString(env, 'CACHE_MAX_SIZE'),
    DEFAULT_CACHE_MAX_SIZE,
    'CACHE_MAX_SIZE',
    warnings
  );

  if (!KNOWN_NODE_ENVS.has(nodeEnv)) {
    warnings.push(`NODE_ENV is '${nodeEnv}'. Expected development, production, or test.`);
  }

  return {
    env: nodeEnv,
    isProduction,
    port: normalizePort(readString(env, 'PORT'), errors),
    github: {
      token: githubToken || null,
      enabled: Boolean(githubToken),
    },
    admin: {
      apiKey: readString(env, 'ADMIN_API_KEY') || null,
      cacheStatsProtected: Boolean(readString(env, 'ADMIN_API_KEY')),
    },
    analytics: {
      disabled: analyticsDisabled,
      enabled: analyticsEnabled,
      mongoUri: mongoUri || null,
      dbName: readString(env, 'MONGODB_DB') || undefined,
    },
    cache: {
      maxSize: cacheMaxSize,
      defaultTtlMs: isProduction ? PRODUCTION_CACHE_TTL_MS : DEVELOPMENT_CACHE_TTL_MS,
    },
    defaults: {
      username: readString(env, 'DEFAULT_USERNAME') || 'SamXop123',
    },
    diagnostics: {
      warnings,
      errors,
      missingOptional: [
        ...(!githubToken ? ['GITHUB_TOKEN'] : []),
        ...(!analyticsDisabled && !mongoUri ? ['MONGODB_URI'] : []),
        ...(!readString(env, 'ADMIN_API_KEY') ? ['ADMIN_API_KEY'] : []),
      ],
      features: {
        githubToken: Boolean(githubToken),
        analytics: analyticsEnabled,
        cacheStatsAuth: Boolean(readString(env, 'ADMIN_API_KEY')),
      },
    },
  };
}

export function validateConfig(config) {
  if (config.diagnostics.errors.length > 0) {
    throw new Error(`Invalid configuration:\n${config.diagnostics.errors.map(error => `- ${error}`).join('\n')}`);
  }
}

export function logStartupDiagnostics(config, logger = console) {
  const enabled = [];
  const disabled = [];

  if (config.github.enabled) enabled.push('GitHub token auth');
  else disabled.push('GitHub token auth');

  if (config.analytics.enabled) enabled.push('analytics');
  else disabled.push('analytics');

  if (config.admin.cacheStatsProtected) enabled.push('cache stats auth');
  else disabled.push('cache stats auth');

  logger.info(`Features enabled: ${enabled.length ? enabled.join(', ') : 'none'}.`);
  logger.info(`Optional features disabled: ${disabled.join(', ')}.`);

  if (config.diagnostics.missingOptional.length > 0) {
    logger.info(`Missing optional config: ${config.diagnostics.missingOptional.join(', ')}.`);
  }

  config.diagnostics.warnings.forEach(warning => logger.warn(`Configuration warning: ${warning}`));
}

const config = loadConfig();

export default config;
