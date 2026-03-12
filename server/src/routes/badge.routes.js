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

// ===========================
// GET /api/badges/my-badges (v2 format)
// Protected: for frontend compatibility
// ===========================
router.get("/my-badges", requireAuth, async (req, res) => {
  try {
    const userId = req.user.sub;
    
    const userBadges = await prisma.userBadge.findMany({
      where: { userId },
      include: {
        badge: true,
      },
      orderBy: { awardedAt: 'desc' },
    });

    const badges = userBadges.map(ub => ({
      ...ub.badge,
      awardedAt: ub.awardedAt,
    }));

    res.json({ badges });
  } catch (error) {
    console.error('Error fetching my badges:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;