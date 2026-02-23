// Path: E:\EduQuest\server\src\routes\course.routes.js

const router = require("express").Router();
const prisma = require("../prisma");
const { requireAuth } = require("../middleware/auth");
const { validate } = require("../middleware/validate");
const { uploadCourseThumbnail, handleUploadError } = require("../middleware/upload");
const { sendEnrollmentEmail, sendInstructorEnrollmentEmail } = require("../utils/email");
const { uploadLimiter } = require("../middleware/rateLimiter");

// =========================================
// GET /api/courses/my
// =========================================
router.get("/my", requireAuth, async (req, res) => {
  try {
    const userId = req.user.sub;

    const enrollments = await prisma.enrollment.findMany({
      where: { userId },
      include: {
        course: {
          include: {
            instructor: { select: { fullName: true } },
            _count: { select: { lessons: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const myCourses = enrollments.map((e) => ({
      ...e.course,
      progress: e.progress,
      enrolledAt: e.createdAt,
      totalLessons: e.course._count.lessons,
    }));

    return res.json(myCourses);
  } catch (err) {
    return res.status(500).json({ message: "Error fetching enrolled courses", error: err.message });
  }
});

// =========================================
// GET /api/courses
// =========================================
router.get("/", async (req, res) => {
  try {
    const { search, level, minPrice, maxPrice, page = 1, limit = 10 } = req.query;

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(50, parseInt(limit) || 10);
    const skip = (pageNum - 1) * limitNum;

    const where = {};

    if (search && search.trim()) {
      where.OR = [
        { title: { contains: search.trim(), mode: "insensitive" } },
        { description: { contains: search.trim(), mode: "insensitive" } },
      ];
    }

    if (level != null && level !== "") {
      const levelNum = parseInt(level);
      if (!isNaN(levelNum)) where.level = levelNum;
    }

    if (minPrice != null && minPrice !== "") {
      where.price = { ...where.price, gte: Number(minPrice) };
    }

    if (maxPrice != null && maxPrice !== "") {
      where.price = { ...where.price, lte: Number(maxPrice) };
    }

    const [total, courses] = await Promise.all([
      prisma.course.count({ where }),
      prisma.course.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: "desc" },
        include: {
          instructor: { select: { fullName: true } },
          _count: { select: { enrollments: true, lessons: true } },
        },
      }),
    ]);

    const result = courses.map((c) => ({
      ...c,
      enrollmentCount: c._count.enrollments,
      lessonCount: c._count.lessons,
    }));

    return res.json({ total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum), courses: result });
  } catch (err) {
    return res.status(500).json({ message: "Error fetching courses", error: err.message });
  }
});

// =========================================
// POST /api/courses
// =========================================
router.post(
  "/",
  requireAuth,
  validate({
    title: "required|min:3|max:200",
    description: "required|min:10|max:1000",
  }),
  async (req, res) => {
    try {
      if (req.user.role !== "INSTRUCTOR") {
        return res.status(403).json({ message: "Instructor only" });
      }

      const { title, description, price, level } = req.body || {};

      const course = await prisma.course.create({
        data: {
          title,
          description,
          price: Number(price ?? 0),
          level: Number(level ?? 1),
          instructorId: req.user.sub,
        },
      });

      return res.status(201).json(course);
    } catch (err) {
      return res.status(500).json({ message: "Error creating course", error: err.message });
    }
  }
);

// =========================================
// GET /api/courses/:id/stats
// IMPORTANT: above /:id
// =========================================
router.get("/:id/stats", async (req, res) => {
  try {
    const { id } = req.params;

    const course = await prisma.course.findUnique({
      where: { id },
      select: { id: true, title: true, instructorId: true },
    });
    if (!course) return res.status(404).json({ message: "Course not found" });

    const enrollments = await prisma.enrollment.findMany({
      where: { courseId: id },
      select: { progress: true },
    });

    const enrollmentCount = enrollments.length;
    const avgProgress = enrollmentCount === 0 ? 0
      : Math.round(enrollments.reduce((sum, e) => sum + e.progress, 0) / enrollmentCount);
    const completionCount = enrollments.filter((e) => e.progress === 100).length;
    const completionRate = enrollmentCount === 0 ? 0
      : Math.round((completionCount / enrollmentCount) * 100);

    const reviews = await prisma.review.findMany({ where: { courseId: id }, select: { rating: true } });
    const avgRating = reviews.length === 0 ? 0
      : Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) * 10) / 10;

    const lessonCount = await prisma.lesson.count({ where: { courseId: id } });
    const quizCount = await prisma.quiz.count({ where: { courseId: id } });

    return res.json({ courseId: id, title: course.title, lessonCount, quizCount, enrollmentCount, completionCount, completionRate, avgProgress, avgRating, reviewCount: reviews.length });
  } catch (err) {
    return res.status(500).json({ message: "Error fetching course stats", error: err.message });
  }
});

// =========================================
// GET /api/courses/:id/leaderboard
// IMPORTANT: above /:id
// =========================================
router.get("/:id/leaderboard", async (req, res) => {
  try {
    const { id: courseId } = req.params;

    const course = await prisma.course.findUnique({ where: { id: courseId }, select: { id: true, title: true } });
    if (!course) return res.status(404).json({ message: "Course not found" });

    const enrollments = await prisma.enrollment.findMany({
      where: { courseId },
      select: { userId: true, progress: true, user: { select: { id: true, fullName: true, totalPoints: true, level: true } } },
    });

    if (enrollments.length === 0) return res.json({ courseId, title: course.title, leaderboard: [] });

    const userIds = enrollments.map((e) => e.userId);

    const lessonCompletions = await prisma.lessonProgress.findMany({
      where: { userId: { in: userIds }, lesson: { courseId } },
      select: { userId: true },
    });
    const completionMap = {};
    lessonCompletions.forEach((lp) => { completionMap[lp.userId] = (completionMap[lp.userId] || 0) + 1; });

    const quizAttempts = await prisma.quizAttempt.findMany({
      where: { userId: { in: userIds }, quiz: { courseId } },
      select: { userId: true, earnedPoints: true },
    });
    const quizPointsMap = {};
    quizAttempts.forEach((a) => { quizPointsMap[a.userId] = (quizPointsMap[a.userId] || 0) + a.earnedPoints; });

    const rows = enrollments.map((e) => ({
      userId: e.userId, fullName: e.user.fullName, level: e.user.level, progress: e.progress,
      lessonsCompleted: completionMap[e.userId] || 0,
      quizPoints: quizPointsMap[e.userId] || 0,
      score: Math.round(e.progress * 0.6) + Math.min(Math.round((quizPointsMap[e.userId] || 0) * 0.4), 40),
    }));

    rows.sort((a, b) => b.score !== a.score ? b.score - a.score : b.lessonsCompleted - a.lessonsCompleted);
    const leaderboard = rows.slice(0, 10).map((r, idx) => ({ rank: idx + 1, ...r }));

    return res.json({ courseId, title: course.title, leaderboard });
  } catch (err) {
    return res.status(500).json({ message: "Error fetching course leaderboard", error: err.message });
  }
});

// =========================================
// GET /api/courses/:id/quizzes
// IMPORTANT: above /:id
// =========================================
router.get("/:id/quizzes", async (req, res) => {
  try {
    const { id: courseId } = req.params;

    const course = await prisma.course.findUnique({ where: { id: courseId }, select: { id: true, title: true } });
    if (!course) return res.status(404).json({ message: "Course not found" });

    const quizzes = await prisma.quiz.findMany({
      where: { courseId },
      select: { id: true, title: true, timeLimit: true, passScore: true, createdAt: true, _count: { select: { questions: true, attempts: true } } },
      orderBy: { createdAt: "asc" },
    });

    return res.json({
      courseId, title: course.title, quizCount: quizzes.length,
      quizzes: quizzes.map((q) => ({ id: q.id, title: q.title, timeLimit: q.timeLimit, passScore: q.passScore, questionCount: q._count.questions, attemptCount: q._count.attempts, createdAt: q.createdAt })),
    });
  } catch (err) {
    return res.status(500).json({ message: "Error fetching course quizzes", error: err.message });
  }
});

// =========================================
// GET /api/courses/:id/progress
// IMPORTANT: above /:id
// =========================================
router.get("/:id/progress", requireAuth, async (req, res) => {
  try {
    const { id: courseId } = req.params;
    const userId = req.user.sub;

    const course = await prisma.course.findUnique({ where: { id: courseId }, select: { id: true, title: true } });
    if (!course) return res.status(404).json({ message: "Course not found" });

    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
      select: { progress: true, createdAt: true },
    });
    if (!enrollment) return res.status(403).json({ message: "You are not enrolled in this course" });

    const totalLessons = await prisma.lesson.count({ where: { courseId } });
    const completedLessons = await prisma.lessonProgress.count({ where: { userId, lesson: { courseId } } });

    const completedLessonDetails = await prisma.lessonProgress.findMany({
      where: { userId, lesson: { courseId } },
      select: { completedAt: true, lesson: { select: { id: true, title: true, orderNo: true, points: true } } },
      orderBy: { completedAt: "asc" },
    });

    const quizAttempts = await prisma.quizAttempt.findMany({
      where: { userId, quiz: { courseId } },
      select: { id: true, score: true, percent: true, passed: true, earnedPoints: true, createdAt: true, quiz: { select: { id: true, title: true, passScore: true } } },
      orderBy: { createdAt: "desc" },
    });

    const certificate = await prisma.certificate.findFirst({
      where: { userId, courseId },
      select: { code: true, issuedAt: true },
    });

    return res.json({
      courseId, title: course.title, enrolledAt: enrollment.createdAt,
      progress: enrollment.progress, isCompleted: enrollment.progress === 100,
      lessons: { total: totalLessons, completed: completedLessons, remaining: totalLessons - completedLessons, details: completedLessonDetails.map((lp) => ({ ...lp.lesson, completedAt: lp.completedAt })) },
      quizzes: { totalAttempts: quizAttempts.length, passed: quizAttempts.filter((a) => a.passed).length, totalPointsEarned: quizAttempts.reduce((sum, a) => sum + a.earnedPoints, 0), attempts: quizAttempts },
      certificate: certificate ? { code: certificate.code, issuedAt: certificate.issuedAt, verifyUrl: `/api/certificates/verify/${certificate.code}` } : null,
    });
  } catch (err) {
    return res.status(500).json({ message: "Error fetching course progress", error: err.message });
  }
});

