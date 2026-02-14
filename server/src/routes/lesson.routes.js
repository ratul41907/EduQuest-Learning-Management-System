const router = require("express").Router();
const prisma = require("../prisma");
const { requireAuth } = require("../middleware/auth");

// Level rule: every 100 totalPoints => next level (Level 1 starts at 0)
function calcLevel(totalPoints) {
  return Math.floor((Number(totalPoints) || 0) / 100) + 1;
}

// ===================================================
// GET /api/lessons/course/:courseId
// Student: view lessons for a course (must be enrolled)
// Returns: { lessons: [], completedLessonIds: [] }
// ===================================================
router.get("/course/:courseId", requireAuth, async (req, res) => {
  try {
    const { courseId } = req.params;

    // Student must be enrolled
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
        points: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { orderNo: "asc" },
    });

    let completedLessonIds = [];
    if (req.user?.sub) {
      const completions = await prisma.lessonProgress.findMany({
        where: { userId: req.user.sub },
        select: { lessonId: true },
      });

      completedLessonIds = completions.map((c) => c.lessonId);

      const lessonIdsInCourse = new Set(lessons.map((l) => l.id));
      completedLessonIds = completedLessonIds.filter((id) => lessonIdsInCourse.has(id));
    }

    return res.json({ lessons, completedLessonIds });
  } catch (err) {
    return res.status(500).json({ message: "Failed to load lessons", error: err.message });
  }
});

// ===================================================
// POST /api/lessons/:courseId
// Instructor: create lesson (orderNo unique per course)
// ===================================================
router.post("/:courseId", requireAuth, async (req, res) => {
  try {
    if (req.user.role !== "INSTRUCTOR") {
      return res.status(403).json({ message: "Instructor only" });
    }

    const { courseId } = req.params;
    const { title, content, orderNo, points } = req.body;

    if (!title || !content || orderNo == null) {
      return res.status(400).json({ message: "title, content, orderNo required" });
    }

    const exists = await prisma.lesson.findFirst({
      where: { courseId, orderNo: Number(orderNo) },
    });

    if (exists) {
      return res.status(409).json({
        message: "orderNo already used for this course",
        hint: "Use a different orderNo (e.g. 2, 3, 4...)",
      });
    }

    const lesson = await prisma.lesson.create({
      data: {
        courseId,
        title,
        content,
        orderNo: Number(orderNo),
        points: points != null ? Number(points) : 10,
      },
    });

    return res.status(201).json(lesson);
  } catch (err) {
    return res.status(500).json({ message: "Failed to create lesson", error: err.message });
  }
});

// ===================================================
// POST /api/lessons/:lessonId/complete
// Student: complete lesson, award points, badges, progress
// + Notification when course completed (progress===100)
// ===================================================
router.post("/:lessonId/complete", requireAuth, async (req, res) => {
  try {
    if (req.user.role !== "STUDENT") {
      return res.status(403).json({ message: "Only students can complete lessons" });
    }

    const { lessonId } = req.params;

    // 1) Find lesson & course
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      select: { id: true, courseId: true, points: true },
    });
    if (!lesson) return res.status(404).json({ message: "Lesson not found" });

    // 2) Must be enrolled
    const enrolled = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: req.user.sub, courseId: lesson.courseId } },
    });
    if (!enrolled) return res.status(403).json({ message: "You must enroll first" });

    // 3) Create completion (NO double completion)
    let newlyCompleted = false;
    try {
      await prisma.lessonProgress.create({
        data: {
          userId: req.user.sub,
          lessonId: lesson.id,
        },
      });
      newlyCompleted = true;
    } catch (e) {
      newlyCompleted = false;
    }

    // 4) Compute course progress (only THIS course)
    const totalLessons = await prisma.lesson.count({
      where: { courseId: lesson.courseId },
    });

    const completedInCourse = await prisma.lessonProgress.count({
      where: {
        userId: req.user.sub,
        lesson: { courseId: lesson.courseId },
      },
    });

    const progress = totalLessons === 0 ? 0 : Math.round((completedInCourse / totalLessons) * 100);

    await prisma.enrollment.update({
      where: { userId_courseId: { userId: req.user.sub, courseId: lesson.courseId } },
      data: { progress },
    });

    // ✅ Ensure COURSE_COMPLETED notification exists whenever progress===100
    if (progress === 100) {
      const existing = await prisma.notification.findFirst({
        where: {
          userId: req.user.sub,
          courseId: lesson.courseId,
          type: "COURSE_COMPLETED",
        },
        select: { id: true },
      });

      if (!existing) {
        await prisma.notification.create({
          data: {
            userId: req.user.sub,
            courseId: lesson.courseId,
            type: "COURSE_COMPLETED",
            title: "Course Completed",
            message: "Congrats! You finished the course.",
            isRead: false,
          },
        });
      }
    }

    // 5) If already completed, return without awarding points again
    if (!newlyCompleted) {
      return res.json({
        message: "Lesson already completed",
        lessonId,
        progress,
        completed: completedInCourse,
        totalLessons,
        pointsAwarded: 0,
      });
    }

    // 6) Award points to user
    const pointsAwarded = Number(lesson.points || 10);

    const updatedUser = await prisma.user.update({
      where: { id: req.user.sub },
      data: { totalPoints: { increment: pointsAwarded } },
      select: { id: true, fullName: true, totalPoints: true, level: true },
    });

    // 7) Update level if needed
    const newLevel = calcLevel(updatedUser.totalPoints);
    let finalUser = updatedUser;
    if (updatedUser.level !== newLevel) {
      finalUser = await prisma.user.update({
        where: { id: req.user.sub },
        data: { level: newLevel },
        select: { id: true, fullName: true, totalPoints: true, level: true },
      });
    }

    // 8) Badge awarding
    let badgeAwarded = null;

    // FIRST_LESSON badge (first ever completion)
    const totalCompletions = await prisma.lessonProgress.count({
      where: { userId: req.user.sub },
    });

    if (totalCompletions === 1) {
      const badge = await prisma.badge.findUnique({ where: { code: "FIRST_LESSON" } });
      if (badge) {
        await prisma.userBadge
          .create({ data: { userId: req.user.sub, badgeId: badge.id } })
          .catch(() => {});
        badgeAwarded = "FIRST_LESSON";
      }
    }

    // COURSE_FINISHER badge (progress hits 100)
    if (progress === 100) {
      const badge = await prisma.badge.findUnique({ where: { code: "COURSE_FINISHER" } });
      if (badge) {
        await prisma.userBadge
          .create({ data: { userId: req.user.sub, badgeId: badge.id } })
          .catch(() => {});
        badgeAwarded = badgeAwarded ? `${badgeAwarded},COURSE_FINISHER` : "COURSE_FINISHER";
      }
    }

    return res.json({
      message: "Lesson completed",
      lessonId,
      progress,
      completed: completedInCourse,
      totalLessons,
      pointsAwarded,
      userProgress: finalUser,
      badgeAwarded,
    });
  } catch (err) {
    return res.status(500).json({ message: "Failed to complete lesson", error: err.message });
  }
});

module.exports = router;
