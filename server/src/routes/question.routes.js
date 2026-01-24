// Path: E:\EduQuest\server\src\routes\question.routes.js

const router = require("express").Router();
const prisma = require("../prisma");
const { requireAuth } = require("../middleware/auth");

// =====================================================
// POST /api/questions/:quizId
// Instructor only: create a question under a quiz
// =====================================================
router.post("/:quizId", requireAuth, async (req, res) => {
  const { quizId } = req.params;
  const { prompt, optionA, optionB, optionC, optionD, correct, points } = req.body;

  try {
    if (req.user.role !== "INSTRUCTOR") {
      return res.status(403).json({ message: "Access denied" });
    }

    // basic validation
    if (!prompt || !optionA || !optionB || !optionC || !optionD || !correct) {
      return res.status(400).json({
        message: "prompt, optionA, optionB, optionC, optionD, correct are required",
      });
    }

    const normalizedCorrect = String(correct).toUpperCase();
    if (!["A", "B", "C", "D"].includes(normalizedCorrect)) {
      return res.status(400).json({ message: 'correct must be one of "A","B","C","D"' });
    }

    // check quiz exists
    const quiz = await prisma.quiz.findUnique({ where: { id: quizId } });
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });

    const created = await prisma.question.create({
      data: {
        quizId,
        prompt,
        optionA,
        optionB,
        optionC,
        optionD,
        correct: normalizedCorrect,
        points: points != null ? Number(points) : 10,
      },
      select: {
        id: true,
        quizId: true,
        prompt: true,
        optionA: true,
        optionB: true,
        optionC: true,
        optionD: true,
        correct: true,
        points: true,
      },
    });

    return res.status(201).json(created);
  } catch (err) {
    return res.status(500).json({ message: "Error creating question", error: err.message });
  }
});

// =====================================================
// GET /api/questions/quiz/:quizId
// Public: list questions for a quiz
// (Includes correct by default; if you want to hide it later,
// we can create a student-safe endpoint.)
// =====================================================
router.get("/quiz/:quizId", async (req, res) => {
  const { quizId } = req.params;

  try {
    const questions = await prisma.question.findMany({
      where: { quizId },
      select: {
        id: true,
        quizId: true,
        prompt: true,
        optionA: true,
        optionB: true,
        optionC: true,
        optionD: true,
        correct: true,
        points: true,
      },
      orderBy: { id: "asc" },
    });

    return res.json(questions);
  } catch (err) {
    return res.status(500).json({ message: "Error fetching questions", error: err.message });
  }
});

// =====================================================
// GET /api/questions/:id
// Public: get single question
// =====================================================
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const question = await prisma.question.findUnique({
      where: { id },
      select: {
        id: true,
        quizId: true,
        prompt: true,
        optionA: true,
        optionB: true,
        optionC: true,
        optionD: true,
        correct: true,
        points: true,
      },
    });

    if (!question) return res.status(404).json({ message: "Question not found" });
    return res.json(question);
  } catch (err) {
    return res.status(500).json({ message: "Error fetching question", error: err.message });
  }
});

// =====================================================
// PATCH /api/questions/:id
// Instructor only: update a question
// =====================================================
router.patch("/:id", requireAuth, async (req, res) => {
  const { id } = req.params;
  const { correct, points, ...rest } = req.body;

  try {
    if (req.user.role !== "INSTRUCTOR") {
      return res.status(403).json({ message: "Access denied" });
    }

    const data = { ...rest };

    if (correct != null) {
      const normalizedCorrect = String(correct).toUpperCase();
      if (!["A", "B", "C", "D"].includes(normalizedCorrect)) {
        return res.status(400).json({ message: 'correct must be one of "A","B","C","D"' });
      }
      data.correct = normalizedCorrect;
    }

    if (points != null) {
      data.points = Number(points);
    }

    const updated = await prisma.question.update({
      where: { id },
      data,
      select: {
        id: true,
        quizId: true,
        prompt: true,
        optionA: true,
        optionB: true,
        optionC: true,
        optionD: true,
        correct: true,
        points: true,
      },
    });

    return res.json(updated);
  } catch (err) {
    return res.status(500).json({ message: "Error updating question", error: err.message });
  }
});

// =====================================================
// DELETE /api/questions/:id
// Instructor only: delete a question
// =====================================================
router.delete("/:id", requireAuth, async (req, res) => {
  const { id } = req.params;

  try {
    if (req.user.role !== "INSTRUCTOR") {
      return res.status(403).json({ message: "Access denied" });
    }

    await prisma.question.delete({ where: { id } });
    return res.json({ message: "Question deleted successfully" });
  } catch (err) {
    return res.status(500).json({ message: "Error deleting question", error: err.message });
  }
});

module.exports = router;
