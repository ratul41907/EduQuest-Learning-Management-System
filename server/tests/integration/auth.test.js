// Path: E:\EduQuest\server\tests\integration\auth.test.js

const request = require('supertest');
const app = require('../../src/app');
const { clearDatabase, createTestUser, closeDatabase } = require('../helpers/database');

describe('Auth API Integration Tests', () => {
  beforeEach(async () => {
    await clearDatabase();
  });

  afterAll(async () => {
    await closeDatabase();
  });

  describe('POST /api/v2/auth/register', () => {
    test('should register a new user successfully', async () => {
      const response = await request(app)
        .post('/api/v2/auth/register')
        .send({
          fullName: 'New User',
          email: 'newuser@test.com',
          password: 'password123',
        });

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        success: true,
        data: {
          user: {
            fullName: 'New User',
            email: 'newuser@test.com',
            role: 'STUDENT',
          },
          token: expect.any(String),
        },
        meta: {
          version: '2.0.0',
        },
      });
    });

    test('should fail with duplicate email', async () => {
      await createTestUser('STUDENT');

      const response = await request(app)
        .post('/api/v2/auth/register')
        .send({
          fullName: 'Another User',
          email: 'test-student@test.com',
          password: 'password123',
        });

      expect(response.status).toBe(409);
      expect(response.body).toMatchObject({
        success: false,
        error: {
          code: 'EMAIL_EXISTS',
        },
      });
    });

    test('should fail with invalid email', async () => {
      const response = await request(app)
        .post('/api/v2/auth/register')
        .send({
          fullName: 'Test User',
          email: 'invalid-email',
          password: 'password123',
        });

      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({
        message: 'Validation failed',
      });
    });

    test('should fail with short password', async () => {
      const response = await request(app)
        .post('/api/v2/auth/register')
        .send({
          fullName: 'Test User',
          email: 'test@test.com',
          password: '123',
        });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/v2/auth/login', () => {
    test('should login successfully with valid credentials', async () => {
      await createTestUser('STUDENT');

      const response = await request(app)
        .post('/api/v2/auth/login')
        .send({
          email: 'test-student@test.com',
          password: 'password123',
        });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        success: true,
        data: {
          user: expect.objectContaining({
            email: expect.any(String),
            role: 'STUDENT',
          }),
          token: expect.any(String),
        },
      });
    });

    test('should fail with invalid email', async () => {
      const response = await request(app)
        .post('/api/v2/auth/login')
        .send({
          email: 'nonexistent@test.com',
          password: 'password123',
        });

      expect(response.status).toBe(401);
      expect(response.body).toMatchObject({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
        },
      });
    });

    test('should fail with wrong password', async () => {
      await createTestUser('STUDENT');

      const response = await request(app)
        .post('/api/v2/auth/login')
        .send({
          email: 'test-student@test.com',
          password: 'wrongpassword',
        });

      expect(response.status).toBe(401);
      expect(response.body).toMatchObject({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
        },
      });
    });
  });

  describe('GET /api/v2/auth/me', () => {
    test('should return user info with valid token', async () => {
      const user = await createTestUser('STUDENT');
      const token = global.testUtils.generateToken(user.id, 'STUDENT');

      const response = await request(app)
        .get('/api/v2/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        success: true,
        data: expect.objectContaining({
          email: user.email,
          role: 'STUDENT',
        }),
      });
    });

    test('should fail without token', async () => {
      const response = await request(app).get('/api/v2/auth/me');

      expect(response.status).toBe(401);
    });

    test('should fail with invalid token', async () => {
      const response = await request(app)
        .get('/api/v2/auth/me')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
    });
  });
});