// =========================================
// POST /api/courses/:id/upload-thumbnail
// Day 15: Upload course thumbnail (instructor only)
// Day 17: Added upload rate limiting
// IMPORTANT: above /:id
// =========================================
router.post("/:id/upload-thumbnail", requireAuth, uploadLimiter, (req, res, next) => {
  uploadCourseThumbnail(req, res, (err) => {
    if (err) return handleUploadError(err, req, res, next);
    next();
  });
}, async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const course = await prisma.course.findUnique({ where: { id } });
    if (!course) return res.status(404).json({ message: "Course not found" });

    if (course.instructorId !== req.user.sub && req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (course.thumbnail) {
      const fs = require("fs");
      const path = require("path");
      const oldPath = path.join(__dirname, "../../", course.thumbnail);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    const filePath = `/uploads/courses/${req.file.filename}`;

    const updated = await prisma.course.update({
      where: { id },
      data: { thumbnail: filePath },
      select: {
        id: true,
        title: true,
        thumbnail: true,
      },
    });

    return res.json({
      message: "Thumbnail uploaded successfully",
      thumbnail: filePath,
      course: updated,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Error uploading thumbnail",
      error: err.message,
    });
  }
});

// =========================================
// GET /api/courses/:id
// =========================================
router.get("/:id", async (req, res) => {
  try {
    const course = await prisma.course.findUnique({
      where: { id: req.params.id },
      include: {
        instructor: { select: { fullName: true, email: true } },
        quizzes: { select: { id: true, title: true } },
        _count: { select: { lessons: true, enrollments: true } },
      },
    });

    if (!course) return res.status(404).json({ message: "Course not found" });
    return res.json({ ...course, lessonCount: course._count.lessons, enrollmentCount: course._count.enrollments });
  } catch (err) {
    return res.status(500).json({ message: "Error fetching course", error: err.message });
  }
});

