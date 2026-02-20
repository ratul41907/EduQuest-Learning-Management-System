// Path: E:\EduQuest\server\src\routes\instructor.routes.js

const router = require("express").Router();
const prisma = require("../prisma");
const { requireAuth } = require("../middleware/auth");

// Guard: all routes require INSTRUCTOR role
function requireInstructor(req, res, next) {
  if (!req.user || req.user.role !== "INSTRUCTOR") {
    return res.status(403).json({ message: "Instructor access required" });
  }
  next();
}

// =========================================
// GET /api/instructor/dashboard
// =========================================
router.get("/dashboard", requireAuth, requireInstructor, async (req, res) => {
  try {
    const instructorId = req.user.sub;

    const courses = await prisma.course.findMany({
      where: { instructorId },
      select: {
        id: true,
        title: true,
        level: true,
        price: true,
        createdAt: true,
        _count: {
          select: { enrollments: true, lessons: true, reviews: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const totalStudents = courses.reduce((sum, c) => sum + c._count.enrollments, 0);
    const totalLessons  = courses.reduce((sum, c) => sum + c._count.lessons, 0);
    const courseIds     = courses.map((c) => c.id);

    const allReviews = await prisma.review.findMany({
      where: { courseId: { in: courseIds } },
      select: { rating: true },
    });

    const avgRating =
      allReviews.length === 0
        ? 0
        : Math.round(
            (allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length) * 10
          ) / 10;

    const recentEnrollments = await prisma.enrollment.findMany({
      where: { courseId: { in: courseIds } },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        createdAt: true,
        progress: true,
        user: { select: { id: true, fullName: true, email: true } },
        course: { select: { id: true, title: true } },
      },
    });

    const unreadCount = await prisma.notification.count({
      where: { userId: instructorId, isRead: false },
    });

    const quizAttempts = await prisma.quizAttempt.count({
      where: { quiz: { courseId: { in: courseIds } } },
    });

    return res.json({
      profile: { id: req.user.sub, role: "INSTRUCTOR" },
      stats: {
        totalCourses: courses.length,
        totalStudents,
        totalLessons,
        totalReviews: allReviews.length,
        avgRating,
        quizAttempts,
        unreadNotifications: unreadCount,
      },
      courses: courses.map((c) => ({
        id: c.id,
        title: c.title,
        level: c.level,
        price: c.price,
        enrollments: c._count.enrollments,
        lessons: c._count.lessons,
        reviews: c._count.reviews,
        createdAt: c.createdAt,
      })),
      recentEnrollments,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Error fetching instructor dashboard",
      error: err.message,
    });
  }
});

// =========================================
// GET /api/instructor/courses/:id/students
// =========================================
router.get("/courses/:id/students", requireAuth, requireInstructor, async (req, res) => {
  try {
    const { id: courseId } = req.params;
    const instructorId = req.user.sub;

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true, title: true, instructorId: true },
    });

    if (!course) return res.status(404).json({ message: "Course not found" });
    if (course.instructorId !== instructorId) {
      return res.status(403).json({ message: "You do not own this course" });
    }

    const enrollments = await prisma.enrollment.findMany({
      where: { courseId },
      select: {
        progress: true,
        createdAt: true,
        user: {
          select: {
            id: true, fullName: true, email: true,
            level: true, totalPoints: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const studentIds = enrollments.map((e) => e.user.id);

    const lessonCompletions = await prisma.lessonProgress.findMany({
      where: { userId: { in: studentIds }, lesson: { courseId } },
      select: { userId: true },
    });

    const completionMap = {};
    lessonCompletions.forEach((lp) => {
      completionMap[lp.userId] = (completionMap[lp.userId] || 0) + 1;
    });

    const totalLessons = await prisma.lesson.count({ where: { courseId } });

    const quizAttempts = await prisma.quizAttempt.findMany({
      where: { userId: { in: studentIds }, quiz: { courseId } },
      select: { userId: true, percent: true, passed: true },
    });

    const quizMap = {};
    quizAttempts.forEach((a) => {
      if (!quizMap[a.userId]) quizMap[a.userId] = { attempts: 0, passed: 0 };
      quizMap[a.userId].attempts += 1;
      if (a.passed) quizMap[a.userId].passed += 1;
    });

    const students = enrollments.map((e) => ({
      id: e.user.id,
      fullName: e.user.fullName,
      email: e.user.email,
      level: e.user.level,
      totalPoints: e.user.totalPoints,
      progress: e.progress,
      lessonsCompleted: completionMap[e.user.id] || 0,
      totalLessons,
      isCompleted: e.progress === 100,
      quizAttempts: quizMap[e.user.id]?.attempts || 0,
      quizzesPassed: quizMap[e.user.id]?.passed || 0,
      enrolledAt: e.createdAt,
    }));

    return res.json({
      courseId,
      title: course.title,
      totalStudents: students.length,
      students,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Error fetching course students",
      error: err.message,
    });
  }
});

// =========================================
// GET /api/instructor/courses/:id/reviews
// Day 8: Instructor sees all reviews for their course
// =========================================
router.get("/courses/:id/reviews", requireAuth, requireInstructor, async (req, res) => {
  try {
    const { id: courseId } = req.params;
    const instructorId = req.user.sub;

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true, title: true, instructorId: true },
    });

    if (!course) return res.status(404).json({ message: "Course not found" });
    if (course.instructorId !== instructorId) {
      return res.status(403).json({ message: "You do not own this course" });
    }

    const reviews = await prisma.review.findMany({
      where: { courseId },
      select: {
        id: true,
        rating: true,
        comment: true,
        createdAt: true,
        user: { select: { id: true, fullName: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const avgRating =
      reviews.length === 0
        ? 0
        : Math.round(
            (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) * 10
          ) / 10;

    const breakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach((r) => {
      breakdown[r.rating] = (breakdown[r.rating] || 0) + 1;
    });

    return res.json({
      courseId,
      title: course.title,
      avgRating,
      totalReviews: reviews.length,
      breakdown,
      reviews,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Error fetching course reviews",
      error: err.message,
    });
  }
});

// =========================================
// GET /api/instructor/notifications
// =========================================
router.get("/notifications", requireAuth, requireInstructor, async (req, res) => {
  try {
    const userId = req.user.sub;

    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    const unreadCount = await prisma.notification.count({
      where: { userId, isRead: false },
    });

    return res.json({ unreadCount, notifications });
  } catch (err) {
    return res.status(500).json({
      message: "Failed to load notifications",
      error: err.message,
    });
  }
});

// =========================================
// PATCH /api/instructor/courses/:id
// NEW Day 9: Instructor updates their own course
// =========================================
router.patch("/courses/:id", requireAuth, requireInstructor, async (req, res) => {
  try {
    const { id } = req.params;
    const instructorId = req.user.sub;

    const course = await prisma.course.findUnique({ where: { id } });
    if (!course) return res.status(404).json({ message: "Course not found" });

    if (course.instructorId !== instructorId) {
      return res.status(403).json({ message: "You do not own this course" });
    }

    const { title, description, price, level } = req.body || {};

    const updated = await prisma.course.update({
      where: { id },
      data: {
        ...(title       && { title }),
        ...(description && { description }),
        ...(price  != null && { price: Number(price) }),
        ...(level  != null && { level: Number(level) }),
      },
    });

    return res.json({ message: "Course updated", course: updated });
  } catch (err) {
    return res.status(500).json({
      message: "Error updating course",
      error: err.message,
    });
  }
});

// =========================================
// GET /api/instructor/stats
// NEW Day 9: Platform-wide stats for instructor
// =========================================
router.get("/stats", requireAuth, requireInstructor, async (req, res) => {
  try {
    const instructorId = req.user.sub;

    const courses = await prisma.course.findMany({
      where: { instructorId },
      select: {
        id: true,
        _count: {
          select: { enrollments: true, lessons: true, reviews: true },
        },
      },
    });

    const courseIds     = courses.map((c) => c.id);
    const totalCourses  = courses.length;
    const totalStudents = courses.reduce((sum, c) => sum + c._count.enrollments, 0);
    const totalLessons  = courses.reduce((sum, c) => sum + c._count.lessons, 0);
    const totalReviews  = courses.reduce((sum, c) => sum + c._count.reviews, 0);

    const allReviews = await prisma.review.findMany({
      where: { courseId: { in: courseIds } },
      select: { rating: true },
    });

    const avgRating =
      allReviews.length === 0
        ? 0
        : Math.round(
            (allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length) * 10
          ) / 10;

    const completedCount = await prisma.enrollment.count({
      where: { courseId: { in: courseIds }, progress: 100 },
    });

    const completionRate =
      totalStudents === 0
        ? 0
        : Math.round((completedCount / totalStudents) * 100);

    const quizAttempts = await prisma.quizAttempt.count({
      where: { quiz: { courseId: { in: courseIds } } },
    });

    const mostPopular = courses.reduce(
      (best, c) =>
        c._count.enrollments > (best?._count?.enrollments || 0) ? c : best,
      null
    );

    let mostPopularTitle = null;
    if (mostPopular) {
      const popularCourse = await prisma.course.findUnique({
        where: { id: mostPopular.id },
        select: { title: true },
      });
      mostPopularTitle = popularCourse?.title || null;
    }

    return res.json({
      totalCourses,
      totalStudents,
      totalLessons,
      totalReviews,
      avgRating,
      completionRate,
      quizAttempts,
      mostPopularCourse: mostPopular
        ? {
            id: mostPopular.id,
            title: mostPopularTitle,
            enrollments: mostPopular._count.enrollments,
          }
        : null,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Error fetching instructor stats",
      error: err.message,
    });
  }
});

module.exports = router;