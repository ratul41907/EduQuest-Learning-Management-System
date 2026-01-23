// Path: E:\EduQuest\server\src\routes\auth.routes.js

const router = require("express").Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const prisma = require("../prisma");
const { requireAuth } = require("../middleware/auth");

// Function to sign the JWT token
function signToken(user) {
  return jwt.sign(
    { sub: user.id, role: user.role, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }  // Token will expire in 7 days
  );
}

// Route for user registration (POST /register)
router.post("/register", async (req, res) => {
  try {
    const { fullName, email, password, role } = req.body;

    // Validate input fields
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "fullName, email, password required" });
    }

    // Check if email already exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ message: "Email already exists" });

    // Hash the password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create the user in the database
    const user = await prisma.user.create({
      data: { fullName, email, passwordHash, role: role || "STUDENT" },
      select: { id: true, fullName: true, email: true, role: true, totalPoints: true, level: true, createdAt: true }
    });

    // Generate the token
    const token = signToken(user);

    // Send the response with user and token
    res.status(201).json({ user, token });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: String(err) });
  }
});

// Route for user login (POST /login)
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input fields
    if (!email || !password) return res.status(400).json({ message: "email and password required" });

    // Find user by email
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    // Compare password hash
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    // Generate the token
    const token = signToken(user);

    // Send the response with user details and token
    res.json({
      user: { id: user.id, fullName: user.fullName, email: user.email, role: user.role, totalPoints: user.totalPoints, level: user.level },
      token
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: String(err) });
  }
});

// Route to get user info (GET /me)
router.get("/me", requireAuth, async (req, res) => {
  try {
    const me = await prisma.user.findUnique({
      where: { id: req.user.sub },  // Use the user's ID from the token
      select: { id: true, fullName: true, email: true, role: true, totalPoints: true, level: true, createdAt: true }
    });
    res.json({ user: me });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: String(err) });
  }
});

module.exports = router;  // Export the router to be used in app.js
