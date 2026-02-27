// Path: E:\EduQuest\server\src\routes\v2\auth.routes.js

const router = require("express").Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const prisma = require("../../prisma");
const { requireAuth } = require("../../middleware/auth");
const { validate } = require("../../middleware/validate");
const { sendWelcomeEmail, sendPasswordResetEmail } = require("../../utils/email");
const logger = require("../../config/logger");

function signToken(user) {
  return jwt.sign(
    { sub: user.id, role: user.role, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

// =========================================
// POST /api/v2/auth/register
// V2: Improved response format with metadata
// =========================================
router.post(
  "/register",
  validate({
    fullName: "required|min:2|max:100",
    email: "required|email",
    password: "required|min:6",
  }),
  async (req, res) => {
    try {
      const { fullName, email, password, role } = req.body;

      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        return res.status(409).json({
          success: false,
          error: {
            code: "EMAIL_EXISTS",
            message: "Email already exists",
          },
          timestamp: new Date().toISOString(),
        });
      }

      const passwordHash = await bcrypt.hash(password, 10);

      const user = await prisma.user.create({
        data: {
          fullName,
          email,
          passwordHash,
          role: role || "STUDENT",
        },
        select: {
          id: true,
          fullName: true,
          email: true,
          role: true,
          totalPoints: true,
          level: true,
          createdAt: true,
        },
      });

      logger.logAuth("REGISTER", user.id, user.email, true, req.ip);

      sendWelcomeEmail(user.email, user.fullName).catch(err =>
        console.error("Welcome email failed:", err)
      );

      const token = signToken(user);

      // V2 Format: Structured response with metadata
      res.status(201).json({
        success: true,
        data: {
          user,
          token,
          tokenExpiresIn: "7d",
        },
        meta: {
          version: "2.0.0",
          timestamp: new Date().toISOString(),
        },
      });
    } catch (err) {
      logger.logError(err, req);
      res.status(500).json({
        success: false,
        error: {
          code: "SERVER_ERROR",
          message: "Server error",
          details: err.message,
        },
        timestamp: new Date().toISOString(),
      });
    }
  }
);

// =========================================
// POST /api/v2/auth/login
// V2: Improved response format
// =========================================
router.post(
  "/login",
  validate({
    email: "required|email",
    password: "required",
  }),
  async (req, res) => {
    try {
      const { email, password } = req.body;

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        logger.logAuth("LOGIN_FAILED", null, email, false, req.ip);
        return res.status(401).json({
          success: false,
          error: {
            code: "INVALID_CREDENTIALS",
            message: "Invalid credentials",
          },
          timestamp: new Date().toISOString(),
        });
      }

      const ok = await bcrypt.compare(password, user.passwordHash);
      if (!ok) {
        logger.logAuth("LOGIN_FAILED", user.id, email, false, req.ip);
        return res.status(401).json({
          success: false,
          error: {
            code: "INVALID_CREDENTIALS",
            message: "Invalid credentials",
          },
          timestamp: new Date().toISOString(),
        });
      }

      logger.logAuth("LOGIN", user.id, user.email, true, req.ip);

      const token = signToken(user);

      res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            fullName: user.fullName,
            email: user.email,
            role: user.role,
            totalPoints: user.totalPoints,
            level: user.level,
          },
          token,
          tokenExpiresIn: "7d",
        },
        meta: {
          version: "2.0.0",
          timestamp: new Date().toISOString(),
        },
      });
    } catch (err) {
      logger.logError(err, req);
      res.status(500).json({
        success: false,
        error: {
          code: "SERVER_ERROR",
          message: "Server error",
          details: err.message,
        },
        timestamp: new Date().toISOString(),
      });
    }
  }
);

// =========================================
// GET /api/v2/auth/me
// V2: Enhanced with user stats
// =========================================
router.get("/me", requireAuth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.sub },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        totalPoints: true,
        level: true,
        profilePicture: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: "USER_NOT_FOUND",
          message: "User not found",
        },
        timestamp: new Date().toISOString(),
      });
    }

    // V2: Include additional stats
    const stats = await prisma.user.findUnique({
      where: { id: req.user.sub },
      select: {
        _count: {
          select: {
            enrollments: true,
            lessonProgress: true,
            quizAttempts: true,
            badges: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: {
        ...user,
        stats: {
          enrollments: stats._count.enrollments,
          lessonsCompleted: stats._count.lessonProgress,
          quizzesAttempted: stats._count.quizAttempts,
          badgesEarned: stats._count.badges,
        },
      },
      meta: {
        version: "2.0.0",
        timestamp: new Date().toISOString(),
      },
    });
  } catch (err) {
    logger.logError(err, req);
    res.status(500).json({
      success: false,
      error: {
        code: "SERVER_ERROR",
        message: "Server error",
        details: err.message,
      },
      timestamp: new Date().toISOString(),
    });
  }
});

// Copy other routes from v1 auth.routes.js with v2 format...

module.exports = router;