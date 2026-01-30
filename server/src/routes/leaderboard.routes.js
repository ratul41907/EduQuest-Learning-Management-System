// Path: E:\EduQuest\server\src\routes\leaderboard.routes.js
const router = require("express").Router();
const prisma = require("../prisma");

/**
 * GET /api/leaderboard/all-time
 * Public: show top users by totalPoints
 */
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
    return res.status(500).json({ message: "Error fetching all-time leaderboard", error: err.message });
  }
});

/**
 * GET /api/leaderboard/weekly
 * Public: show top users by sum of earnedPoints in last 7 days
 */
router.get("/weekly", async (req, res) => {
  try {
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // group attempts by userId for last 7 days
    const grouped = await prisma.quizAttempt.groupBy({
      by: ["userId"],
      where: { createdAt: { gte: since } },
      _sum: { earnedPoints: true },
    });

    if (!grouped.length) return res.json([]);

    // sort by weekly points desc
    grouped.sort((a, b) => (b._sum.earnedPoints || 0) - (a._sum.earnedPoints || 0));

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
    return res.status(500).json({ message: "Error fetching weekly leaderboard", error: err.message });
  }
});

module.exports = router;