const router = require("express").Router();
const prisma = require("../prisma");
const { requireAuth } = require("../middleware/auth");

// GET /api/lessons/course/:courseId
// Student must be enrolled OR instructor/admin can view
router.get("/course/:courseId", requireAuth, async (req, res) => {
  const { courseId } = req.params;
  const userId = req.user.sub;
  const role = req.user.role;

  try {
    // Course exists?
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) return res.status(404).json({ message: "Course not found" });

    // Instructor/Admin can view
    if (role === "INSTRUCTOR" || role === "ADMIN") {
      const lessons = await prisma.lesson.findMany({
        where: { courseId },
        orderBy: { orderNo: "asc" },
        select: { id: true, title: true, content: true, orderNo: true },
      });
      return res.json(lessons);
    }

    // Student must be enrolled
    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });

    if (!enrollment) {
      return res.status(403).json({ message: "You are not enrolled in this course" });
    }

    const lessons = await prisma.lesson.findMany({
      where: { courseId },
      orderBy: { orderNo: "asc" },
      select: { id: true, title: true, content: true, orderNo: true },
    });

    return res.json(lessons);
  } catch (err) {
    return res.status(500).json({ message: "Failed to load lessons", error: err.message });
  }
});

module.exports = router;
