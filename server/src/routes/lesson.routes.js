const router = require("express").Router();
const prisma = require("../prisma");

// GET /api/lessons/course/:courseId
// Fetches all lessons for a specific course ordered by their position
router.get("/course/:courseId", async (req, res) => {
  const { courseId } = req.params;
  try {
    const lessons = await prisma.lesson.findMany({
      where: { courseId },
      orderBy: { orderNo: "asc" }, // Ensures lessons appear in 1, 2, 3 order
    });
    return res.json(lessons);
  } catch (err) {
    return res.status(500).json({ message: "Error fetching lessons", error: err.message });
  }
});

module.exports = router;