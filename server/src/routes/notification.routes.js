const router = require("express").Router();
const prisma = require("../prisma");
const { requireAuth } = require("../middleware/auth");

// GET /api/notifications
router.get("/", requireAuth, async (req, res) => {
  try {
    const userId = req.user.sub; // normalized in middleware above

    if (!userId) {
      return res.status(400).json({ message: "User ID missing from token. Check login logic." });
    }

    const notifications = await prisma.notification.findMany({
      where: { userId: String(userId) },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    const unreadCount = await prisma.notification.count({
      where: { userId: String(userId), isRead: false },
    });

    res.json({ unreadCount, notifications });
  } catch (err) {
    res.status(500).json({ message: "Failed to load notifications", error: err.message });
  }
});

// PATCH /api/notifications/read-all
router.patch("/read-all", requireAuth, async (req, res) => {
  try {
    const userId = req.user.sub;
    await prisma.notification.updateMany({
      where: { userId: String(userId), isRead: false },
      data: { isRead: true },
    });
    res.json({ message: "All marked as read" });
  } catch (err) {
    res.status(500).json({ message: "Error", error: err.message });
  }
});

// PATCH /api/notifications/:id/read
router.patch("/:id/read", requireAuth, async (req, res) => {
  try {
    const userId = req.user.sub;
    const { id } = req.params;

    const updated = await prisma.notification.updateMany({
      where: { id, userId: String(userId) },
      data: { isRead: true },
    });

    if (updated.count === 0) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.json({ message: "Marked as read" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DEBUG: Manual seed to verify DB connection
router.post("/seed", requireAuth, async (req, res) => {
  try {
    const userId = req.user.sub;
    const noti = await prisma.notification.create({
      data: {
        userId: String(userId),
        type: "WELCOME",
        title: "Hello!",
        message: "Your notification system is now connected.",
      }
    });
    res.json(noti);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;