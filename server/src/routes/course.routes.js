// Path: E:\EduQuest\server\src\routes\course.routes.js

const router = require("express").Router();
const prisma = require("../prisma");
const { requireAuth } = require("../middleware/auth");

// ===========================
// GET /api/courses
// Public: list all courses
// ===========================
router.get("/", async (req, res) => {
  try {
    const courses = await prisma.course.findMany({
      select: {
        id: true,
        title: true,
        description: true,
        price: true,
        level: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return res.json(courses);
  } catch (err) {
    return res.status(500).json({ message: "Error fetching courses", error: err.message });
  }
});

// ===========================
// POST /api/courses
// Instructor only: create course
// ===========================
router.post("/", requireAuth, async (req, res) => {
  const { title, description, price, level } = req.body;

  if (req.user.role !== "INSTRUCTOR") {
    return res.status(403).json({ message: "Access denied" });
  }

  if (!title || !description) {
    return res.status(400).json({ message: "title and description required" });
  }

  try {
    const course = await prisma.course.create({
      data: {
        title,
        description,
        price: typeof price === "number" ? price : Number(price || 0),
        level: typeof level === "number" ? level : Number(level || 1),
        instructorId: req.user.sub,
      },
      select: {
        id: true,
        title: true,
        description: true,
        price: true,
        level: true,
        instructorId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return res.status(201).json(course);
  } catch (err) {
    return res.status(500).json({ message: "Error creating course", error: err.message });
  }
});

// ===========================
// GET /api/courses/:id
// Public: course details (includes instructor)
// ===========================
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const course = await prisma.course.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        description: true,
        price: true,
        level: true,
        createdAt: true,
        updatedAt: true,
        instructor: {
          select: { id: true, fullName: true, email: true },
        },
      },
    });

    if (!course) return res.status(404).json({ message: "Course not found" });

    return res.json(course);
  } catch (err) {
    return res.status(500).json({ message: "Error fetching course details", error: err.message });
  }
});

// ===========================
// POST /api/courses/:id/enroll
// Student only: enroll in a course
// ===========================
router.post("/:id/enroll", requireAuth, async (req, res) => {
  const { id } = req.params;

  try {
    if (req.user.role !== "STUDENT") {
      return res.status(403).json({ message: "Only students can enroll" });
    }

    // Check course exists
    const course = await prisma.course.findUnique({ where: { id } });
    if (!course) return res.status(404).json({ message: "Course not found" });

    // Check already enrolled
    const existingEnrollment = await prisma.enrollment.findFirst({
      where: { courseId: id, userId: req.user.sub },
    });

    if (existingEnrollment) {
      return res.status(400).json({ message: "Already enrolled in this course" });
    }

    const enrollment = await prisma.enrollment.create({
      data: {
        courseId: id,
        userId: req.user.sub,
        progress: 0,
      },
      select: {
        id: true,
        userId: true,
        courseId: true,
        progress: true,
        createdAt: true,
      },
    });

    return res.status(201).json(enrollment);
  } catch (err) {
    return res.status(500).json({ message: "Error enrolling in course", error: err.message });
  }
});

// ===========================
// PATCH /api/courses/:id/progress
// Student only: update progress (0..100)
// Requires enrollment first
// ===========================
router.patch("/:id/progress", requireAuth, async (req, res) => {
  const { id } = req.params;
  const { progress } = req.body;

  try {
    if (req.user.role !== "STUDENT") {
      return res.status(403).json({ message: "Only students can update progress" });
    }

    // validate progress
    const parsed = Number(progress);
    if (Number.isNaN(parsed)) {
      return res.status(400).json({ message: "progress must be a number" });
    }
    const bounded = Math.max(0, Math.min(100, parsed));

    // Must be enrolled
    const enrollment = await prisma.enrollment.findFirst({
      where: { courseId: id, userId: req.user.sub },
    });

    if (!enrollment) {
      return res.status(400).json({ message: "You are not enrolled in this course" });
    }

    const updated = await prisma.enrollment.update({
      where: { id: enrollment.id },
      data: { progress: bounded },
      select: {
        id: true,
        userId: true,
        courseId: true,
        progress: true,
        createdAt: true,
      },
    });

    return res.json(updated);
  } catch (err) {
    return res.status(500).json({ message: "Error updating progress", error: err.message });
  }
});

module.exports = router;
