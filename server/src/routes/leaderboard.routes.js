// Path: E:\EduQuest\server\src\routes\leaderboard.routes.js

const router = require("express").Router();
const prisma = require("../prisma");

// Public leaderboard (simple)
// GET /api/leaderboard?limit=10
router.get("/", async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit || 10), 50);

    const users = await prisma.user.findMany({
      take: limit,
      orderBy: [{ totalPoints: "desc" }, { createdAt: "asc" }],
      select: {
        id: true,
        fullName: true,
        role: true,
        totalPoints: true,
        level: true,
        createdAt: true,
      },
    });

    return res.json(users);
  } catch (err) {
    return res.status(500).json({ message: "Error loading leaderboard", error: err.message });
  }
});

module.exports = router;
