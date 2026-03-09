// Path: E:\EduQuest\server\tests\integration\courses.test.js

const request = require('supertest');
const app = require('../../src/app');
const {
  clearDatabase,
  createTestUser,
  createTestCourse,
  closeDatabase,
} = require('../helpers/database');

describe('Courses API Integration Tests', () => {
  let instructor, student, instructorToken, studentToken;

  beforeEach(async () => {
    await clearDatabase();
    
    instructor = await createTestUser('INSTRUCTOR');
    student = await createTestUser('STUDENT');
    
    instructorToken = global.testUtils.generateToken(instructor.id, 'INSTRUCTOR');
    studentToken = global.testUtils.generateToken(student.id, 'STUDENT');
  });

  afterAll(async () => {
    await closeDatabase();
  });

  describe('GET /api/v2/courses', () => {
    test('should return list of courses', async () => {
      await createTestCourse(instructor.id);
      await createTestCourse(instructor.id);

      const response = await request(app).get('/api/v2/courses');

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        total: 2,
        courses: expect.arrayContaining([
          expect.objectContaining({
            title: 'Test Course',
          }),
        ]),
      });
    });

    test('should return empty list when no courses', async () => {
      const response = await request(app).get('/api/v2/courses');

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        total: 0,
        courses: [],
      });
    });
  });

  describe('POST /api/v2/courses', () => {
    test('should create course as instructor', async () => {
      const response = await request(app)
        .post('/api/v2/courses')
        .set('Authorization', `Bearer ${instructorToken}`)
        .send({
          title: 'New Course',
          description: 'Course description for testing',
          price: 0,
          level: 1,
        });

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        title: 'New Course',
        instructorId: instructor.id,
      });
    });

    test('should fail as student', async () => {
      const response = await request(app)
        .post('/api/v2/courses')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          title: 'New Course',
          description: 'Course description',
        });

      expect(response.status).toBe(403);
    });

    test('should fail without authentication', async () => {
      const response = await request(app)
        .post('/api/v2/courses')
        .send({
          title: 'New Course',
          description: 'Course description',
        });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/v2/courses/:id', () => {
    test('should return course by ID', async () => {
      const course = await createTestCourse(instructor.id);

      const response = await request(app).get(`/api/v2/courses/${course.id}`);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        id: course.id,
        title: 'Test Course',
      });
    });

    test('should return 404 for non-existent course', async () => {
      const response = await request(app).get('/api/v2/courses/nonexistent-id');

      expect(response.status).toBe(404);
    });
  });
});