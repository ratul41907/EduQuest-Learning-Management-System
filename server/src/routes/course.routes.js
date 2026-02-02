const router = require("express").Router();
const prisma = require("../prisma");
const { requireAuth } = require("../middleware/auth");

// ===========================
// 1) GET /api/courses/my
// Student: list my enrolled courses (MUST be above "/:id")
// Header: Authorization: Bearer <STUDENT_TOKEN>
// ===========================
router.get("/my", requireAuth, async (req, res) => {
  try {
    const userId = req.user.sub;

    const enrollments = await prisma.enrollment.findMany({
      where: { userId },
      include: {
        course: {
          include: { instructor: { select: { fullName: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const myCourses = enrollments.map((e) => ({
      ...e.course,
      progress: e.progress,
      enrolledAt: e.createdAt,
    }));

    return res.json(myCourses);
  } catch (err) {
    return res.status(500).json({
      message: "Error fetching enrolled courses",
      error: err.message,
    });
  }
});

// ===========================
// 2) GET /api/courses
// Public: list all courses
// ===========================
router.get("/", async (req, res) => {
  try {
    const courses = await prisma.course.findMany({
      orderBy: { createdAt: "desc" },
      include: { instructor: { select: { fullName: true } } },
    });
    return res.json(courses);
  } catch (err) {
    return res.status(500).json({ message: "Error fetching courses", error: err.message });
  }
});

// ===========================
// 3) POST /api/courses
// Instructor: create a course
// Header: Authorization: Bearer <INSTRUCTOR_TOKEN>
// Body: { title, description, price, level }
// ===========================
router.post("/", requireAuth, async (req, res) => {
  try {
    if (req.user.role !== "INSTRUCTOR") {
      return res.status(403).json({ message: "Access denied (Instructor only)" });
    }

    const { title, description, price, level } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: "title and description are required" });
    }

    const course = await prisma.course.create({
      data: {
        title,
        description,
        price: Number(price ?? 0),
        level: Number(level ?? 1),
        instructorId: req.user.sub,
      },
    });

    return res.status(201).json(course);
  } catch (err) {
    return res.status(500).json({ message: "Error creating course", error: err.message });
  }
});

// ===========================
// 4) GET /api/courses/:id
// Public: course details
// ===========================
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        instructor: { select: { fullName: true, email: true } },
        quizzes: { select: { id: true, title: true, passScore: true } },
      },
    });

    if (!course) return res.status(404).json({ message: "Course not found" });
    return res.json(course);
  } catch (err) {
    return res.status(500).json({ message: "Error fetching course", error: err.message });
  }
});

// ===========================
// 5) POST /api/courses/:id/enroll
// Student: enroll into course
// Header: Authorization: Bearer <STUDENT_TOKEN>
// ===========================
router.post("/:id/enroll", requireAuth, async (req, res) => {
  const { id: courseId } = req.params;

  try {
    if (req.user.role !== "STUDENT") {
      return res.status(403).json({ message: "Only students can enroll" });
    }

    const userId = req.user.sub;

    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) return res.status(404).json({ message: "Course not found" });

    // Upsert = if already enrolled, just return it (no 400)
    const enrollment = await prisma.enrollment.upsert({
      where: { userId_courseId: { userId, courseId } },
      update: {},
      create: { userId, courseId, progress: 0 },
    });

    return res.status(201).json(enrollment);
  } catch (err) {
    return res.status(500).json({ message: "Enrollment error", error: err.message });
  }
});

// ===========================
// 6) PATCH /api/courses/:id/progress
// Student: update progress (0-100)
// Header: Authorization: Bearer <STUDENT_TOKEN>
// Body: { "progress": 50 }
// ===========================
router.patch("/:id/progress", requireAuth, async (req, res) => {
  const { id: courseId } = req.params;

  try {
    if (req.user.role !== "STUDENT") {
      return res.status(403).json({ message: "Only students can update progress" });
    }

    const userId = req.user.sub;
    const progressRaw = req.body.progress;

    if (progressRaw === undefined || progressRaw === null) {
      return res.status(400).json({ message: "progress is required" });
    }

    const progress = Number(progressRaw);
    if (Number.isNaN(progress) || progress < 0 || progress > 100) {
      return res.status(400).json({ message: "progress must be a number between 0 and 100" });
    }

    // If not enrolled, return 400 (NOT 500)
    const existing = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });

    if (!existing) {
      return res.status(400).json({ message: "You are not enrolled in this course" });
    }

    const updatedEnrollment = await prisma.enrollment.update({
      where: { userId_courseId: { userId, courseId } },
      data: { progress },
    });

    return res.json({
      message: "Progress saved!",
      progress: updatedEnrollment.progress,
    });
  } catch (err) {
    return res.status(500).json({ message: "Failed to update progress", error: err.message });
  }
});

module.exports = router;
