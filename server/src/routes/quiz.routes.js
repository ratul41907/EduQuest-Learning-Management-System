// Path: E:\EduQuest\server\src\routes\quiz.routes.js

const router = require("express").Router();
const prisma = require("../prisma");
const { requireAuth } = require("../middleware/auth");

// ===========================
// POST /api/courses/:courseId/quizzes - Create a new quiz (Instructor only)
// ===========================
router.post("/:courseId", requireAuth, async (req, res) => {
  const { title, timeLimit, passScore } = req.body;
  const { courseId } = req.params;

  // Only allow Instructor role
  if (req.user.role !== "INSTRUCTOR") {
    return res.status(403).json({ message: "Access denied" });
  }

  try {
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const quiz = await prisma.quiz.create({
      data: {
        title,
        timeLimit: timeLimit || null,
        passScore: passScore || 50, // Default pass score is 50
        courseId, // Link to course
      },
    });

    return res.status(201).json(quiz);
  } catch (err) {
    return res.status(500).json({ message: "Error creating quiz", error: err.message });
  }
});

// ===========================
// GET /api/courses/:courseId/quizzes - List quizzes for a specific course
// ===========================
router.get("/:courseId", async (req, res) => {
  const { courseId } = req.params;

  try {
    const quizzes = await prisma.quiz.findMany({
      where: { courseId },
      select: {
        id: true,
        title: true,
        timeLimit: true,
        passScore: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return res.json(quizzes);
  } catch (err) {
    return res.status(500).json({ message: "Error fetching quizzes", error: err.message });
  }
});

// ===========================
// GET /api/quizzes/:id - Get a specific quiz's details
// ===========================
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const quiz = await prisma.quiz.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        timeLimit: true,
        passScore: true,
        courseId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    return res.json(quiz);
  } catch (err) {
    return res.status(500).json({ message: "Error fetching quiz details", error: err.message });
  }
});

// ===========================
// PATCH /api/quizzes/:id - Update a quiz (Instructor only)
// ===========================
router.patch("/:id", requireAuth, async (req, res) => {
  const { id } = req.params;
  const { title, timeLimit, passScore } = req.body;

  // Only allow Instructor role
  if (req.user.role !== "INSTRUCTOR") {
    return res.status(403).json({ message: "Access denied" });
  }

  try {
    const quiz = await prisma.quiz.findUnique({ where: { id } });
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    const updatedQuiz = await prisma.quiz.update({
      where: { id },
      data: {
        title,
        timeLimit,
        passScore,
      },
    });

    return res.json(updatedQuiz);
  } catch (err) {
    return res.status(500).json({ message: "Error updating quiz", error: err.message });
  }
});

// ===========================
// DELETE /api/quizzes/:id - Delete a quiz (Instructor only)
// ===========================
router.delete("/:id", requireAuth, async (req, res) => {
  const { id } = req.params;

  // Only allow Instructor role
  if (req.user.role !== "INSTRUCTOR") {
    return res.status(403).json({ message: "Access denied" });
  }

  try {
    const quiz = await prisma.quiz.findUnique({ where: { id } });
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    await prisma.quiz.delete({ where: { id } });

    return res.status(200).json({ message: "Quiz deleted successfully" });
  } catch (err) {
    return res.status(500).json({ message: "Error deleting quiz", error: err.message });
  }
});

module.exports = router;  // Export the router to be used in app.js
