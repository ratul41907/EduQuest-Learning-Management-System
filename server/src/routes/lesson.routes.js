const router = require("express").Router();
const prisma = require("../prisma");
const { requireAuth } = require("../middleware/auth");

// ===============================
// GET /api/lessons/course/:courseId
// Student: view lessons for a course
// Protected: Bearer token required
// ===============================
router.get("/course/:courseId", requireAuth, async (req, res) => {
  try {
    const { courseId } = req.params;

    // (Optional) enforce student enrollment
    if (req.user.role === "STUDENT") {
      const enrolled = await prisma.enrollment.findUnique({
        where: { userId_courseId: { userId: req.user.sub, courseId } },
      });
      if (!enrolled) {
        return res.status(403).json({ message: "You must enroll to view lessons." });
      }
    }

    const lessons = await prisma.lesson.findMany({
      where: { courseId },
      select: {
        id: true,
        courseId: true,
        title: true,
        content: true,
        orderNo: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { orderNo: "asc" },
    });

    // ✅ Because lessonProgress does NOT have courseId, we compute by lessonIds
    const lessonIds = lessons.map((l) => l.id);

    let completedLessonIds = [];
    if (req.user?.sub && lessonIds.length > 0) {
      const completions = await prisma.lessonProgress.findMany({
        where: {
          userId: req.user.sub,
          lessonId: { in: lessonIds },
        },
        select: { lessonId: true },
      });

      completedLessonIds = completions.map((c) => c.lessonId);
    }

    return res.json({ lessons, completedLessonIds });
  } catch (err) {
    return res.status(500).json({ message: "Failed to load lessons", error: err.message });
  }
});

// ===============================
// POST /api/lessons/:courseId
// Instructor: create lesson
// Protected: Instructor only
// ===============================
router.post("/:courseId", requireAuth, async (req, res) => {
  try {
    if (req.user.role !== "INSTRUCTOR") {
      return res.status(403).json({ message: "Instructor only" });
    }

    const { courseId } = req.params;
    const { title, content, orderNo } = req.body;

    if (!title || !content || orderNo == null) {
      return res.status(400).json({ message: "title, content, orderNo required" });
    }

    // prevent duplicate orderNo for same course
    const exists = await prisma.lesson.findFirst({
      where: { courseId, orderNo: Number(orderNo) },
    });
    if (exists) {
      return res.status(409).json({
        message: "orderNo already used for this course",
        hint: "Use a different orderNo (e.g. 2,3,4...)",
      });
    }

    const lesson = await prisma.lesson.create({
      data: {
        courseId,
        title,
        content,
        orderNo: Number(orderNo),
      },
    });

    return res.status(201).json(lesson);
  } catch (err) {
    return res.status(500).json({ message: "Failed to create lesson", error: err.message });
  }
});

// ===============================
// POST /api/lessons/:lessonId/complete
// Student: mark lesson complete + update course progress
// Protected: Student only
// ===============================
router.post("/:lessonId/complete", requireAuth, async (req, res) => {
  try {
    if (req.user.role !== "STUDENT") {
      return res.status(403).json({ message: "Only students can complete lessons" });
    }

    const { lessonId } = req.params;

    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      select: { id: true, courseId: true },
    });
    if (!lesson) return res.status(404).json({ message: "Lesson not found" });

    // must be enrolled
    const enrolled = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: req.user.sub, courseId: lesson.courseId } },
    });
    if (!enrolled) return res.status(403).json({ message: "You must enroll first" });

    // ✅ IMPORTANT FIX: DO NOT include courseId here
    await prisma.lessonProgress.upsert({
      where: { userId_lessonId: { userId: req.user.sub, lessonId } },
      update: {},
      create: {
        userId: req.user.sub,
        lessonId,
      },
    });

    // ✅ compute progress without courseId column in lessonProgress
    const allLessons = await prisma.lesson.findMany({
      where: { courseId: lesson.courseId },
      select: { id: true },
    });
    const lessonIds = allLessons.map((l) => l.id);

    const totalLessons = lessonIds.length;

    const completed = await prisma.lessonProgress.count({
      where: {
        userId: req.user.sub,
        lessonId: { in: lessonIds },
      },
    });

    const progress = totalLessons === 0 ? 0 : Math.round((completed / totalLessons) * 100);

    // write progress into enrollment table
    await prisma.enrollment.update({
      where: { userId_courseId: { userId: req.user.sub, courseId: lesson.courseId } },
      data: { progress },
    });

    return res.json({
      message: "Lesson completed",
      lessonId,
      progress,
      completed,
      totalLessons,
    });
  } catch (err) {
    return res.status(500).json({ message: "Failed to complete lesson", error: err.message });
  }
});

module.exports = router;
