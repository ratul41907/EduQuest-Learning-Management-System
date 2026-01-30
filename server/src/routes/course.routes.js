const router = require("express").Router();
const prisma = require("../prisma");
const { requireAuth } = require("../middleware/auth");

// 1. GET /api/courses/my (MUST BE ABOVE /:id)
router.get("/my", requireAuth, async (req, res) => {
  try {
    const enrollments = await prisma.enrollment.findMany({
      where: { userId: req.user.sub }, // Uses 'sub' as per your auth pattern
      include: { 
        course: {
          include: { instructor: { select: { fullName: true } } }
        } 
      }
    });
    const myCourses = enrollments.map(e => ({
      ...e.course,
      progress: e.progress 
    }));
    return res.json(myCourses);
  } catch (err) {
    return res.status(500).json({ message: "Error fetching enrolled courses", error: err.message });
  }
});

// 2. GET /api/courses (Public list)
router.get("/", async (req, res) => {
  try {
    const courses = await prisma.course.findMany({
      orderBy: { createdAt: "desc" },
    });
    return res.json(courses);
  } catch (err) {
    return res.status(500).json({ message: "Error", error: err.message });
  }
});

// 3. POST /api/courses (Create)
router.post("/", requireAuth, async (req, res) => {
  if (req.user.role !== "INSTRUCTOR") return res.status(403).json({ message: "Access denied" });
  const { title, description, price, level } = req.body;
  try {
    const course = await prisma.course.create({
      data: {
        title, description,
        price: Number(price || 0),
        level: Number(level || 1),
        instructorId: req.user.sub, // Uses 'sub'
      },
    });
    return res.status(201).json(course);
  } catch (err) {
    return res.status(500).json({ message: "Error", error: err.message });
  }
});

// 4. GET /api/courses/:id (Course Details)
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const course = await prisma.course.findUnique({
      where: { id },
      include: { instructor: { select: { fullName: true, email: true } } }
    });
    if (!course) return res.status(404).json({ message: "Course not found" });
    return res.json(course);
  } catch (err) {
    return res.status(500).json({ message: "Error", error: err.message });
  }
});

// 5. POST /api/courses/:id/enroll
router.post("/:id/enroll", requireAuth, async (req, res) => {
  const { id } = req.params;
  if (req.user.role !== "STUDENT") return res.status(403).json({ message: "Only students can enroll" });
  try {
    const exists = await prisma.enrollment.findFirst({ where: { courseId: id, userId: req.user.sub } });
    if (exists) return res.status(400).json({ message: "Already enrolled" });

    const enrollment = await prisma.enrollment.create({
      data: { courseId: id, userId: req.user.sub }, // Uses 'sub'
    });
    return res.status(201).json(enrollment);
  } catch (err) {
    return res.status(500).json({ message: "Enrollment error", error: err.message });
  }
});

// --- DAY 20 NEW: UPDATE PROGRESS ---
// 6. PATCH /api/courses/:id/progress
router.patch("/:id/progress", requireAuth, async (req, res) => {
  const { id: courseId } = req.params;
  const { progress } = req.body; // Expecting a number like 50, 100
  
  try {
    // Find and update the enrollment for this specific student and course
    const updatedEnrollment = await prisma.enrollment.update({
      where: {
        userId_courseId: {
          userId: req.user.sub, // Must use 'sub' to match your token payload
          courseId: courseId
        }
      },
      data: { progress: Number(progress) }
    });
    
    return res.json({ message: "Progress saved!", progress: updatedEnrollment.progress });
  } catch (err) {
    return res.status(500).json({ message: "Failed to update progress", error: err.message });
  }
});

module.exports = router;