// =========================================
// POST /api/courses/:id/enroll
// Day 16: Added enrollment emails
// =========================================
router.post("/:id/enroll", requireAuth, async (req, res) => {
  const { id: courseId } = req.params;

  try {
    if (req.user.role !== "STUDENT") {
      return res.status(403).json({ message: "Only students can enroll" });
    }

    const userId = req.user.sub;

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: { instructor: { select: { fullName: true, email: true } } },
    });
    if (!course) return res.status(404).json({ message: "Course not found" });

    const existing = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });
    if (existing) return res.status(409).json({ message: "Already enrolled in this course" });

    const enrollment = await prisma.enrollment.create({
      data: { userId, courseId, progress: 0 },
    });

    await prisma.notification.create({
      data: {
        userId: course.instructorId,
        courseId: course.id,
        type: "NEW_ENROLLMENT",
        title: "New Student Enrolled!",
        message: `A student has joined your course: ${course.title}`,
      },
    }).catch(() => {});

    const student = await prisma.user.findUnique({
      where: { id: userId },
      select: { fullName: true, email: true },
    });

    if (student) {
      sendEnrollmentEmail(student.email, student.fullName, course.title).catch(err =>
        console.error("Student enrollment email failed:", err)
      );

      sendInstructorEnrollmentEmail(
        course.instructor.email,
        course.instructor.fullName,
        student.fullName,
        course.title
      ).catch(err =>
        console.error("Instructor enrollment email failed:", err)
      );
    }

    return res.status(201).json(enrollment);
  } catch (err) {
    return res.status(500).json({ message: "Enrollment error", error: err.message });
  }
});

