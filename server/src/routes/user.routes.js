// Path: server/src/routes/user.routes.js
const router = require("express").Router();
const prisma = require("../prisma");
const { requireAuth } = require("../middleware/auth");

// GET /api/user/me: To fetch the logged-in user's profile
router.get("/me", requireAuth, async (req, res) => {
  try {
    const me = await prisma.user.findUnique({
      where: { id: req.user.sub }, // Uses ID from the JWT token
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
    
    if (!me) return res.status(404).json({ message: "User not found" });
    
    return res.json(me);
  } catch (err) {
    return res.status(500).json({ message: "Error fetching profile", error: err.message });
  }
});

module.exports = router;