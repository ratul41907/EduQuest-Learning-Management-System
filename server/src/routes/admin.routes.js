// Path: E:\EduQuest\server\src\routes\admin.routes.js

const router = require("express").Router();
const prisma = require("../prisma");
const { requireAuth } = require("../middleware/auth");

// Guard: all routes require ADMIN role
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== "ADMIN") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
}

// =========================================
// GET /api/admin/stats
// Admin: platform-wide overview
// =========================================
router.get("/stats", requireAuth, requireAdmin, async (req, res) => {
  try {
    const [totalStudents, totalInstructors, totalAdmins] = await Promise.all([
      prisma.user.count({ where: { role: "STUDENT" } }),
      prisma.user.count({ where: { role: "INSTRUCTOR" } }),
      prisma.user.count({ where: { role: "ADMIN" } }),
    ]);

    const [totalCourses, totalLessons, totalQuizzes, totalQuestions] = await Promise.all([
      prisma.course.count(),
      prisma.lesson.count(),
      prisma.quiz.count(),
      prisma.question.count(),
    ]);

    const [totalEnrollments, totalCompletions, totalQuizAttempts, totalCertificates] =
      await Promise.all([
        prisma.enrollment.count(),
        prisma.enrollment.count({ where: { progress: 100 } }),
        prisma.quizAttempt.count(),
        prisma.certificate.count(),
      ]);

    const reviews = await prisma.review.findMany({ select: { rating: true } });
    const avgRating =
      reviews.length === 0
        ? 0
        : Math.round(
            (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) * 10
          ) / 10;

    const completionRate =
      totalEnrollments === 0
        ? 0
        : Math.round((totalCompletions / totalEnrollments) * 100);

    const since7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const newUsersThisWeek = await prisma.user.count({
      where: { createdAt: { gte: since7Days } },
    });

    const newEnrollmentsThisWeek = await prisma.enrollment.count({
      where: { createdAt: { gte: since7Days } },
    });

    const topCourses = await prisma.course.findMany({
      select: {
        id: true,
        title: true,
        _count: { select: { enrollments: true } },
      },
      orderBy: { enrollments: { _count: "desc" } },
      take: 3,
    });

    return res.json({
      users: {
        total: totalStudents + totalInstructors + totalAdmins,
        students: totalStudents,
        instructors: totalInstructors,
        admins: totalAdmins,
        newThisWeek: newUsersThisWeek,
      },
      content: {
        courses: totalCourses,
        lessons: totalLessons,
        quizzes: totalQuizzes,
        questions: totalQuestions,
      },
      activity: {
        totalEnrollments,
        completions: totalCompletions,
        completionRate,
        quizAttempts: totalQuizAttempts,
        certificates: totalCertificates,
        newEnrollmentsThisWeek,
        avgRating,
        totalReviews: reviews.length,
      },
      topCourses: topCourses.map((c) => ({
        id: c.id,
        title: c.title,
        enrollments: c._count.enrollments,
      })),
    });
  } catch (err) {
    return res.status(500).json({
      message: "Error fetching admin stats",
      error: err.message,
    });
  }
});

// =========================================
// GET /api/admin/users
// Admin: list all users with filters
// =========================================
router.get("/users", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;

    const pageNum  = Math.max(1, parseInt(page)  || 1);
    const limitNum = Math.min(100, parseInt(limit) || 20);
    const skip     = (pageNum - 1) * limitNum;

    const where = {};

    if (role && ["STUDENT", "INSTRUCTOR", "ADMIN"].includes(role.toUpperCase())) {
      where.role = role.toUpperCase();
    }

    if (search && search.trim()) {
      where.OR = [
        { fullName: { contains: search.trim(), mode: "insensitive" } },
        { email:    { contains: search.trim(), mode: "insensitive" } },
      ];
    }

    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        select: {
          id: true,
          fullName: true,
          email: true,
          role: true,
          totalPoints: true,
          level: true,
          createdAt: true,
          _count: {
            select: {
              enrollments: true,
              certificates: true,
              userBadges: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limitNum,
      }),
    ]);

    return res.json({
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
      users: users.map((u) => ({
        id: u.id,
        fullName: u.fullName,
        email: u.email,
        role: u.role,
        totalPoints: u.totalPoints,
        level: u.level,
        enrollments: u._count.enrollments,
        certificates: u._count.certificates,
        badges: u._count.userBadges,
        createdAt: u.createdAt,
      })),
    });
  } catch (err) {
    return res.status(500).json({
      message: "Error fetching users",
      error: err.message,
    });
  }
});

