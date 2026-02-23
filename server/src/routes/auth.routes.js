// Path: E:\EduQuest\server\src\routes\auth.routes.js

const router = require("express").Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const prisma = require("../prisma");
const { requireAuth } = require("../middleware/auth");
const { validate } = require("../middleware/validate");
const { sendWelcomeEmail, sendPasswordResetEmail } = require("../utils/email");
const logger = require("../config/logger");

function signToken(user) {
  return jwt.sign(
    { sub: user.id, role: user.role, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

// =========================================
// POST /api/auth/register
// =========================================
router.post(
  "/register",
  validate({
    fullName: "required|min:2|max:100",
    email:    "required|email",
    password: "required|min:6",
  }),
  async (req, res) => {
    try {
      const { fullName, email, password, role } = req.body;

      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        logger.logAuth("REGISTER_FAILED", null, email, false, req.ip);
        return res.status(409).json({ message: "Email already exists" });
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

      // Day 18: Log successful registration
      logger.logAuth("REGISTER", user.id, user.email, true, req.ip);

      // Day 16: send welcome email (non-blocking)
      sendWelcomeEmail(user.email, user.fullName).catch(err => 
        console.error("Welcome email failed:", err)
      );

      const token = signToken(user);
      res.status(201).json({ user, token });
    } catch (err) {
      logger.logError(err, req);
      res.status(500).json({ message: "Server error", error: String(err) });
    }
  }
);

// =========================================
// POST /api/auth/login
// =========================================
router.post(
  "/login",
  validate({
    email:    "required|email",
    password: "required",
  }),
  async (req, res) => {
    try {
      const { email, password } = req.body;

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        logger.logAuth("LOGIN_FAILED", null, email, false, req.ip);
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const ok = await bcrypt.compare(password, user.passwordHash);
      if (!ok) {
        logger.logAuth("LOGIN_FAILED", user.id, email, false, req.ip);
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Day 18: Log successful login
      logger.logAuth("LOGIN", user.id, user.email, true, req.ip);

      const token = signToken(user);

      res.json({
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          totalPoints: user.totalPoints,
          level: user.level,
        },
        token,
      });
    } catch (err) {
      logger.logError(err, req);
      res.status(500).json({ message: "Server error", error: String(err) });
    }
  }
);

// =========================================
// GET /api/auth/me
// =========================================
router.get("/me", requireAuth, async (req, res) => {
  const me = await prisma.user.findUnique({
    where: { id: req.user.sub },
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
  res.json({ user: me });
});

// =========================================
// POST /api/auth/forgot-password
// Day 16: Request password reset
// =========================================
router.post(
  "/forgot-password",
  validate({ email: "required|email" }),
  async (req, res) => {
    try {
      const { email } = req.body;

      const user = await prisma.user.findUnique({ where: { email } });
      
      // Always return success to prevent email enumeration
      if (!user) {
        logger.info("Password reset requested for non-existent email", { email, ip: req.ip });
        return res.json({ 
          message: "If that email exists, a password reset link has been sent." 
        });
      }

      // Generate reset token (valid for 1 hour)
      const resetToken = jwt.sign(
        { sub: user.id, type: "password-reset" },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      // Day 18: Log password reset request
      logger.logAuth("PASSWORD_RESET_REQUESTED", user.id, user.email, true, req.ip);

      // Send password reset email
      sendPasswordResetEmail(user.email, user.fullName, resetToken).catch(err =>
        console.error("Password reset email failed:", err)
      );

      return res.json({ 
        message: "If that email exists, a password reset link has been sent." 
      });
    } catch (err) {
      logger.logError(err, req);
      return res.status(500).json({ 
        message: "Server error", 
        error: String(err) 
      });
    }
  }
);

// =========================================
// POST /api/auth/reset-password
// Day 16: Reset password with token
// =========================================
router.post(
  "/reset-password",
  validate({ 
    token: "required",
    newPassword: "required|min:6" 
  }),
  async (req, res) => {
    try {
      const { token, newPassword } = req.body;

      // Verify token
      let decoded;
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.type !== "password-reset") {
          return res.status(400).json({ message: "Invalid reset token" });
        }
      } catch (err) {
        return res.status(400).json({ message: "Invalid or expired reset token" });
      }

      // Hash new password
      const passwordHash = await bcrypt.hash(newPassword, 10);

      // Update password
      await prisma.user.update({
        where: { id: decoded.sub },
        data: { passwordHash },
      });

      // Day 18: Log password reset completion
      logger.logAuth("PASSWORD_RESET_COMPLETED", decoded.sub, "N/A", true, req.ip);

      return res.json({ message: "Password reset successful. You can now login." });
    } catch (err) {
      logger.logError(err, req);
      return res.status(500).json({ 
        message: "Server error", 
        error: String(err) 
      });
    }
  }
);

module.exports = router;