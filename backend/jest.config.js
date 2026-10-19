// Backend tests: Jest + Supertest against a real MongoDB (MONGODB_URI_TEST, a database whose name ends in _test)
module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.js'],
  setupFiles: ['<rootDir>/tests/setup/env.js'],
  globalSetup: '<rootDir>/tests/setup/globalSetup.js',
  globalTeardown: '<rootDir>/tests/setup/globalTeardown.js',
  // Every test file uses the same test database: run them one after another
  maxWorkers: 1,
  testTimeout: 30000,
};
