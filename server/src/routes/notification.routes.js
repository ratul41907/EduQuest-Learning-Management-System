// Path: E:\EduQuest\server\src\routes\notification.routes.js

const router = require("express").Router();
const prisma = require("../prisma");
const { requireAuth } = require("../middleware/auth");

// =========================================
// GET /api/notifications
// Student: get my notifications
// =========================================
router.get("/", requireAuth, async (req, res) => {
  try {
    const userId = req.user.sub;

    if (!userId) {
      return res.status(400).json({ message: "User ID missing from token." });
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

// =========================================
// PATCH /api/notifications/read-all
// Mark all notifications as read
// IMPORTANT: must stay above /:id routes
// =========================================
router.patch("/read-all", requireAuth, async (req, res) => {
  try {
    const userId = req.user.sub;

    await prisma.notification.updateMany({
      where: { userId: String(userId), isRead: false },
      data: { isRead: true },
    });

    res.json({ message: "All notifications marked as read" });
  } catch (err) {
    res.status(500).json({ message: "Error marking as read", error: err.message });
  }
});

// =========================================
// PATCH /api/notifications/:id/read
// Mark single notification as read
// =========================================
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

    res.json({ message: "Notification marked as read" });
  } catch (err) {
    res.status(500).json({ message: "Error", error: err.message });
  }
});

// =========================================
// DELETE /api/notifications/:id
// NEW: Delete a single notification (owner only)
// =========================================
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const userId = req.user.sub;
    const { id } = req.params;

    // Only delete if it belongs to this user
    const deleted = await prisma.notification.deleteMany({
      where: { id, userId: String(userId) },
    });

    if (deleted.count === 0) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.json({ message: "Notification deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting notification", error: err.message });
  }
});

// =========================================
// DEBUG: POST /api/notifications/seed
// Manual test — creates a test notification
// Remove this in production
// =========================================
router.post("/seed", requireAuth, async (req, res) => {
  try {
    const userId = req.user.sub;
    const noti = await prisma.notification.create({
      data: {
        userId: String(userId),
        type: "WELCOME",
        title: "Hello!",
        message: "Your notification system is working.",
      },
    });
    res.json(noti);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;