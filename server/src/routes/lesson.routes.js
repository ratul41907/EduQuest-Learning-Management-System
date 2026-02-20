// Path: E:\EduQuest\server\src\routes\lesson.routes.js

const router = require("express").Router();
const prisma = require("../prisma");
const { requireAuth } = require("../middleware/auth");
const { validate } = require("../middleware/validate");
const { sendCertificateEmail, sendBadgeEmail } = require("../utils/email"); // NEW Day 11

function calcLevel(totalPoints) {
  return Math.floor((Number(totalPoints) || 0) / 100) + 1;
}

// =========================================
// GET /api/lessons/course/:courseId
// =========================================
router.get("/course/:courseId", requireAuth, async (req, res) => {
  try {
    const { courseId } = req.params;

    if (req.user.role === "STUDENT") {
      const enrolled = await prisma.enrollment.findUnique({
        where: { userId_courseId: { userId: req.user.sub, courseId } },
      });
      if (!enrolled) return res.status(403).json({ message: "You must enroll to view lessons." });
    }

    const lessons = await prisma.lesson.findMany({
      where: { courseId },
      select: { id: true, courseId: true, title: true, content: true, orderNo: true, points: true, createdAt: true, updatedAt: true },
      orderBy: { orderNo: "asc" },
    });

    let completedLessonIds = [];
    if (req.user?.sub) {
      const completions = await prisma.lessonProgress.findMany({ where: { userId: req.user.sub }, select: { lessonId: true } });
      const lessonIdsInCourse = new Set(lessons.map((l) => l.id));
      completedLessonIds = completions.map((c) => c.lessonId).filter((id) => lessonIdsInCourse.has(id));
    }

    return res.json({ lessons, completedLessonIds });
  } catch (err) {
    return res.status(500).json({ message: "Failed to load lessons", error: err.message });
  }
});

// =========================================
// POST /api/lessons/:courseId
// =========================================
router.post(
  "/:courseId",
  requireAuth,
  validate({ title: "required|min:3|max:200", content: "required|min:10" }),
  async (req, res) => {
    try {
      if (req.user.role !== "INSTRUCTOR") return res.status(403).json({ message: "Instructor only" });

      const { courseId } = req.params;
      const { title, content, orderNo, points } = req.body;

      if (orderNo == null) return res.status(400).json({ message: "orderNo is required" });

      const exists = await prisma.lesson.findFirst({ where: { courseId, orderNo: Number(orderNo) } });
      if (exists) return res.status(409).json({ message: "orderNo already used for this course", hint: "Use a different orderNo (e.g. 2, 3, 4...)" });

      const lesson = await prisma.lesson.create({
        data: { courseId, title, content, orderNo: Number(orderNo), points: points != null ? Number(points) : 10 },
      });

      return res.status(201).json(lesson);
    } catch (err) {
      return res.status(500).json({ message: "Failed to create lesson", error: err.message });
    }
  }
);

