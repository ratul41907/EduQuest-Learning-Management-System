// Path: E:\EduQuest\server\src\routes\docs.routes.js

const router = require("express").Router();

// ══════════════════════════════════════════════════════════════
// GET /api/docs
// Returns complete API documentation
// ══════════════════════════════════════════════════════════════
router.get("/", (req, res) => {
  const docs = {
    version: "1.0.0",
    title: "EduQuest API Documentation",
    description: "Complete REST API for EduQuest e-learning platform",
    baseUrl: `${req.protocol}://${req.get("host")}`,
    endpoints: {
      auth: [
        { method: "POST", path: "/api/auth/register", description: "Register new user", auth: false },
        { method: "POST", path: "/api/auth/login", description: "Login and get JWT token", auth: false },
        { method: "GET", path: "/api/auth/me", description: "Get authenticated user", auth: true },
      ],
      users: [
        { method: "GET", path: "/api/user/me", description: "Get own profile", auth: true },
        { method: "PATCH", path: "/api/user/me", description: "Update own profile", auth: true },
        { method: "GET", path: "/api/user/me/dashboard", description: "Student dashboard", auth: true },
        { method: "GET", path: "/api/user/me/badges", description: "My earned badges", auth: true },
        { method: "GET", path: "/api/user/me/certificates", description: "My certificates", auth: true },
        { method: "GET", path: "/api/user/:id/stats", description: "Public user stats", auth: false },
      ],
      courses: [
        { method: "GET", path: "/api/courses", description: "List all courses (search, filter, paginate)", auth: false },
        { method: "GET", path: "/api/courses/my", description: "My enrolled courses", auth: true },
        { method: "POST", path: "/api/courses", description: "Create course (instructor)", auth: true },
        { method: "GET", path: "/api/courses/:id", description: "Course detail", auth: false },
        { method: "PATCH", path: "/api/courses/:id", description: "Update course (instructor)", auth: true },
        { method: "DELETE", path: "/api/courses/:id", description: "Delete course (instructor/admin)", auth: true },
        { method: "POST", path: "/api/courses/:id/enroll", description: "Enroll in course (student)", auth: true },
        { method: "PATCH", path: "/api/courses/:id/progress", description: "Update progress (student)", auth: true },
        { method: "GET", path: "/api/courses/:id/stats", description: "Course statistics", auth: false },
        { method: "GET", path: "/api/courses/:id/leaderboard", description: "Top 10 students", auth: false },
        { method: "GET", path: "/api/courses/:id/quizzes", description: "Course quiz list", auth: false },
        { method: "GET", path: "/api/courses/:id/progress", description: "My progress in course", auth: true },
      ],
      lessons: [
        { method: "GET", path: "/api/lessons/course/:courseId", description: "List course lessons (enrolled)", auth: true },
        { method: "POST", path: "/api/lessons/:courseId", description: "Create lesson (instructor)", auth: true },
        { method: "PATCH", path: "/api/lessons/:lessonId", description: "Update lesson (instructor)", auth: true },
        { method: "DELETE", path: "/api/lessons/:lessonId", description: "Delete lesson (instructor)", auth: true },
        { method: "POST", path: "/api/lessons/:lessonId/complete", description: "Complete lesson (student)", auth: true },
      ],
      quizzes: [
        { method: "GET", path: "/api/quizzes", description: "List all quizzes", auth: false },
        { method: "GET", path: "/api/quizzes/course/:courseId", description: "Quizzes for a course", auth: false },
        { method: "GET", path: "/api/quizzes/my/attempts", description: "My quiz attempts", auth: true },
        { method: "POST", path: "/api/quizzes/:courseId", description: "Create quiz (instructor)", auth: true },
        { method: "GET", path: "/api/quizzes/:id", description: "Quiz detail with questions", auth: false },
        { method: "PATCH", path: "/api/quizzes/:id", description: "Update quiz (instructor)", auth: true },
        { method: "DELETE", path: "/api/quizzes/:id", description: "Delete quiz (instructor)", auth: true },
        { method: "POST", path: "/api/quizzes/:id/attempt", description: "Submit quiz attempt (student)", auth: true },
        { method: "GET", path: "/api/quizzes/:id/my-attempts", description: "My attempts on specific quiz", auth: true },
        { method: "GET", path: "/api/quizzes/:id/attempts", description: "All attempts (instructor)", auth: true },
      ],
      questions: [
        { method: "POST", path: "/api/questions/:quizId", description: "Create question (instructor)", auth: true },
        { method: "GET", path: "/api/questions/quiz/:quizId", description: "Questions for quiz", auth: false },
        { method: "GET", path: "/api/questions/:id", description: "Single question", auth: false },
        { method: "PATCH", path: "/api/questions/:id", description: "Update question (instructor)", auth: true },
        { method: "DELETE", path: "/api/questions/:id", description: "Delete question (instructor)", auth: true },
      ],
      badges: [
        { method: "GET", path: "/api/badges", description: "List all badges", auth: false },
      ],
      notifications: [
        { method: "GET", path: "/api/notifications", description: "My notifications", auth: true },
        { method: "PATCH", path: "/api/notifications/read-all", description: "Mark all as read", auth: true },
        { method: "PATCH", path: "/api/notifications/:id/read", description: "Mark one as read", auth: true },
        { method: "DELETE", path: "/api/notifications/:id", description: "Delete notification", auth: true },
      ],
      leaderboard: [
        { method: "GET", path: "/api/leaderboard/all-time", description: "Top 20 by total points", auth: false },
        { method: "GET", path: "/api/leaderboard/weekly", description: "Top 20 by quiz points this week", auth: false },
        { method: "GET", path: "/api/leaderboard/course/:courseId", description: "Top 10 in course", auth: false },
      ],
      reviews: [
        { method: "GET", path: "/api/reviews/my", description: "My reviews", auth: true },
        { method: "GET", path: "/api/reviews/course/:courseId", description: "Reviews for a course", auth: false },
        { method: "POST", path: "/api/reviews/course/:courseId", description: "Submit/update review (student)", auth: true },
        { method: "DELETE", path: "/api/reviews/:id", description: "Delete review (owner/admin)", auth: true },
      ],
      certificates: [
        { method: "GET", path: "/api/certificates/my", description: "My certificates", auth: true },
        { method: "GET", path: "/api/certificates/verify/:code", description: "Verify certificate", auth: false },
        { method: "GET", path: "/api/certificates/:courseId/pdf", description: "Download certificate PDF", auth: true },
      ],
      instructor: [
        { method: "GET", path: "/api/instructor/dashboard", description: "Instructor dashboard", auth: true, role: "INSTRUCTOR" },
        { method: "GET", path: "/api/instructor/stats", description: "Platform-wide stats", auth: true, role: "INSTRUCTOR" },
        { method: "GET", path: "/api/instructor/notifications", description: "Instructor notifications", auth: true, role: "INSTRUCTOR" },
        { method: "GET", path: "/api/instructor/courses/:id/students", description: "Students in course", auth: true, role: "INSTRUCTOR" },
        { method: "GET", path: "/api/instructor/courses/:id/reviews", description: "Reviews for course", auth: true, role: "INSTRUCTOR" },
        { method: "PATCH", path: "/api/instructor/courses/:id", description: "Update own course", auth: true, role: "INSTRUCTOR" },
      ],
      admin: [
        { method: "GET", path: "/api/admin/stats", description: "Platform-wide overview", auth: true, role: "ADMIN" },
        { method: "GET", path: "/api/admin/users", description: "List all users (filter, search, paginate)", auth: true, role: "ADMIN" },
        { method: "GET", path: "/api/admin/users/:id", description: "Single user detail", auth: true, role: "ADMIN" },
        { method: "PATCH", path: "/api/admin/users/:id/role", description: "Change user role", auth: true, role: "ADMIN" },
        { method: "PATCH", path: "/api/admin/users/:id/points", description: "Adjust user points", auth: true, role: "ADMIN" },
        { method: "DELETE", path: "/api/admin/users/:id", description: "Delete user", auth: true, role: "ADMIN" },
        { method: "GET", path: "/api/admin/courses", description: "List all courses", auth: true, role: "ADMIN" },
        { method: "DELETE", path: "/api/admin/courses/:id", description: "Force delete course", auth: true, role: "ADMIN" },
        { method: "POST", path: "/api/admin/badges", description: "Create badge", auth: true, role: "ADMIN" },
        { method: "PATCH", path: "/api/admin/badges/:id", description: "Update badge", auth: true, role: "ADMIN" },
        { method: "DELETE", path: "/api/admin/badges/:id", description: "Delete badge", auth: true, role: "ADMIN" },
        { method: "POST", path: "/api/admin/users/:id/award-badge", description: "Manually award badge", auth: true, role: "ADMIN" },
        { method: "POST", path: "/api/admin/notify-all", description: "Send notification to all users", auth: true, role: "ADMIN" },
        { method: "GET", path: "/api/admin/notifications", description: "All platform notifications", auth: true, role: "ADMIN" },
        { method: "GET", path: "/api/admin/reports/enrollments", description: "Enrollment trends", auth: true, role: "ADMIN" },
        { method: "GET", path: "/api/admin/reports/quizzes", description: "Quiz pass/fail stats", auth: true, role: "ADMIN" },
        { method: "GET", path: "/api/admin/reports/revenue", description: "Revenue summary", auth: true, role: "ADMIN" },
        { method: "GET", path: "/api/admin/reports/users", description: "User growth trend", auth: true, role: "ADMIN" },
      ],
    },
    authentication: {
      type: "Bearer Token (JWT)",
      header: "Authorization: Bearer <token>",
      tokenExpiry: "7 days",
      roles: ["STUDENT", "INSTRUCTOR", "ADMIN"],
    },
    commonQueryParams: {
      pagination: "?page=1&limit=10",
      search: "?search=keyword",
      filter: "?role=STUDENT&level=1",
    },
    errorCodes: {
      200: "Success",
      201: "Created",
      400: "Bad Request / Validation Failed",
      401: "Unauthorized / Invalid Token",
      403: "Forbidden / Insufficient Permissions",
      404: "Not Found",
      409: "Conflict / Duplicate Entry",
      429: "Too Many Requests / Rate Limited",
      500: "Internal Server Error",
      503: "Service Unavailable",
    },
  };

  res.json(docs);
});

module.exports = router;