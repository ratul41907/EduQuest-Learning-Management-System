// Path: E:\EduQuest\server\src\routes\review.routes.js

const router = require("express").Router();
const prisma = require("../prisma");
const { requireAuth } = require("../middleware/auth");
const { validate } = require("../middleware/validate"); // Day 7

// ===============================
// GET /api/reviews/my
// Student: see all my own reviews
// IMPORTANT: must stay above /course/:courseId
// ===============================
router.get("/my", requireAuth, async (req, res) => {
  try {
    const userId = req.user.sub;

    const reviews = await prisma.review.findMany({
      where: { userId },
      select: {
        id: true,
        rating: true,
        comment: true,
        createdAt: true,
        course: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return res.json({ count: reviews.length, reviews });
  } catch (err) {
    return res.status(500).json({ message: "Failed to load my reviews", error: err.message });
  }
});

// ===============================
// GET /api/reviews/course/:courseId
// Public: list reviews + avg rating
// ===============================
router.get("/course/:courseId", async (req, res) => {
  try {
    const { courseId } = req.params;

    const reviews = await prisma.review.findMany({
      where: { courseId },
      select: {
        id: true,
        rating: true,
        comment: true,
        createdAt: true,
        user: { select: { id: true, fullName: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const avg =
      reviews.length === 0
        ? 0
        : Math.round(
            (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) * 10
          ) / 10;

    return res.json({ avgRating: avg, count: reviews.length, reviews });
  } catch (err) {
    return res.status(500).json({ message: "Failed to load reviews", error: err.message });
  }
});

// ===============================
// POST /api/reviews/course/:courseId
// Student: must be enrolled, 1 review per course
// UPDATED Day 7: validate middleware added
// ===============================
router.post(
  "/course/:courseId",
  requireAuth,
  validate({
    rating: "required|number|range:1,5",
  }),
  async (req, res) => {
    try {
      const { courseId } = req.params;
      const { rating, comment } = req.body;

      if (req.user.role !== "STUDENT") {
        return res.status(403).json({ message: "Only students can review courses" });
      }

      const r = Number(rating);

      const enrolled = await prisma.enrollment.findUnique({
        where: { userId_courseId: { userId: req.user.sub, courseId } },
      });
      if (!enrolled) {
        return res.status(403).json({ message: "You must enroll before reviewing" });
      }

      const existing = await prisma.review.findUnique({
        where: { userId_courseId: { userId: req.user.sub, courseId } },
      });

      const review = await prisma.review.upsert({
        where: { userId_courseId: { userId: req.user.sub, courseId } },
        update: { rating: r, comment: comment ? String(comment) : null },
        create: {
          userId: req.user.sub,
          courseId,
          rating: r,
          comment: comment ? String(comment) : null,
        },
        select: { id: true, courseId: true, rating: true, comment: true, createdAt: true },
      });

      if (!existing) {
        const course = await prisma.course.findUnique({
          where: { id: courseId },
          select: { instructorId: true, title: true },
        });
        if (course) {
          await prisma.notification.create({
            data: {
              userId: course.instructorId,
              courseId,
              type: "REVIEW_SUBMITTED",
              title: "New Review Received!",
              message: `A student left a ${r}⭐ review on your course: ${course.title}`,
            },
          }).catch(() => {});
        }
      }

      return res.status(201).json({
        message: existing ? "Review updated" : "Review submitted",
        review,
      });
    } catch (err) {
      return res.status(500).json({ message: "Failed to save review", error: err.message });
    }
  }
);

// ===============================
// DELETE /api/reviews/:id
// Owner or ADMIN
// ===============================
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const review = await prisma.review.findUnique({ where: { id } });
    if (!review) return res.status(404).json({ message: "Review not found" });

    const isOwner = review.userId === req.user.sub;
    const isAdmin = req.user.role === "ADMIN";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Access denied" });
    }

    await prisma.review.delete({ where: { id } });
    return res.json({ message: "Review deleted" });
  } catch (err) {
    return res.status(500).json({ message: "Failed to delete review", error: err.message });
  }
});

module.exports = router;