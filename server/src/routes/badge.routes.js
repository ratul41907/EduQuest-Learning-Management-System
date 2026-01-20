// Path: E:\EduQuest\server\src\routes\badge.routes.js
const router = require("express").Router();
const prisma = require("../prisma");
const { requireAuth } = require("../middleware/auth");

// GET /api/badges - List all badges
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
    });

    return res.json(badges);
  } catch (err) {
    return res.status(500).json({ message: "Error fetching badges", error: err.message });
  }
});

// POST /api/badges - Create a new badge (Instructor only)
router.post("/", requireAuth, async (req, res) => {
  if (req.user.role !== "INSTRUCTOR") {
    return res.status(403).json({ message: "Access denied" });
  }

  const { code, name, description, pointsBonus } = req.body;

  try {
    const badge = await prisma.badge.create({
      data: {
        code,
        name,
        description,
        pointsBonus,
      },
    });

    return res.status(201).json(badge);
  } catch (err) {
    return res.status(500).json({ message: "Error creating badge", error: err.message });
  }
});

module.exports = router;  // Export the router to be used in app.js
