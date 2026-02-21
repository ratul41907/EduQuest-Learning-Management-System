// Path: E:\EduQuest\server\src\routes\user.routes.js

const router = require("express").Router();
const prisma = require("../prisma");
const bcrypt = require("bcrypt");
const { requireAuth } = require("../middleware/auth");
const { uploadProfilePicture, handleUploadError } = require("../middleware/upload");

// =========================================
// GET /api/user/me
// =========================================
router.get("/me", requireAuth, async (req, res) => {
  try {
    const me = await prisma.user.findUnique({
      where: { id: req.user.sub },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        totalPoints: true,
        level: true,
        profilePicture: true,
        createdAt: true,
      },
    });
    if (!me) return res.status(404).json({ message: "User not found" });
    return res.json(me);
  } catch (err) {
    return res.status(500).json({ message: "Error fetching profile", error: err.message });
  }
});

// =========================================
// PATCH /api/user/me
// Update own name and/or password
// =========================================
router.patch("/me", requireAuth, async (req, res) => {
  try {
    const userId = req.user.sub;
    const { fullName, currentPassword, newPassword } = req.body || {};

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ message: "User not found" });

    const updateData = {};

    if (fullName && fullName.trim()) {
      updateData.fullName = fullName.trim();
    }

    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({
          message: "currentPassword is required to set a new password",
        });
      }
      const valid = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!valid) {
        return res.status(401).json({ message: "Current password is incorrect" });
      }
      if (newPassword.length < 6) {
        return res.status(400).json({
          message: "New password must be at least 6 characters",
        });
      }
      updateData.passwordHash = await bcrypt.hash(newPassword, 10);
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        message: "Nothing to update. Provide fullName or newPassword.",
      });
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        totalPoints: true,
        level: true,
        profilePicture: true,
        updatedAt: true,
      },
    });

    return res.json({ message: "Profile updated", user: updated });
  } catch (err) {
    return res.status(500).json({ message: "Error updating profile", error: err.message });
  }
});