// =========================================
// POST /api/lessons/:lessonId/complete
// =========================================
router.post("/:lessonId/complete", requireAuth, async (req, res) => {
  try {
    if (req.user.role !== "STUDENT") return res.status(403).json({ message: "Only students can complete lessons" });

    const { lessonId } = req.params;
    const userId = req.user.sub;

    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      select: { id: true, courseId: true, points: true },
    });
    if (!lesson) return res.status(404).json({ message: "Lesson not found" });

    const enrolled = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId: lesson.courseId } },
    });
    if (!enrolled) return res.status(403).json({ message: "You must enroll first" });

    // Prevent double completion
    let newlyCompleted = false;
    try {
      await prisma.lessonProgress.create({ data: { userId, lessonId: lesson.id } });
      newlyCompleted = true;
    } catch (e) {
      newlyCompleted = false;
    }

    // Recalculate progress
    const totalLessons = await prisma.lesson.count({ where: { courseId: lesson.courseId } });
    const completedInCourse = await prisma.lessonProgress.count({
      where: { userId, lesson: { courseId: lesson.courseId } },
    });
    const progress = totalLessons === 0 ? 0 : Math.round((completedInCourse / totalLessons) * 100);

    await prisma.enrollment.update({
      where: { userId_courseId: { userId, courseId: lesson.courseId } },
      data: { progress },
    });

    // Course completion: notification + certificate + email
    if (progress === 100) {
      const existing = await prisma.notification.findFirst({
        where: { userId, courseId: lesson.courseId, type: "COURSE_COMPLETED" },
        select: { id: true },
      });
      if (!existing) {
        await prisma.notification.create({
          data: {
            userId,
            courseId: lesson.courseId,
            type: "COURSE_COMPLETED",
            title: "Course Completed! 🎉",
            message: "Congrats! You finished the course. Your certificate is ready.",
            isRead: false,
          },
        });
      }

      const existingCert = await prisma.certificate.findFirst({
        where: { userId, courseId: lesson.courseId },
        select: { id: true },
      });

      if (!existingCert) {
        const newCert = await prisma.certificate.create({
          data: {
            userId,
            courseId: lesson.courseId,
            code: `CERT-${userId.slice(-6).toUpperCase()}-${Date.now()}`,
          },
        });

        // Day 11: certificate email (non-blocking)
        const [certUser, certCourse] = await Promise.all([
          prisma.user.findUnique({ where: { id: userId }, select: { fullName: true, email: true } }),
          prisma.course.findUnique({ where: { id: lesson.courseId }, select: { title: true } }),
        ]);
        if (certUser && certCourse) {
          sendCertificateEmail({
            fullName: certUser.fullName,
            email: certUser.email,
            courseTitle: certCourse.title,
            certCode: newCert.code,
          });
        }
      }
    }

    // Already completed — no points again
    if (!newlyCompleted) {
      return res.json({ message: "Lesson already completed", lessonId, progress, completed: completedInCourse, totalLessons, pointsAwarded: 0 });
    }

    // Award points
    const pointsAwarded = Number(lesson.points || 10);
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { totalPoints: { increment: pointsAwarded } },
      select: { id: true, fullName: true, totalPoints: true, level: true, email: true },
    });

    const newLevel = calcLevel(updatedUser.totalPoints);
    let finalUser = updatedUser;
    if (updatedUser.level !== newLevel) {
      finalUser = await prisma.user.update({
        where: { id: userId },
        data: { level: newLevel },
        select: { id: true, fullName: true, totalPoints: true, level: true, email: true },
      });
    }

    // Badge: FIRST_LESSON
    let badgeAwarded = null;
    const totalCompletions = await prisma.lessonProgress.count({ where: { userId } });

    if (totalCompletions === 1) {
      const badge = await prisma.badge.findUnique({ where: { code: "FIRST_LESSON" } });
      if (badge) {
        await prisma.userBadge.create({ data: { userId, badgeId: badge.id } }).catch(() => {});
        badgeAwarded = "FIRST_LESSON";

        await prisma.notification.create({
          data: { userId, type: "BADGE_EARNED", title: "Badge Earned: First Step!", message: "You completed your first lesson. Keep going!" },
        }).catch(() => {});

        // Day 11: badge email (non-blocking)
        sendBadgeEmail({ fullName: finalUser.fullName, email: finalUser.email, badgeName: "First Step", pointsBonus: 20 });
      }
    }

    // Badge: COURSE_FINISHER
    if (progress === 100) {
      const badge = await prisma.badge.findUnique({ where: { code: "COURSE_FINISHER" } });
      if (badge) {
        await prisma.userBadge.create({ data: { userId, badgeId: badge.id } }).catch(() => {});
        badgeAwarded = badgeAwarded ? `${badgeAwarded},COURSE_FINISHER` : "COURSE_FINISHER";

        // Day 11: badge email (non-blocking)
        sendBadgeEmail({ fullName: finalUser.fullName, email: finalUser.email, badgeName: "Course Finisher", pointsBonus: 50 });
      }
    }

    // Strip email from returned user object
    const { email: _email, ...userProgress } = finalUser;

    return res.json({ message: "Lesson completed! ✅", lessonId, progress, completed: completedInCourse, totalLessons, pointsAwarded, userProgress, badgeAwarded });
  } catch (err) {
    return res.status(500).json({ message: "Failed to complete lesson", error: err.message });
  }
});

// =========================================
// PATCH /api/lessons/:lessonId
// =========================================
router.patch("/:lessonId", requireAuth, async (req, res) => {
  const { lessonId } = req.params;

  try {
    if (req.user.role !== "INSTRUCTOR") return res.status(403).json({ message: "Instructor only" });

    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { course: { select: { instructorId: true } } },
    });
    if (!lesson) return res.status(404).json({ message: "Lesson not found" });
    if (lesson.course.instructorId !== req.user.sub) return res.status(403).json({ message: "You do not own this lesson" });

    const { title, content, points } = req.body;
    const updated = await prisma.lesson.update({
      where: { id: lessonId },
      data: {
        ...(title   && { title }),
        ...(content && { content }),
        ...(points != null && { points: Number(points) }),
      },
    });

    return res.json({ message: "Lesson updated", lesson: updated });
  } catch (err) {
    return res.status(500).json({ message: "Error updating lesson", error: err.message });
  }
});

// =========================================
// DELETE /api/lessons/:lessonId
// =========================================
router.delete("/:lessonId", requireAuth, async (req, res) => {
  const { lessonId } = req.params;

  try {
    if (req.user.role !== "INSTRUCTOR") return res.status(403).json({ message: "Instructor only" });

    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { course: { select: { instructorId: true } } },
    });
    if (!lesson) return res.status(404).json({ message: "Lesson not found" });
    if (lesson.course.instructorId !== req.user.sub) return res.status(403).json({ message: "You do not own this lesson" });

    await prisma.lessonProgress.deleteMany({ where: { lessonId } });
    await prisma.lesson.delete({ where: { id: lessonId } });

    return res.json({ message: "Lesson deleted successfully" });
  } catch (err) {
    return res.status(500).json({ message: "Error deleting lesson", error: err.message });
  }
});

module.exports = router;