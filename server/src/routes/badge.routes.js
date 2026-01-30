// Path: E:\EduQuest\server\src\routes\badge.routes.js

const router = require("express").Router();
const prisma = require("../prisma");
const { requireAuth } = require("../middleware/auth");

// ===========================
// GET /api/badges
// Public: list all badges
// ===========================
router.get("/", async (req, res) => {
  try {
    const badges = await prisma.badge.findMany({
      select: {
        id: true,
        code: true,
        name: true,
        description: true,
        pointsBonus: true,
      },
      orderBy: { name: "asc" },
    });

    return res.json(badges);
  } catch (err) {
    return res.status(500).json({ message: "Error fetching badges", error: err.message });
  }
});

// ===========================
// GET /api/badges/my
// Protected: logged-in user's earned badges
// Header: Authorization: Bearer <TOKEN>
// ===========================
router.get("/my", requireAuth, async (req, res) => {
  try {
    const userId = req.user.sub;

    const earned = await prisma.userBadge.findMany({
      where: { userId },
      select: {
        id: true,
        awardedAt: true,
        badge: {
          select: {
            id: true,
            code: true,
            name: true,
            description: true,
            pointsBonus: true,
          },
        },
      },
      orderBy: { awardedAt: "desc" },
    });

    return res.json(earned);
  } catch (err) {
    return res.status(500).json({ message: "Error fetching my badges", error: err.message });
  }
});

module.exports = router;