// =========================================
// GET /api/admin/users/:id
// Admin: get single user full detail
// =========================================
router.get("/users/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        totalPoints: true,
        level: true,
        createdAt: true,
        updatedAt: true,
        enrollments: {
          select: {
            progress: true,
            createdAt: true,
            course: { select: { id: true, title: true } },
          },
          orderBy: { createdAt: "desc" },
        },
        certificates: {
          select: {
            id: true, code: true, issuedAt: true,
            course: { select: { title: true } },
          },
        },
        userBadges: {
          select: {
            awardedAt: true,
            badge: { select: { code: true, name: true } },
          },
        },
        quizAttempts: {
          select: { score: true, percent: true, passed: true, createdAt: true },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    return res.json({
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      totalPoints: user.totalPoints,
      level: user.level,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      stats: {
        enrollments:  user.enrollments?.length  || 0,
        certificates: user.certificates?.length || 0,
        badges:       user.userBadges?.length   || 0,
        quizAttempts: user.quizAttempts?.length || 0,
      },
      enrollments: user.enrollments,
      certificates: user.certificates,
      badges: user.userBadges?.map((b) => ({ ...b.badge, awardedAt: b.awardedAt })) || [],
      recentQuizAttempts: user.quizAttempts || [],
    });
  } catch (err) {
    return res.status(500).json({
      message: "Error fetching user detail",
      error: err.message,
    });
  }
});

// =========================================
// PATCH /api/admin/users/:id/role
// Admin: change a user's role
// =========================================
router.patch("/users/:id/role", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (id === req.user.sub) {
      return res.status(400).json({ message: "You cannot change your own role" });
    }

    if (!role || !["STUDENT", "INSTRUCTOR", "ADMIN"].includes(role.toUpperCase())) {
      return res.status(400).json({
        message: "role must be one of: STUDENT, INSTRUCTOR, ADMIN",
      });
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return res.status(404).json({ message: "User not found" });

    const updated = await prisma.user.update({
      where: { id },
      data: { role: role.toUpperCase() },
      select: {
        id: true, fullName: true, email: true,
        role: true, updatedAt: true,
      },
    });

    return res.json({
      message: `Role updated to ${role.toUpperCase()}`,
      user: updated,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Error updating role",
      error: err.message,
    });
  }
});

// =========================================
// PATCH /api/admin/users/:id/points
// Admin: manually adjust a user's points
// =========================================
router.patch("/users/:id/points", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { points, reason } = req.body;

    if (points == null || isNaN(Number(points))) {
      return res.status(400).json({ message: "points must be a valid number" });
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return res.status(404).json({ message: "User not found" });

    const newTotal = Math.max(0, user.totalPoints + Number(points));
    const newLevel = Math.floor(newTotal / 100) + 1;

    const updated = await prisma.user.update({
      where: { id },
      data: { totalPoints: newTotal, level: newLevel },
      select: {
        id: true, fullName: true, email: true,
        totalPoints: true, level: true,
      },
    });

    if (reason) {
      await prisma.notification.create({
        data: {
          userId: id,
          type: "BADGE_EARNED",
          title: points > 0 ? "Points Added!" : "Points Adjusted",
          message: `Admin adjusted your points by ${points > 0 ? "+" : ""}${points}. ${reason}`,
        },
      }).catch(() => {});
    }

    return res.json({
      message: `Points adjusted by ${points > 0 ? "+" : ""}${points}`,
      previousPoints: user.totalPoints,
      newPoints: newTotal,
      newLevel,
      user: updated,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Error adjusting points",
      error: err.message,
    });
  }
});

