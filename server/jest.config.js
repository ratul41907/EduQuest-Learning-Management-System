// Path: E:\EduQuest\server\jest.config.js

module.exports = {
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/server.js',
    '!src/prisma.js',
    '!**/node_modules/**',
  ],
  testMatch: [
    '**/__tests__/**/*.test.js',
    '**/?(*.)+(spec|test).js',
  ],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/coverage/',
    '/logs/',
    '/uploads/',
  ],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  testTimeout: 10000,
  verbose: true,
};