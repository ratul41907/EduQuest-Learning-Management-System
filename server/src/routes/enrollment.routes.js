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
            _count: {
              select: {
                lessons: true,
                quizzes: true,
              }
            }
          },
        },
      },
      orderBy: { enrolledAt: 'desc' },
    });

    // Transform to include lessonCount and quizCount
    const transformedEnrollments = enrollments.map(e => ({
      ...e,
      course: {
        ...e.course,
        lessonCount: e.course._count.lessons,
        quizCount: e.course._count.quizzes,
      }
    }));

    res.json({ enrollments: transformedEnrollments });
  } catch (error) {
    console.error('Error fetching my courses:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ===========================
// POST /api/enrollments/enroll (NOT USED - use /courses/:id/enroll instead)
// ===========================

module.exports = router;