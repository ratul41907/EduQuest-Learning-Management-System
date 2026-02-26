// Path: E:\EduQuest\server\src\config\socket.js

const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const logger = require("./logger");

let io;

// Store online users: { userId: socketId }
const onlineUsers = new Map();

// Store socket to user mapping: { socketId: userId }
const socketToUser = new Map();

/**
 * Initialize Socket.io server
 * @param {http.Server} server - HTTP server instance
 */
function initializeSocket(server) {
  io = new Server(server, {
    cors: {
      origin: process.env.ALLOWED_ORIGINS?.split(",") || ["http://localhost:3000", "http://localhost:5173"],
      methods: ["GET", "POST"],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // ══════════════════════════════════════════════════════════════
  // AUTHENTICATION MIDDLEWARE
  // ══════════════════════════════════════════════════════════════
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace("Bearer ", "");

      if (!token) {
        return next(new Error("Authentication token required"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.sub;
      socket.userRole = decoded.role;
      socket.userEmail = decoded.email;

      logger.info("Socket authenticated", {
        socketId: socket.id,
        userId: socket.userId,
        role: socket.userRole,
      });

      next();
    } catch (err) {
      logger.error("Socket authentication failed", {
        socketId: socket.id,
        error: err.message,
      });
      next(new Error("Authentication failed"));
    }
  });

  // ══════════════════════════════════════════════════════════════
  // CONNECTION HANDLER
  // ══════════════════════════════════════════════════════════════
  io.on("connection", (socket) => {
    const userId = socket.userId;

    // Add user to online users
    onlineUsers.set(userId, socket.id);
    socketToUser.set(socket.id, userId);

    logger.info("User connected", {
      socketId: socket.id,
      userId,
      totalOnline: onlineUsers.size,
    });

    // Notify all clients about online users update
    io.emit("online-users", Array.from(onlineUsers.keys()));

    // ══════════════════════════════════════════════════════════════
    // JOIN COURSE ROOM
    // ══════════════════════════════════════════════════════════════
    socket.on("join-course", (courseId) => {
      socket.join(`course:${courseId}`);
      logger.info("User joined course room", {
        userId,
        courseId,
        socketId: socket.id,
      });

      // Notify others in the room
      socket.to(`course:${courseId}`).emit("user-joined-course", {
        userId,
        courseId,
        timestamp: new Date(),
      });
    });

    // ══════════════════════════════════════════════════════════════
    // LEAVE COURSE ROOM
    // ══════════════════════════════════════════════════════════════
    socket.on("leave-course", (courseId) => {
      socket.leave(`course:${courseId}`);
      logger.info("User left course room", {
        userId,
        courseId,
      });

      // Notify others in the room
      socket.to(`course:${courseId}`).emit("user-left-course", {
        userId,
        courseId,
        timestamp: new Date(),
      });
    });

    // ══════════════════════════════════════════════════════════════
    // TYPING INDICATOR
    // ══════════════════════════════════════════════════════════════
    socket.on("typing", ({ courseId, isTyping }) => {
      socket.to(`course:${courseId}`).emit("user-typing", {
        userId,
        courseId,
        isTyping,
      });
    });

    // ══════════════════════════════════════════════════════════════
    // COURSE MESSAGE (CHAT)
    // ══════════════════════════════════════════════════════════════
    socket.on("course-message", ({ courseId, message }) => {
      const messageData = {
        userId,
        courseId,
        message,
        timestamp: new Date(),
        socketId: socket.id,
      };

      // Broadcast to everyone in the course room (including sender)
      io.to(`course:${courseId}`).emit("course-message", messageData);

      logger.info("Course message sent", {
        userId,
        courseId,
        messageLength: message.length,
      });
    });

    // ══════════════════════════════════════════════════════════════
    // MARK NOTIFICATION AS READ
    // ══════════════════════════════════════════════════════════════
    socket.on("mark-notification-read", (notificationId) => {
      logger.info("Notification marked as read", {
        userId,
        notificationId,
      });
    });

    // ══════════════════════════════════════════════════════════════
    // DISCONNECTION HANDLER
    // ══════════════════════════════════════════════════════════════
    socket.on("disconnect", (reason) => {
      onlineUsers.delete(userId);
      socketToUser.delete(socket.id);

      logger.info("User disconnected", {
        socketId: socket.id,
        userId,
        reason,
        totalOnline: onlineUsers.size,
      });

      // Notify all clients about online users update
      io.emit("online-users", Array.from(onlineUsers.keys()));
    });

    // ══════════════════════════════════════════════════════════════
    // ERROR HANDLER
    // ══════════════════════════════════════════════════════════════
    socket.on("error", (error) => {
      logger.error("Socket error", {
        socketId: socket.id,
        userId,
        error: error.message,
      });
    });
  });

  logger.info("Socket.io server initialized");
  return io;
}

/**
 * Get Socket.io instance
 */
function getIO() {
  if (!io) {
    throw new Error("Socket.io not initialized. Call initializeSocket first.");
  }
  return io;
}

/**
 * Send notification to specific user
 * @param {string} userId - Target user ID
 * @param {object} notification - Notification data
 */
function sendNotificationToUser(userId, notification) {
  try {
    const socketId = onlineUsers.get(userId);
    if (socketId) {
      io.to(socketId).emit("notification", notification);
      logger.info("Notification sent to user", {
        userId,
        notificationType: notification.type,
      });
      return true;
    }
    return false; // User offline
  } catch (err) {
    logger.error("Error sending notification", {
      userId,
      error: err.message,
    });
    return false;
  }
}

/**
 * Broadcast notification to all users in a course
 * @param {string} courseId - Course ID
 * @param {object} notification - Notification data
 */
function sendNotificationToCourse(courseId, notification) {
  try {
    io.to(`course:${courseId}`).emit("course-notification", notification);
    logger.info("Notification sent to course", {
      courseId,
      notificationType: notification.type,
    });
  } catch (err) {
    logger.error("Error sending course notification", {
      courseId,
      error: err.message,
    });
  }
}

/**
 * Get list of online user IDs
 */
function getOnlineUsers() {
  return Array.from(onlineUsers.keys());
}

/**
 * Check if user is online
 * @param {string} userId
 */
function isUserOnline(userId) {
  return onlineUsers.has(userId);
}

/**
 * Get online user count
 */
function getOnlineUserCount() {
  return onlineUsers.size;
}

module.exports = {
  initializeSocket,
  getIO,
  sendNotificationToUser,
  sendNotificationToCourse,
  getOnlineUsers,
  isUserOnline,
  getOnlineUserCount,
};