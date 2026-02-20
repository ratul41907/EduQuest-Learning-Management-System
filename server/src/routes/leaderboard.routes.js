// Path: E:\EduQuest\server\src\routes\leaderboard.routes.js

const router = require("express").Router();
const prisma = require("../prisma");

// =========================================
// GET /api/leaderboard/all-time
// Public: top 20 students by totalPoints
// =========================================
router.get("/all-time", async (req, res) => {
  try {
    const top = await prisma.user.findMany({
      where: { role: "STUDENT" },
      select: {
        id: true,
        fullName: true,
        totalPoints: true,
        level: true,
        createdAt: true,
      },
      orderBy: [{ totalPoints: "desc" }, { createdAt: "asc" }],
      take: 20,
    });

    const rows = top.map((u, idx) => ({
      rank: idx + 1,
      ...u,
    }));

    return res.json(rows);
  } catch (err) {
    return res.status(500).json({
      message: "Error fetching all-time leaderboard",
      error: err.message,
    });
  }
});

// =========================================
// GET /api/leaderboard/weekly
// Public: top 20 by earnedPoints in last 7 days
// =========================================
router.get("/weekly", async (req, res) => {
  try {
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const grouped = await prisma.quizAttempt.groupBy({
      by: ["userId"],
      where: { createdAt: { gte: since } },
      _sum: { earnedPoints: true },
    });

    if (!grouped.length) return res.json([]);

    grouped.sort(
      (a, b) => (b._sum.earnedPoints || 0) - (a._sum.earnedPoints || 0)
    );

    const userIds = grouped.map((g) => g.userId);

    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, fullName: true, level: true, totalPoints: true },
    });

    const userMap = new Map(users.map((u) => [u.id, u]));

    const rows = grouped
      .map((g, idx) => {
        const u = userMap.get(g.userId);
        if (!u) return null;
        return {
          rank: idx + 1,
          id: u.id,
          fullName: u.fullName,
          weeklyPoints: g._sum.earnedPoints || 0,
          totalPoints: u.totalPoints,
          level: u.level,
        };
      })
      .filter(Boolean)
      .slice(0, 20);

    return res.json(rows);
  } catch (err) {
    return res.status(500).json({
      message: "Error fetching weekly leaderboard",
      error: err.message,
    });
  }
});

// =========================================
// GET /api/leaderboard/course/:courseId
// NEW Day 6: alias to course leaderboard
// Top 10 students ranked by progress + quiz points
// =========================================
router.get("/course/:courseId", async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true, title: true },
    });
    if (!course) return res.status(404).json({ message: "Course not found" });

    const enrollments = await prisma.enrollment.findMany({
      where: { courseId },
      select: {
        userId: true,
        progress: true,
        user: {
          select: { id: true, fullName: true, totalPoints: true, level: true },
        },
      },
    });

    if (enrollments.length === 0) {
      return res.json({ courseId, title: course.title, leaderboard: [] });
    }

    const userIds = enrollments.map((e) => e.userId);

    // Lesson completions per user for this course
    const lessonCompletions = await prisma.lessonProgress.findMany({
      where: { userId: { in: userIds }, lesson: { courseId } },
      select: { userId: true },
    });

    const completionMap = {};
    lessonCompletions.forEach((lp) => {
      completionMap[lp.userId] = (completionMap[lp.userId] || 0) + 1;
    });

    // Quiz points per user for this course
    const quizAttempts = await prisma.quizAttempt.findMany({
      where: { userId: { in: userIds }, quiz: { courseId } },
      select: { userId: true, earnedPoints: true },
    });

    const quizPointsMap = {};
    quizAttempts.forEach((a) => {
      quizPointsMap[a.userId] = (quizPointsMap[a.userId] || 0) + a.earnedPoints;
    });

    const rows = enrollments.map((e) => ({
      userId: e.userId,
      fullName: e.user.fullName,
      level: e.user.level,
      progress: e.progress,
      lessonsCompleted: completionMap[e.userId] || 0,
      quizPoints: quizPointsMap[e.userId] || 0,
      score:
        Math.round(e.progress * 0.6) +
        Math.min(Math.round((quizPointsMap[e.userId] || 0) * 0.4), 40),
    }));

    rows.sort((a, b) =>
      b.score !== a.score
        ? b.score - a.score
        : b.lessonsCompleted - a.lessonsCompleted
    );

    const leaderboard = rows.slice(0, 10).map((r, idx) => ({
      rank: idx + 1,
      ...r,
    }));

    return res.json({ courseId, title: course.title, leaderboard });
  } catch (err) {
    return res.status(500).json({
      message: "Error fetching course leaderboard",
      error: err.message,
    });
  }
});

module.exports = router;