// =========================================
// DELETE /api/admin/users/:id
// Admin: delete a user and all their data
// =========================================
router.delete("/users/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    if (id === req.user.sub) {
      return res.status(400).json({ message: "You cannot delete your own account" });
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, fullName: true, email: true, role: true },
    });
    if (!user) return res.status(404).json({ message: "User not found" });

    await prisma.lessonProgress.deleteMany({ where: { userId: id } });
    await prisma.quizAttempt.deleteMany({ where: { userId: id } });
    await prisma.enrollment.deleteMany({ where: { userId: id } });
    await prisma.certificate.deleteMany({ where: { userId: id } });
    await prisma.userBadge.deleteMany({ where: { userId: id } });
    await prisma.review.deleteMany({ where: { userId: id } });
    await prisma.notification.deleteMany({ where: { userId: id } });

    if (user.role === "INSTRUCTOR") {
      const courses = await prisma.course.findMany({
        where: { instructorId: id },
        select: { id: true },
      });

      for (const course of courses) {
        const cid = course.id;
        await prisma.lessonProgress.deleteMany({ where: { lesson: { courseId: cid } } });
        await prisma.lesson.deleteMany({ where: { courseId: cid } });
        await prisma.quizAttempt.deleteMany({ where: { quiz: { courseId: cid } } });
        await prisma.question.deleteMany({ where: { quiz: { courseId: cid } } });
        await prisma.quiz.deleteMany({ where: { courseId: cid } });
        await prisma.enrollment.deleteMany({ where: { courseId: cid } });
        await prisma.review.deleteMany({ where: { courseId: cid } });
        await prisma.certificate.deleteMany({ where: { courseId: cid } });
        await prisma.notification.deleteMany({ where: { courseId: cid } });
        await prisma.course.delete({ where: { id: cid } });
      }
    }

    await prisma.user.delete({ where: { id } });

    return res.json({
      message: "User deleted successfully",
      deleted: { id: user.id, fullName: user.fullName, email: user.email },
    });
  } catch (err) {
    return res.status(500).json({
      message: "Error deleting user",
      error: err.message,
    });
  }
});

// =========================================
// GET /api/admin/courses
// Admin: list all courses with full stats
// =========================================
router.get("/courses", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;

    const pageNum  = Math.max(1, parseInt(page)  || 1);
    const limitNum = Math.min(100, parseInt(limit) || 20);
    const skip     = (pageNum - 1) * limitNum;

    const where = {};
    if (search && search.trim()) {
      where.title = { contains: search.trim(), mode: "insensitive" };
    }

    const [total, courses] = await Promise.all([
      prisma.course.count({ where }),
      prisma.course.findMany({
        where,
        select: {
          id: true,
          title: true,
          level: true,
          price: true,
          createdAt: true,
          instructor: { select: { id: true, fullName: true, email: true } },
          _count: {
            select: {
              enrollments: true,
              lessons: true,
              quizzes: true,
              reviews: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limitNum,
      }),
    ]);

    return res.json({
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
      courses: courses.map((c) => ({
        id: c.id,
        title: c.title,
        level: c.level,
        price: c.price,
        instructor: c.instructor,
        enrollments: c._count.enrollments,
        lessons: c._count.lessons,
        quizzes: c._count.quizzes,
        reviews: c._count.reviews,
        createdAt: c.createdAt,
      })),
    });
  } catch (err) {
    return res.status(500).json({
      message: "Error fetching courses",
      error: err.message,
    });
  }
});

// =========================================
// DELETE /api/admin/courses/:id
// Admin: force delete any course
// =========================================
router.delete("/courses/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const course = await prisma.course.findUnique({
      where: { id },
      select: { id: true, title: true },
    });
    if (!course) return res.status(404).json({ message: "Course not found" });

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

    return res.json({
      message: "Course deleted successfully",
      deleted: { id: course.id, title: course.title },
    });
  } catch (err) {
    return res.status(500).json({
      message: "Error deleting course",
      error: err.message,
    });
  }
});

// =========================================
// POST /api/admin/badges
// Day 11: Admin creates a new badge
// =========================================
router.post("/badges", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { code, name, description, pointsBonus } = req.body;

    if (!code || !name || !description) {
      return res.status(400).json({
        message: "code, name and description are required",
      });
    }

    const existing = await prisma.badge.findUnique({
      where: { code: code.toUpperCase() },
    });
    if (existing) {
      return res.status(409).json({
        message: `Badge with code "${code.toUpperCase()}" already exists`,
      });
    }

    const badge = await prisma.badge.create({
      data: {
        code:        code.toUpperCase(),
        name,
        description,
        pointsBonus: pointsBonus != null ? Number(pointsBonus) : 0,
      },
    });

    return res.status(201).json({
      message: "Badge created successfully",
      badge,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Error creating badge",
      error: err.message,
    });
  }
});

