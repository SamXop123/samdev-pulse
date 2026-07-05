// Jest configuration for samdev-pulse unit and integration tests
export default {
  testEnvironment: 'jsdom',
  transform: {},
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  testMatch: ['**/__tests__/**/*.test.js', '**/?(*.)+(spec|test).js'],
  testPathIgnorePatterns: [
    '/node_modules/',
  ],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/server.js',
  ],
  coverageThreshold: {
    global: {
      statements: 20,
      branches: 15,
      functions: 20,
      lines: 20,
    },
  },
};
