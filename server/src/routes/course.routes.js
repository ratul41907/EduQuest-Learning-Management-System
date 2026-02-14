const router = require("express").Router();
const prisma = require("../prisma");
const { requireAuth } = require("../middleware/auth");

router.get("/my", requireAuth, async (req, res) => {
  try {
    const userId = req.user.sub;
    const enrollments = await prisma.enrollment.findMany({
      where: { userId },
      include: { course: { include: { instructor: { select: { fullName: true } } } } },
      orderBy: { createdAt: "desc" },
    });
    const myCourses = enrollments.map((e) => ({ ...e.course, progress: e.progress, enrolledAt: e.createdAt }));
    return res.json(myCourses);
  } catch (err) {
    return res.status(500).json({ message: "Error fetching enrolled courses", error: err.message });
  }
});

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

router.post("/", requireAuth, async (req, res) => {
  try {
    if (req.user.role !== "INSTRUCTOR") return res.status(403).json({ message: "Instructor only" });
    const { title, description, price, level } = req.body;
    const course = await prisma.course.create({
      data: { title, description, price: Number(price ?? 0), level: Number(level ?? 1), instructorId: req.user.sub },
    });
    return res.status(201).json(course);
  } catch (err) {
    return res.status(500).json({ message: "Error creating course", error: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const course = await prisma.course.findUnique({
      where: { id: req.params.id },
      include: { instructor: { select: { fullName: true, email: true } }, quizzes: { select: { id: true, title: true } } },
    });
    if (!course) return res.status(404).json({ message: "Course not found" });
    return res.json(course);
  } catch (err) {
    return res.status(500).json({ message: "Error fetching course", error: err.message });
  }
});

router.post("/:id/enroll", requireAuth, async (req, res) => {
  const { id: courseId } = req.params;
  try {
    if (req.user.role !== "STUDENT") return res.status(403).json({ message: "Only students can enroll" });
    const userId = req.user.sub;
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) return res.status(404).json({ message: "Course not found" });

    // 1. Perform enrollment
    const enrollment = await prisma.enrollment.upsert({
      where: { userId_courseId: { userId, courseId } },
      update: {},
      create: { userId, courseId, progress: 0 },
    });

    // 2. --- NEW: NOTIFY INSTRUCTOR ON ENROLLMENT ---
    await prisma.notification.create({
      data: {
        userId: course.instructorId, // Instructor is the recipient
        courseId: course.id,
        type: "NEW_ENROLLMENT",
        title: "New Student Enrolled!",
        message: `A student has joined your course: ${course.title}`,
      }
    }).catch(() => {});

    return res.status(201).json(enrollment);
  } catch (err) {
    return res.status(500).json({ message: "Enrollment error", error: err.message });
  }
});

router.patch("/:id/progress", requireAuth, async (req, res) => {
  const { id: courseId } = req.params;
  try {
    if (req.user.role !== "STUDENT") return res.status(403).json({ message: "Only students can update progress" });
    const progress = Number(req.body.progress);
    if (Number.isNaN(progress) || progress < 0 || progress > 100) return res.status(400).json({ message: "Invalid progress value" });

    const updated = await prisma.enrollment.update({
      where: { userId_courseId: { userId: req.user.sub, courseId } },
      data: { progress },
    });
    return res.json({ message: "Progress saved!", progress: updated.progress });
  } catch (err) {
    return res.status(500).json({ message: "Failed to update progress", error: err.message });
  }
});

module.exports = router;