// =========================================
// PATCH /api/admin/badges/:id
// NEW Day 12: Update badge details
// =========================================
router.patch("/badges/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, pointsBonus } = req.body;

    const badge = await prisma.badge.findUnique({ where: { id } });
    if (!badge) return res.status(404).json({ message: "Badge not found" });

    const updateData = {};
    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (pointsBonus != null) updateData.pointsBonus = Number(pointsBonus);

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        message: "Nothing to update. Provide name, description, or pointsBonus.",
      });
    }

    const updated = await prisma.badge.update({
      where: { id },
      data: updateData,
    });

    return res.json({
      message: "Badge updated successfully",
      badge: updated,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Error updating badge",
      error: err.message,
    });
  }
});

// =========================================
// DELETE /api/admin/badges/:id
// Day 11: Admin deletes a badge
// =========================================
router.delete("/badges/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const badge = await prisma.badge.findUnique({ where: { id } });
    if (!badge) return res.status(404).json({ message: "Badge not found" });

    const { count } = await prisma.userBadge.deleteMany({
      where: { badgeId: id },
    });

    await prisma.badge.delete({ where: { id } });

    return res.json({
      message: "Badge deleted successfully",
      deleted: { id: badge.id, code: badge.code, name: badge.name },
      awardsRemoved: count,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Error deleting badge",
      error: err.message,
    });
  }
});

// =========================================
// POST /api/admin/users/:id/award-badge
// NEW Day 12: Manually award badge to user
// =========================================
router.post("/users/:id/award-badge", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id: userId } = req.params;
    const { badgeCode } = req.body;

    if (!badgeCode) {
      return res.status(400).json({ message: "badgeCode is required" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, fullName: true, email: true },
    });
    if (!user) return res.status(404).json({ message: "User not found" });

    const badge = await prisma.badge.findUnique({
      where: { code: badgeCode.toUpperCase() },
    });
    if (!badge) {
      return res.status(404).json({ message: `Badge "${badgeCode}" not found` });
    }

    const existing = await prisma.userBadge.findUnique({
      where: { userId_badgeId: { userId, badgeId: badge.id } },
    });
    if (existing) {
      return res.status(409).json({
        message: `User already has badge "${badge.name}"`,
      });
    }

    await prisma.userBadge.create({
      data: { userId, badgeId: badge.id },
    });

    await prisma.notification.create({
      data: {
        userId,
        type: "BADGE_EARNED",
        title: `Badge Awarded: ${badge.name}!`,
        message: `Admin awarded you the "${badge.name}" badge. ${badge.description}`,
      },
    }).catch(() => {});

    return res.json({
      message: "Badge awarded successfully",
      user: { id: user.id, fullName: user.fullName },
      badge: { code: badge.code, name: badge.name },
    });
  } catch (err) {
    return res.status(500).json({
      message: "Error awarding badge",
      error: err.message,
    });
  }
});

// =========================================
// POST /api/admin/notify-all
// NEW Day 12: Send notification to all users
// =========================================
router.post("/notify-all", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { title, message, type, roleFilter } = req.body;

    if (!title || !message) {
      return res.status(400).json({
        message: "title and message are required",
      });
    }

    const where = {};
    if (roleFilter && ["STUDENT", "INSTRUCTOR", "ADMIN"].includes(roleFilter.toUpperCase())) {
      where.role = roleFilter.toUpperCase();
    }

    const users = await prisma.user.findMany({
      where,
      select: { id: true },
    });

    if (users.length === 0) {
      return res.status(400).json({
        message: "No users match the filter criteria",
      });
    }

    const notifications = users.map((u) => ({
      userId: u.id,
      type: type || "BADGE_EARNED",
      title,
      message,
    }));

    await prisma.notification.createMany({ data: notifications });

    return res.json({
      message: "Notification sent successfully",
      recipientCount: users.length,
      roleFilter: roleFilter || "ALL",
    });
  } catch (err) {
    return res.status(500).json({
      message: "Error sending notification",
      error: err.message,
    });
  }
});