// =========================================
// GET /api/user/me/dashboard
// Student dashboard — everything in one call
// =========================================
router.get("/me/dashboard", requireAuth, async (req, res) => {
  try {
    const userId = req.user.sub;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true, fullName: true, email: true,
        role: true, totalPoints: true, level: true,
        profilePicture: true, createdAt: true,
      },
    });
    if (!user) return res.status(404).json({ message: "User not found" });

    const enrollments = await prisma.enrollment.findMany({
      where: { userId },
      include: {
        course: {
          select: {
            id: true, title: true, description: true, level: true,
            thumbnail: true,
            instructor: { select: { fullName: true } },
            _count: { select: { lessons: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const courses = enrollments.map((e) => ({
      courseId: e.courseId,
      title: e.course.title,
      description: e.course.description,
      level: e.course.level,
      thumbnail: e.course.thumbnail,
      instructor: e.course.instructor.fullName,
      progress: e.progress,
      totalLessons: e.course._count.lessons,
      enrolledAt: e.createdAt,
    }));

    const userBadges = await prisma.userBadge.findMany({
      where: { userId },
      select: {
        awardedAt: true,
        badge: { select: { code: true, name: true, description: true, pointsBonus: true } },
      },
      orderBy: { awardedAt: "desc" },
    });

    const unreadCount = await prisma.notification.count({
      where: { userId, isRead: false },
    });

    const certificates = await prisma.certificate.findMany({
      where: { userId },
      select: {
        id: true, code: true, issuedAt: true,
        course: { select: { id: true, title: true } },
      },
      orderBy: { issuedAt: "desc" },
    });

    const rank = await prisma.user.count({
      where: { role: "STUDENT", totalPoints: { gt: user.totalPoints } },
    });

    const quizAttemptsCount = await prisma.quizAttempt.count({ where: { userId } });
    const completedLessonsCount = await prisma.lessonProgress.count({ where: { userId } });

    return res.json({
      profile: user,
      stats: {
        totalPoints: user.totalPoints,
        level: user.level,
        leaderboardRank: rank + 1,
        enrollments: courses.length,
        completedLessons: completedLessonsCount,
        quizAttempts: quizAttemptsCount,
        certificatesEarned: certificates.length,
        unreadNotifications: unreadCount,
      },
      courses,
      badges: userBadges.map((ub) => ({ ...ub.badge, awardedAt: ub.awardedAt })),
      certificates,
    });
  } catch (err) {
    return res.status(500).json({ message: "Error fetching dashboard", error: err.message });
  }
});

// =========================================
// GET /api/user/me/badges
// Day 8: Student — earned badges only
// =========================================
router.get("/me/badges", requireAuth, async (req, res) => {
  try {
    const userId = req.user.sub;

    const userBadges = await prisma.userBadge.findMany({
      where: { userId },
      select: {
        awardedAt: true,
        badge: {
          select: {
            code: true,
            name: true,
            description: true,
            pointsBonus: true,
          },
        },
      },
      orderBy: { awardedAt: "desc" },
    });

    const allBadges = await prisma.badge.findMany({
      select: { code: true, name: true, description: true, pointsBonus: true },
    });

    const earnedCodes = new Set(userBadges.map((ub) => ub.badge.code));

    return res.json({
      earned: userBadges.map((ub) => ({
        ...ub.badge,
        awardedAt: ub.awardedAt,
        unlocked: true,
      })),
      locked: allBadges
        .filter((b) => !earnedCodes.has(b.code))
        .map((b) => ({ ...b, unlocked: false })),
      totalEarned: userBadges.length,
      totalAvailable: allBadges.length,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Error fetching badges",
      error: err.message,
    });
  }
});

// =========================================
// GET /api/user/me/certificates
// Day 8: Student — certificates only
// =========================================
router.get("/me/certificates", requireAuth, async (req, res) => {
  try {
    const userId = req.user.sub;

    const certificates = await prisma.certificate.findMany({
      where: { userId },
      select: {
        id: true,
        code: true,
        issuedAt: true,
        course: {
          select: {
            id: true,
            title: true,
            level: true,
            instructor: { select: { fullName: true } },
          },
        },
      },
      orderBy: { issuedAt: "desc" },
    });

    return res.json({
      count: certificates.length,
      certificates: certificates.map((c) => ({
        id: c.id,
        code: c.code,
        issuedAt: c.issuedAt,
        courseId: c.course.id,
        courseTitle: c.course.title,
        courseLevel: c.course.level,
        instructor: c.course.instructor.fullName,
        verifyUrl: `/api/certificates/verify/${c.code}`,
      })),
    });
  } catch (err) {
    return res.status(500).json({
      message: "Error fetching certificates",
      error: err.message,
    });
  }
});

// =========================================
// POST /api/user/me/upload-picture
// NEW Day 15: Upload profile picture
// =========================================
router.post("/me/upload-picture", requireAuth, (req, res, next) => {
  uploadProfilePicture(req, res, (err) => {
    if (err) return handleUploadError(err, req, res, next);
    next();
  });
}, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Delete old profile picture if exists
    const user = await prisma.user.findUnique({
      where: { id: req.user.sub },
      select: { profilePicture: true },
    });

    if (user.profilePicture) {
      const fs = require("fs");
      const path = require("path");
      const oldPath = path.join(__dirname, "../../", user.profilePicture);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    const filePath = `/uploads/profiles/${req.file.filename}`;

    const updated = await prisma.user.update({
      where: { id: req.user.sub },
      data: { profilePicture: filePath },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        profilePicture: true,
      },
    });

    return res.json({
      message: "Profile picture uploaded successfully",
      profilePicture: filePath,
      user: updated,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Error uploading profile picture",
      error: err.message,
    });
  }
});

// =========================================
// DELETE /api/user/me/delete-picture
// NEW Day 15: Delete profile picture
// =========================================
router.delete("/me/delete-picture", requireAuth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.sub },
      select: { profilePicture: true },
    });

    if (user.profilePicture) {
      const fs = require("fs");
      const path = require("path");
      const filePath = path.join(__dirname, "../../", user.profilePicture);
      
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await prisma.user.update({
      where: { id: req.user.sub },
      data: { profilePicture: null },
    });

    return res.json({ message: "Profile picture deleted successfully" });
  } catch (err) {
    return res.status(500).json({
      message: "Error deleting profile picture",
      error: err.message,
    });
  }
});

// =========================================
// GET /api/user/:id/stats
// Public: any user's public stats
// IMPORTANT: must stay below all /me routes
// =========================================
router.get("/:id/stats", async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true, fullName: true, role: true,
        totalPoints: true, level: true,
        profilePicture: true, createdAt: true,
      },
    });
    if (!user) return res.status(404).json({ message: "User not found" });

    const userBadges = await prisma.userBadge.findMany({
      where: { userId: id },
      select: {
        awardedAt: true,
        badge: { select: { code: true, name: true, description: true, pointsBonus: true } },
      },
      orderBy: { awardedAt: "desc" },
    });

    const enrollmentCount = await prisma.enrollment.count({ where: { userId: id } });
    const completedLessonsCount = await prisma.lessonProgress.count({ where: { userId: id } });
    const quizAttemptsCount = await prisma.quizAttempt.count({ where: { userId: id } });

    return res.json({
      id: user.id,
      fullName: user.fullName,
      role: user.role,
      profilePicture: user.profilePicture,
      totalPoints: user.totalPoints,
      level: user.level,
      memberSince: user.createdAt,
      stats: {
        enrollments: enrollmentCount,
        completedLessons: completedLessonsCount,
        quizAttempts: quizAttemptsCount,
      },
      badges: userBadges.map((ub) => ({ ...ub.badge, awardedAt: ub.awardedAt })),
    });
  } catch (err) {
    return res.status(500).json({ message: "Error fetching user stats", error: err.message });
  }
});

module.exports = router;