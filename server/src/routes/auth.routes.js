<<<<<<< HEAD
const router = require("express").Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const prisma = require("../prisma");
const { requireAuth } = require("../middleware/auth");

function signToken(user) {
  return jwt.sign(
    { sub: user.id, role: user.role, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

router.post("/register", async (req, res) => {
  try {
    const { fullName, email, password, role } = req.body;
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "fullName, email, password required" });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ message: "Email already exists" });

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { fullName, email, passwordHash, role: role || "STUDENT" },
      select: { id: true, fullName: true, email: true, role: true, totalPoints: true, level: true, createdAt: true }
    });

    const token = signToken(user);
    res.status(201).json({ user, token });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: String(err) });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "email and password required" });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    const token = signToken(user);

    res.json({
      user: { id: user.id, fullName: user.fullName, email: user.email, role: user.role, totalPoints: user.totalPoints, level: user.level },
      token
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: String(err) });
  }
});

router.get("/me", requireAuth, async (req, res) => {
  const me = await prisma.user.findUnique({
    where: { id: req.user.sub },
    select: { id: true, fullName: true, email: true, role: true, totalPoints: true, level: true, createdAt: true }
  });
  res.json({ user: me });
});

module.exports = router;
=======
const router = require("express").Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const prisma = require("../prisma");
const { requireAuth } = require("../middleware/auth");

function signToken(user) {
  return jwt.sign(
    { sub: user.id, role: user.role, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

router.post("/register", async (req, res) => {
  try {
    const { fullName, email, password, role } = req.body;
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "fullName, email, password required" });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ message: "Email already exists" });

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { fullName, email, passwordHash, role: role || "STUDENT" },
      select: { id: true, fullName: true, email: true, role: true, totalPoints: true, level: true, createdAt: true }
    });

    const token = signToken(user);
    res.status(201).json({ user, token });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: String(err) });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "email and password required" });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    const token = signToken(user);

    res.json({
      user: { id: user.id, fullName: user.fullName, email: user.email, role: user.role, totalPoints: user.totalPoints, level: user.level },
      token
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: String(err) });
  }
});

router.get("/me", requireAuth, async (req, res) => {
  const me = await prisma.user.findUnique({
    where: { id: req.user.sub },
    select: { id: true, fullName: true, email: true, role: true, totalPoints: true, level: true, createdAt: true }
  });
  res.json({ user: me });
});

module.exports = router;
>>>>>>> 0ad2d58b43f9bd9354ef25eb60d7b8f51ecbfe20