// =========================================
// GET /api/admin/notifications
// NEW Day 12: View all platform notifications
// =========================================
router.get("/notifications", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;

    const pageNum  = Math.max(1, parseInt(page)  || 1);
    const limitNum = Math.min(200, parseInt(limit) || 50);
    const skip     = (pageNum - 1) * limitNum;

    const [total, notifications] = await Promise.all([
      prisma.notification.count(),
      prisma.notification.findMany({
        select: {
          id: true,
          type: true,
          title: true,
          message: true,
          isRead: true,
          createdAt: true,
          user: { select: { id: true, fullName: true, email: true } },
          courseId: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limitNum,
      }),
    ]);

    const unreadCount = await prisma.notification.count({
      where: { isRead: false },
    });

    return res.json({
      total,
      unreadCount,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
      notifications,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Error fetching notifications",
      error: err.message,
    });
  }
});

// =========================================
// GET /api/admin/reports/enrollments
// Day 11: Enrollment trends
// =========================================
router.get("/reports/enrollments", requireAuth, requireAdmin, async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 14;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const enrollments = await prisma.enrollment.findMany({
      where: { createdAt: { gte: since } },
      select: { createdAt: true, courseId: true },
      orderBy: { createdAt: "asc" },
    });

    const dailyMap = {};
    enrollments.forEach((e) => {
      const date = e.createdAt.toISOString().split("T")[0];
      dailyMap[date] = (dailyMap[date] || 0) + 1;
    });

    const trend = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const date = d.toISOString().split("T")[0];
      trend.push({ date, enrollments: dailyMap[date] || 0 });
    }

    const courseEnrollments = await prisma.course.findMany({
      select: {
        id: true,
        title: true,
        _count: { select: { enrollments: true } },
      },
      orderBy: { enrollments: { _count: "desc" } },
      take: 10,
    });

    return res.json({
      period: `Last ${days} days`,
      totalInPeriod: enrollments.length,
      trend,
      topCourses: courseEnrollments.map((c) => ({
        id: c.id,
        title: c.title,
        totalEnrollments: c._count.enrollments,
      })),
    });
  } catch (err) {
    return res.status(500).json({
      message: "Error fetching enrollment report",
      error: err.message,
    });
  }
});

