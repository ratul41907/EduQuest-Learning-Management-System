// Path: E:\EduQuest\server\src\routes\enrollment.routes.js
const router = require("express").Router();
const prisma = require("../prisma");
const { requireAuth } = require("../middleware/auth");

// ===========================
// POST /api/enrollments/enroll
// Protected: Enroll in a course
// ===========================
router.post("/enroll", requireAuth, async (req, res) => {
  try {
    const userId = req.user.sub;
    const { courseId } = req.body;

    if (!courseId) {
      return res.status(400).json({ message: 'Course ID is required' });
    }

    // Check if already enrolled
    const existing = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: { userId, courseId }
      }
    });

    if (existing) {
      return res.status(409).json({ message: 'Already enrolled in this course' });
    }

    // Create enrollment
    const enrollment = await prisma.enrollment.create({
      data: {
        userId,
        courseId,
        progress: 0,
      },
      include: {
        course: {
          include: {
            instructor: {
              select: { id: true, fullName: true }
            }
          }
        }
      }
    });

    res.status(201).json(enrollment);
  } catch (error) {
    console.error('Error enrolling in course:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

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
              select: { id: true, fullName: true },
            },
          },
        },
      },
      orderBy: { enrolledAt: 'desc' },
    });

    res.json({ enrollments });
  } catch (error) {
    console.error('Error fetching my courses:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ===========================
// GET /api/enrollments/course/:courseId
// Protected: Get enrollment for specific course
// ===========================
router.get("/course/:courseId", requireAuth, async (req, res) => {
  try {
    const userId = req.user.sub;
    const { courseId } = req.params;

    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: { userId, courseId }
      },
      include: {
        course: true
      }
    });

    if (!enrollment) {
      return res.status(404).json({ message: 'Enrollment not found' });
    }

    res.json(enrollment);
  } catch (error) {
    console.error('Error fetching enrollment:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;