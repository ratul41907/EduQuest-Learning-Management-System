// Path: E:\EduQuest\server\tests\helpers\database.js

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

/**
 * Clear all data from test database
 */
async function clearDatabase() {
  const tables = [
    'LessonProgress',
    'QuizAttempt',
    'Question',
    'Quiz',
    'Lesson',
    'Review',
    'Certificate',
    'UserBadge',
    'Notification',
    'Enrollment',
    'Course',
    'Badge',
    'User',
  ];

  for (const table of tables) {
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${table}" CASCADE;`);
  }
}

/**
 * Create test user
 */
async function createTestUser(role = 'STUDENT') {
  const bcrypt = require('bcrypt');
  
  const passwordHash = await bcrypt.hash('password123', 10);
  
  return await prisma.user.create({
    data: {
      fullName: `Test ${role}`,
      email: `test-${role.toLowerCase()}-${Date.now()}@test.com`,
      passwordHash,
      role,
    },
  });
}

/**
 * Create test course
 */
async function createTestCourse(instructorId) {
  return await prisma.course.create({
    data: {
      title: 'Test Course',
      description: 'Test course description for testing purposes',
      instructorId,
      price: 0,
      level: 1,
    },
  });
}

/**
 * Close database connection
 */
async function closeDatabase() {
  await prisma.$disconnect();
}

module.exports = {
  prisma,
  clearDatabase,
  createTestUser,
  createTestCourse,
  closeDatabase,
};