// =========================================
// GET /api/admin/reports/quizzes
// Day 11: Quiz pass/fail stats per course
// =========================================
router.get("/reports/quizzes", requireAuth, requireAdmin, async (req, res) => {
  try {
    const courses = await prisma.course.findMany({
      select: {
        id: true,
        title: true,
        quizzes: {
          select: {
            id: true,
            title: true,
            passScore: true,
            attempts: {
              select: { passed: true, percent: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const report = courses
      .filter((c) => c.quizzes.length > 0)
      .map((c) => {
        const quizStats = c.quizzes.map((q) => {
          const total   = q.attempts.length;
          const passed  = q.attempts.filter((a) => a.passed).length;
          const failed  = total - passed;
          const avgPct  =
            total === 0
              ? 0
              : Math.round(
                  q.attempts.reduce((sum, a) => sum + a.percent, 0) / total
                );

          return {
            quizId:    q.id,
            title:     q.title,
            passScore: q.passScore,
            total,
            passed,
            failed,
            passRate:  total === 0 ? 0 : Math.round((passed / total) * 100),
            avgScore:  avgPct,
          };
        });

        const courseTotalAttempts = quizStats.reduce((s, q) => s + q.total, 0);
        const courseTotalPassed   = quizStats.reduce((s, q) => s + q.passed, 0);

        return {
          courseId:    c.id,
          title:       c.title,
          totalQuizzes: c.quizzes.length,
          totalAttempts: courseTotalAttempts,
          totalPassed:   courseTotalPassed,
          coursePassRate:
            courseTotalAttempts === 0
              ? 0
              : Math.round((courseTotalPassed / courseTotalAttempts) * 100),
          quizzes: quizStats,
        };
      });

    const allAttempts  = await prisma.quizAttempt.count();
    const allPassed    = await prisma.quizAttempt.count({ where: { passed: true } });
    const platformPassRate =
      allAttempts === 0 ? 0 : Math.round((allPassed / allAttempts) * 100);

    return res.json({
      platform: {
        totalAttempts: allAttempts,
        totalPassed:   allPassed,
        totalFailed:   allAttempts - allPassed,
        passRate:      platformPassRate,
      },
      courses: report,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Error fetching quiz report",
      error: err.message,
    });
  }
});

// =========================================
// GET /api/admin/reports/revenue
// Day 11: Revenue summary per course
// =========================================
router.get("/reports/revenue", requireAuth, requireAdmin, async (req, res) => {
  try {
    const courses = await prisma.course.findMany({
      select: {
        id: true,
        title: true,
        price: true,
        instructor: { select: { id: true, fullName: true } },
        _count: { select: { enrollments: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    let totalRevenue = 0;

    const breakdown = courses.map((c) => {
      const revenue = c.price * c._count.enrollments;
      totalRevenue += revenue;
      return {
        courseId:    c.id,
        title:       c.title,
        price:       c.price,
        enrollments: c._count.enrollments,
        revenue,
        instructor:  c.instructor,
      };
    });

    breakdown.sort((a, b) => b.revenue - a.revenue);

    const byInstructor = {};
    breakdown.forEach((c) => {
      const key = c.instructor.id;
      if (!byInstructor[key]) {
        byInstructor[key] = {
          instructorId:   c.instructor.id,
          fullName:       c.instructor.fullName,
          totalRevenue:   0,
          totalCourses:   0,
          totalStudents:  0,
        };
      }
      byInstructor[key].totalRevenue  += c.revenue;
      byInstructor[key].totalCourses  += 1;
      byInstructor[key].totalStudents += c.enrollments;
    });

    return res.json({
      totalRevenue,
      totalCourses: courses.length,
      freeCourses:  courses.filter((c) => c.price === 0).length,
      paidCourses:  courses.filter((c) => c.price > 0).length,
      byInstructor: Object.values(byInstructor).sort(
        (a, b) => b.totalRevenue - a.totalRevenue
      ),
      breakdown,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Error fetching revenue report",
      error: err.message,
    });
  }
});

// =========================================
// GET /api/admin/reports/users
// NEW Day 12: User growth trend
// =========================================
router.get("/reports/users", requireAuth, requireAdmin, async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const users = await prisma.user.findMany({
      where: { createdAt: { gte: since } },
      select: { createdAt: true, role: true },
      orderBy: { createdAt: "asc" },
    });

    const dailyMap = {};
    const roleMap = { STUDENT: 0, INSTRUCTOR: 0, ADMIN: 0 };

    users.forEach((u) => {
      const date = u.createdAt.toISOString().split("T")[0];
      if (!dailyMap[date]) dailyMap[date] = { STUDENT: 0, INSTRUCTOR: 0, ADMIN: 0 };
      dailyMap[date][u.role] += 1;
      roleMap[u.role] += 1;
    });

    const trend = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const date = d.toISOString().split("T")[0];
      trend.push({
        date,
        total: (dailyMap[date]?.STUDENT || 0) + (dailyMap[date]?.INSTRUCTOR || 0) + (dailyMap[date]?.ADMIN || 0),
        students: dailyMap[date]?.STUDENT || 0,
        instructors: dailyMap[date]?.INSTRUCTOR || 0,
        admins: dailyMap[date]?.ADMIN || 0,
      });
    }

    const [totalStudents, totalInstructors, totalAdmins] = await Promise.all([
      prisma.user.count({ where: { role: "STUDENT" } }),
      prisma.user.count({ where: { role: "INSTRUCTOR" } }),
      prisma.user.count({ where: { role: "ADMIN" } }),
    ]);

    return res.json({
      period: `Last ${days} days`,
      newInPeriod: users.length,
      byRole: roleMap,
      currentTotals: {
        students: totalStudents,
        instructors: totalInstructors,
        admins: totalAdmins,
        total: totalStudents + totalInstructors + totalAdmins,
      },
      trend,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Error fetching user growth report",
      error: err.message,
    });
  }
});

module.exports = router;