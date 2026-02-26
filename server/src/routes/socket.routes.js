// Path: E:\EduQuest\server\src\routes\socket.routes.js

const router = require("express").Router();
const { requireAuth } = require("../middleware/auth");
const { 
  getOnlineUsers, 
  isUserOnline, 
  getOnlineUserCount,
  sendNotificationToUser 
} = require("../config/socket");

// =========================================
// GET /api/socket/online-users
// Get list of online user IDs
// =========================================
router.get("/online-users", requireAuth, (req, res) => {
  try {
    const onlineUsers = getOnlineUsers();
    return res.json({
      count: onlineUsers.length,
      users: onlineUsers,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Error fetching online users",
      error: err.message,
    });
  }
});

// =========================================
// GET /api/socket/status
// Get WebSocket server status
// =========================================
router.get("/status", (req, res) => {
  try {
    const onlineCount = getOnlineUserCount();
    return res.json({
      status: "connected",
      onlineUsers: onlineCount,
      timestamp: new Date(),
    });
  } catch (err) {
    return res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
});

// =========================================
// GET /api/socket/user/:userId/online
// Check if specific user is online
// =========================================
router.get("/user/:userId/online", requireAuth, (req, res) => {
  try {
    const { userId } = req.params;
    const online = isUserOnline(userId);
    return res.json({
      userId,
      online,
      timestamp: new Date(),
    });
  } catch (err) {
    return res.status(500).json({
      message: "Error checking user status",
      error: err.message,
    });
  }
});

// =========================================
// POST /api/socket/test-notification
// Test sending a notification (Admin only)
// =========================================
router.post("/test-notification", requireAuth, (req, res) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Admin only" });
    }

    const { userId, title, message } = req.body;

    if (!userId || !title || !message) {
      return res.status(400).json({
        message: "userId, title, and message are required",
      });
    }

    const sent = sendNotificationToUser(userId, {
      id: `test-${Date.now()}`,
      type: "TEST",
      title,
      message,
      timestamp: new Date(),
    });

    return res.json({
      sent,
      message: sent ? "Notification sent" : "User offline",
      userId,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Error sending notification",
      error: err.message,
    });
  }
});

module.exports = router;