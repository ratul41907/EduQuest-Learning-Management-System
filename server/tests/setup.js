// Path: E:\EduQuest\server\tests\setup.js

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key-for-testing-purposes-only';
process.env.DATABASE_URL = 'postgresql://postgres:pErA2027@localhost:5432/eduquest_test';
process.env.PORT = 5001;

// Disable Redis in tests (to avoid connection errors)
process.env.REDIS_HOST = '';
process.env.REDIS_PORT = '';

// Increase timeout for tests
jest.setTimeout(10000);

// Mock Redis to prevent connection attempts
jest.mock('../src/config/redis', () => ({
  getCache: jest.fn().mockResolvedValue(null),
  setCache: jest.fn().mockResolvedValue(true),
  deleteCache: jest.fn().mockResolvedValue(true),
  deleteCachePattern: jest.fn().mockResolvedValue(true),
  isRedisConnected: jest.fn().mockReturnValue(false),
  closeRedis: jest.fn().mockResolvedValue(true),
}));

// Global test utilities
global.testUtils = {
  generateToken: (userId, role) => {
    const jwt = require('jsonwebtoken');
    return jwt.sign(
      { sub: userId, role, email: 'test@test.com' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
  },
};