// =========================================
// PATCH /api/courses/:id
// =========================================
router.patch("/:id", requireAuth, async (req, res) => {
  const { id } = req.params;

  try {
    if (req.user.role !== "INSTRUCTOR") {
      return res.status(403).json({ message: "Instructor only" });
    }

    const course = await prisma.course.findUnique({ where: { id } });
    if (!course) return res.status(404).json({ message: "Course not found" });

    if (course.instructorId !== req.user.sub) {
      return res.status(403).json({ message: "You do not own this course" });
    }

    const { title, description, price, level } = req.body || {};

    const updated = await prisma.course.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(price != null && { price: Number(price) }),
        ...(level != null && { level: Number(level) }),
      },
    });

    return res.json({ message: "Course updated", course: updated });
  } catch (err) {
    return res.status(500).json({ message: "Error updating course", error: err.message });
  }
});

// =========================================
// DELETE /api/courses/:id
// =========================================
router.delete("/:id", requireAuth, async (req, res) => {
  const { id } = req.params;

  try {
    if (req.user.role !== "INSTRUCTOR" && req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Instructor or Admin only" });
    }

    const course = await prisma.course.findUnique({ where: { id } });
    if (!course) return res.status(404).json({ message: "Course not found" });

    if (req.user.role === "INSTRUCTOR" && course.instructorId !== req.user.sub) {
      return res.status(403).json({ message: "You do not own this course" });
    }

    if (course.thumbnail) {
      const fs = require("fs");
      const path = require("path");
      const thumbnailPath = path.join(__dirname, "../../", course.thumbnail);
      if (fs.existsSync(thumbnailPath)) {
        fs.unlinkSync(thumbnailPath);
      }
    }

    await prisma.lessonProgress.deleteMany({ where: { lesson: { courseId: id } } });
    await prisma.lesson.deleteMany({ where: { courseId: id } });
    await prisma.quizAttempt.deleteMany({ where: { quiz: { courseId: id } } });
    await prisma.question.deleteMany({ where: { quiz: { courseId: id } } });
    await prisma.quiz.deleteMany({ where: { courseId: id } });
    await prisma.enrollment.deleteMany({ where: { courseId: id } });
    await prisma.review.deleteMany({ where: { courseId: id } });
    await prisma.certificate.deleteMany({ where: { courseId: id } });
    await prisma.notification.deleteMany({ where: { courseId: id } });
    await prisma.course.delete({ where: { id } });

    return res.json({ message: "Course deleted successfully" });
  } catch (err) {
    return res.status(500).json({ message: "Error deleting course", error: err.message });
  }
});

// =========================================
// PATCH /api/courses/:id/progress
// =========================================
router.patch("/:id/progress", requireAuth, async (req, res) => {
  const { id: courseId } = req.params;

  try {
    if (req.user.role !== "STUDENT") {
      return res.status(403).json({ message: "Only students can update progress" });
    }

    const progress = Number(req.body.progress);
    if (Number.isNaN(progress) || progress < 0 || progress > 100) {
      return res.status(400).json({ message: "Invalid progress value (0–100)" });
    }

    const updated = await prisma.enrollment.update({
      where: { userId_courseId: { userId: req.user.sub, courseId } },
      data: { progress },
    });

    return res.json({ message: "Progress saved!", progress: updated.progress });
  } catch (err) {
    return res.status(500).json({ message: "Failed to update progress", error: err.message });
  }
});

module.exports = router;