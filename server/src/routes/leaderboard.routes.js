// Path: E:\EduQuest\server\src\routes\leaderboard.routes.js

const router = require("express").Router();
const prisma = require("../prisma");
const { cacheMiddleware } = require("../middleware/cache");

// =========================================
// GET /api/leaderboard/all-time
// Day 19: Added caching (5 minutes)
// =========================================
router.get("/all-time", cacheMiddleware(300), async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const maxLimit = Math.min(100, parseInt(limit) || 10);

    const topUsers = await prisma.user.findMany({
      where: { role: "STUDENT" },
      select: {
        id: true,
        fullName: true,
        totalPoints: true,
        level: true,
        profilePicture: true,
      },
      orderBy: [{ totalPoints: "desc" }, { level: "desc" }],
      take: maxLimit,
    });

    const leaderboard = topUsers.map((user, index) => ({
      rank: index + 1,
      userId: user.id,
      fullName: user.fullName,
      totalPoints: user.totalPoints,
      level: user.level,
      profilePicture: user.profilePicture,
    }));

    return res.json({ type: "all-time", leaderboard });
  } catch (err) {
    return res.status(500).json({
      message: "Error fetching all-time leaderboard",
      error: err.message,
    });
  }
});

// =========================================
// GET /api/leaderboard/weekly
// Day 19: Added caching (2 minutes)
// =========================================
router.get("/weekly", cacheMiddleware(120), async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const maxLimit = Math.min(100, parseInt(limit) || 10);

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const recentProgress = await prisma.lessonProgress.findMany({
      where: {
        completedAt: { gte: oneWeekAgo },
        user: { role: "STUDENT" },
      },
      select: {
        userId: true,
        lesson: { select: { points: true } },
      },
    });

    const recentQuizzes = await prisma.quizAttempt.findMany({
      where: {
        createdAt: { gte: oneWeekAgo },
        user: { role: "STUDENT" },
      },
      select: {
        userId: true,
        earnedPoints: true,
      },
    });

    const pointsMap = {};

    recentProgress.forEach((lp) => {
      if (!pointsMap[lp.userId]) pointsMap[lp.userId] = 0;
      pointsMap[lp.userId] += lp.lesson.points;
    });

    recentQuizzes.forEach((qa) => {
      if (!pointsMap[qa.userId]) pointsMap[qa.userId] = 0;
      pointsMap[qa.userId] += qa.earnedPoints;
    });

    const userIds = Object.keys(pointsMap);
    if (userIds.length === 0) {
      return res.json({ type: "weekly", leaderboard: [] });
    }

    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: {
        id: true,
        fullName: true,
        totalPoints: true,
        level: true,
        profilePicture: true,
      },
    });

    const leaderboard = users
      .map((user) => ({
        userId: user.id,
        fullName: user.fullName,
        weeklyPoints: pointsMap[user.id],
        totalPoints: user.totalPoints,
        level: user.level,
        profilePicture: user.profilePicture,
      }))
      .sort((a, b) => b.weeklyPoints - a.weeklyPoints)
      .slice(0, maxLimit)
      .map((user, index) => ({
        rank: index + 1,
        ...user,
      }));

    return res.json({ type: "weekly", leaderboard });
  } catch (err) {
    return res.status(500).json({
      message: "Error fetching weekly leaderboard",
      error: err.message,
    });
  }
});

module.exports = router;
