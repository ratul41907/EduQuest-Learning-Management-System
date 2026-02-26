// Path: E:\EduQuest\server\src\routes\notification.routes.js

const router = require("express").Router();
const prisma = require("../prisma");
const { requireAuth } = require("../middleware/auth");
const { validate } = require("../middleware/validate");
const { sendNotificationToUser } = require("../config/socket"); // Day 20

// =========================================
// GET /api/notifications/my
// Get current user's notifications
// =========================================
router.get("/my", requireAuth, async (req, res) => {
  try {
    const { unreadOnly } = req.query;

    const where = { userId: req.user.sub };
    if (unreadOnly === "true") {
      where.isRead = false;
    }

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    const unreadCount = await prisma.notification.count({
      where: { userId: req.user.sub, isRead: false },
    });

    return res.json({
      notifications,
      unreadCount,
      total: notifications.length,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Error fetching notifications",
      error: err.message,
    });
  }
});

// =========================================
// POST /api/notifications
// Create a notification (Admin/Instructor)
// Day 20: Added WebSocket real-time delivery
// =========================================
router.post(
  "/",
  requireAuth,
  validate({
    userId: "required",
    title: "required|min:3|max:200",
    message: "required|min:3|max:500",
  }),
  async (req, res) => {
    try {
      if (req.user.role !== "ADMIN" && req.user.role !== "INSTRUCTOR") {
        return res.status(403).json({ message: "Access denied" });
      }

      const { userId, courseId, type, title, message } = req.body;

      const notification = await prisma.notification.create({
        data: {
          userId,
          courseId: courseId || null,
          type: type || "INFO",
          title,
          message,
          isRead: false,
        },
      });

      // Day 20: Send real-time notification via WebSocket
      sendNotificationToUser(notification.userId, {
        id: notification.id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        courseId: notification.courseId,
        timestamp: notification.createdAt,
        isRead: false,
      });

      return res.status(201).json(notification);
    } catch (err) {
      return res.status(500).json({
        message: "Error creating notification",
        error: err.message,
      });
    }
  }
);

// =========================================
// PATCH /api/notifications/:id/read
// Mark notification as read
// =========================================
router.patch("/:id/read", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    if (notification.userId !== req.user.sub) {
      return res.status(403).json({ message: "Not your notification" });
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });

    return res.json(updated);
  } catch (err) {
    return res.status(500).json({
      message: "Error updating notification",
      error: err.message,
    });
  }
});

// =========================================
// PATCH /api/notifications/mark-all-read
// Mark all notifications as read
// =========================================
router.patch("/mark-all-read", requireAuth, async (req, res) => {
  try {
    const result = await prisma.notification.updateMany({
      where: {
        userId: req.user.sub,
        isRead: false,
      },
      data: { isRead: true },
    });

    return res.json({
      message: "All notifications marked as read",
      count: result.count,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Error marking notifications as read",
      error: err.message,
    });
  }
});

// =========================================
// DELETE /api/notifications/:id
// Delete a notification
// =========================================
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    if (notification.userId !== req.user.sub && req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Not authorized" });
    }

    await prisma.notification.delete({ where: { id } });

    return res.json({ message: "Notification deleted" });
  } catch (err) {
    return res.status(500).json({
      message: "Error deleting notification",
      error: err.message,
    });
  }
});

// =========================================
// GET /api/notifications (Admin only)
// Get all notifications
// =========================================
router.get("/", requireAuth, async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Admin only" });
    }

    const { userId, type, isRead, limit = 100 } = req.query;

    const where = {};
    if (userId) where.userId = userId;
    if (type) where.type = type;
    if (isRead !== undefined) where.isRead = isRead === "true";

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: Math.min(parseInt(limit), 500),
      include: {
        user: {
          select: { id: true, fullName: true, email: true },
        },
      },
    });

    return res.json({
      notifications,
      total: notifications.length,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Error fetching notifications",
      error: err.message,
    });
  }
});

module.exports = router;