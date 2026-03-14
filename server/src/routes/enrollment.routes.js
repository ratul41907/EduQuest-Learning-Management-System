// Path: E:\EduQuest\server\src\routes\enrollment.routes.js
const router = require("express").Router();
const prisma = require("../prisma");
const { requireAuth } = require("../middleware/auth");

// ===========================
// GET /api/enrollments/my-courses
// Protected: Get my enrolled courses
// ===========================
router.get("/my-courses", requireAuth, async (req, res) => {
  try {
    const userId = req.user.sub;
    
    const enrollments = await prisma.enrollment.findMany({
      where: { userId },
      include: {
        course: {
          include: {
            instructor: {
              select: { 
                id: true, 
                fullName: true 
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Add lesson count and quiz count manually
    const enrichedEnrollments = await Promise.all(
      enrollments.map(async (e) => {
        const lessonCount = await prisma.lesson.count({
          where: { courseId: e.courseId }
        });
        const quizCount = await prisma.quiz.count({
          where: { courseId: e.courseId }
        });

        return {
          ...e,
          course: {
            ...e.course,
            lessonCount,
            quizCount,
          }
        };
      })
    );

    res.json({ enrollments: enrichedEnrollments });
  } catch (error) {
    console.error('Error fetching my courses:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;