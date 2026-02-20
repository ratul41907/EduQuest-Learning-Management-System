# EduQuest API Test Guide

## Setup Instructions

### 1. Import Thunder Client Collection

1. Open VS Code
2. Install Thunder Client extension
3. Click Thunder Client icon in sidebar
4. Click "Collections" tab
5. Click "..." menu → "Import"
6. Select `tests/thunder-client-collection.json`

### 2. Create Environment Variables

1. In Thunder Client, click "Env" tab
2. Create new environment: "EduQuest Local"
3. Add variables:
   - `student_token`: (will be set automatically after login)
   - `instructor_token`: (will be set automatically after login)
   - `admin_token`: (will be set automatically after login)
   - `course_id`: (copy from course creation response)

---

## Complete Test Flow

### Phase 1: Authentication (6 tests)

**Test 1.1 — Register Student**

```
POST /api/auth/register
Body: { fullName, email, password, role: "STUDENT" }
Expected: 201 with user object
```

**Test 1.2 — Register Instructor**

```
POST /api/auth/register
Body: { fullName, email, password, role: "INSTRUCTOR" }
Expected: 201 with user object
```

**Test 1.3 — Register Admin**

```
POST /api/auth/register
Body: { fullName, email, password, role: "ADMIN" }
Expected: 201 with user object
```

**Test 1.4 — Login Student**

```
POST /api/auth/login
Body: { email, password }
Expected: 200 with JWT token
Action: Save token to {{student_token}}
```

**Test 1.5 — Login Instructor**

```
POST /api/auth/login
Expected: 200 with JWT token
Action: Save token to {{instructor_token}}
```

**Test 1.6 — Login Admin**

```
POST /api/auth/login
Expected: 200 with JWT token
Action: Save token to {{admin_token}}
```

---

### Phase 2: Course Creation Flow (8 tests)

**Test 2.1 — List All Courses**

```
GET /api/courses
Expected: 200 with courses array
```

**Test 2.2 — Search Courses**

```
GET /api/courses?search=react&level=1
Expected: 200 with filtered results
```

**Test 2.3 — Create Course (Instructor)**

```
POST /api/courses
Headers: Authorization: Bearer {{instructor_token}}
Body: { title, description, price, level }
Expected: 201 with course object
Action: Save course.id to {{course_id}}
```

**Test 2.4 — Create 3 Lessons**

```
POST /api/lessons/{{course_id}}
Headers: Authorization: Bearer {{instructor_token}}
Body: { title, content, orderNo: 1, points: 10 }
Expected: 201 for each lesson
```

**Test 2.5 — Create Quiz**

```
POST /api/quizzes/{{course_id}}
Headers: Authorization: Bearer {{instructor_token}}
Body: { title, passScore: 70 }
Expected: 201 with quiz object
Action: Save quiz.id to {{quiz_id}}
```

**Test 2.6 — Add 5 Questions to Quiz**

```
POST /api/questions/{{quiz_id}}
Headers: Authorization: Bearer {{instructor_token}}
Body: { prompt, optionA-D, correct, points }
Expected: 201 for each question
```

---

### Phase 3: Student Learning Flow (12 tests)

**Test 3.1 — Enroll in Course**

```
POST /api/courses/{{course_id}}/enroll
Headers: Authorization: Bearer {{student_token}}
Expected: 201 with enrollment object
```

**Test 3.2 — View My Enrolled Courses**

```
GET /api/courses/my
Headers: Authorization: Bearer {{student_token}}
Expected: 200 with array of enrolled courses
```

**Test 3.3 — Complete Lesson 1**

```
POST /api/lessons/{{lesson1_id}}/complete
Headers: Authorization: Bearer {{student_token}}
Expected: 201 + FIRST_LESSON badge awarded
```

**Test 3.4 — Complete Lesson 2**

```
POST /api/lessons/{{lesson2_id}}/complete
Expected: 201
```

**Test 3.5 — Complete Lesson 3**

```
POST /api/lessons/{{lesson3_id}}/complete
Expected: 201 + progress = 100% + COURSE_FINISHER badge
```

**Test 3.6 — Attempt Quiz (Pass)**

```
POST /api/quizzes/{{quiz_id}}/attempt
Headers: Authorization: Bearer {{student_token}}
Body: { answers: ["A", "B", "C", "D", "A"] }
Expected: 201 with score + PERFECT_SCORE badge if 100%
```

**Test 3.7 — View My Badges**

```
GET /api/user/me/badges
Headers: Authorization: Bearer {{student_token}}
Expected: 200 with earned badges array
```

**Test 3.8 — View My Certificates**

```
GET /api/user/me/certificates
Headers: Authorization: Bearer {{student_token}}
Expected: 200 with certificates (course completed)
```

**Test 3.9 — Download Certificate PDF**

```
GET /api/certificates/{{course_id}}/pdf
Headers: Authorization: Bearer {{student_token}}
Expected: PDF file download
```

**Test 3.10 — Verify Certificate**

```
GET /api/certificates/verify/{{cert_code}}
Expected: 200 with valid: true
```

**Test 3.11 — Submit Review**

```
POST /api/reviews/course/{{course_id}}
Headers: Authorization: Bearer {{student_token}}
Body: { rating: 5, comment: "Great course!" }
Expected: 201 with review object
```

**Test 3.12 — View Course Leaderboard**

```
GET /api/courses/{{course_id}}/leaderboard
Expected: 200 with top 10 students ranked
```

---

### Phase 4: Admin Operations (10 tests)

**Test 4.1 — Platform Stats**

```
GET /api/admin/stats
Headers: Authorization: Bearer {{admin_token}}
Expected: 200 with users, content, activity stats
```

**Test 4.2 — List All Users**

```
GET /api/admin/users
Headers: Authorization: Bearer {{admin_token}}
Expected: 200 with paginated user list
```

**Test 4.3 — Filter Users by Role**

```
GET /api/admin/users?role=STUDENT
Headers: Authorization: Bearer {{admin_token}}
Expected: 200 with only students
```

**Test 4.4 — Get User Detail**

```
GET /api/admin/users/{{user_id}}
Headers: Authorization: Bearer {{admin_token}}
Expected: 200 with full user profile + stats
```

**Test 4.5 — Change User Role**

```
PATCH /api/admin/users/{{user_id}}/role
Headers: Authorization: Bearer {{admin_token}}
Body: { role: "INSTRUCTOR" }
Expected: 200 with updated user
```

**Test 4.6 — Adjust User Points**

```
PATCH /api/admin/users/{{user_id}}/points
Headers: Authorization: Bearer {{admin_token}}
Body: { points: 50, reason: "Bonus" }
Expected: 200 with updated totalPoints
```

**Test 4.7 — Create Badge**

```
POST /api/admin/badges
Headers: Authorization: Bearer {{admin_token}}
Body: { code, name, description, pointsBonus }
Expected: 201 with badge object
```

**Test 4.8 — Award Badge Manually**

```
POST /api/admin/users/{{user_id}}/award-badge
Headers: Authorization: Bearer {{admin_token}}
Body: { badgeCode: "EARLY_ADOPTER" }
Expected: 200 with confirmation
```

**Test 4.9 — Send Mass Notification**

```
POST /api/admin/notify-all
Headers: Authorization: Bearer {{admin_token}}
Body: { title, message, roleFilter: "STUDENT" }
Expected: 200 with recipientCount
```

**Test 4.10 — View All Reports**

```
GET /api/admin/reports/users
GET /api/admin/reports/enrollments
GET /api/admin/reports/quizzes
GET /api/admin/reports/revenue
Expected: 200 for each with detailed analytics
```

---

### Phase 5: Edge Cases & Error Handling (10 tests)

**Test 5.1 — Duplicate Enrollment**

```
POST /api/courses/{{course_id}}/enroll (again)
Expected: 409 Conflict
```

**Test 5.2 — Complete Lesson Twice**

```
POST /api/lessons/{{lesson_id}}/complete (already completed)
Expected: 409 or 200 (idempotent)
```

**Test 5.3 — Quiz With No Questions**

```
POST /api/quizzes/{{empty_quiz_id}}/attempt
Expected: 400 "Quiz has no questions"
```

**Test 5.4 — Invalid Token**

```
GET /api/user/me
Headers: Authorization: Bearer invalid_token_here
Expected: 401 Unauthorized
```

**Test 5.5 — Missing Token**

```
GET /api/user/me
(no Authorization header)
Expected: 401 Unauthorized
```

**Test 5.6 — Rate Limit Auth**

```
POST /api/auth/login (11th request within 15 min)
Expected: 429 Too Many Requests
```

**Test 5.7 — Large Payload**

```
POST /api/courses
Body: { description: "A".repeat(15000000) }
Expected: 413 Payload Too Large
```

**Test 5.8 — Invalid Role**

```
POST /api/auth/register
Body: { role: "SUPERADMIN" }
Expected: 400 Validation Failed
```

**Test 5.9 — CORS Unauthorized Origin**

```
GET /api/courses
Headers: Origin: http://malicious-site.com
Expected: 403 (if not in ALLOWED_ORIGINS)
```

**Test 5.10 — Nonexistent Route**

```
GET /api/nonexistent
Expected: 404 Route not found
```

---

## Expected Response Codes

| Code | Meaning                              |
| ---- | ------------------------------------ |
| 200  | Success                              |
| 201  | Created                              |
| 400  | Bad Request / Validation Failed      |
| 401  | Unauthorized / Invalid Token         |
| 403  | Forbidden / Insufficient Permissions |
| 404  | Not Found                            |
| 409  | Conflict / Duplicate Entry           |
| 413  | Payload Too Large                    |
| 429  | Too Many Requests / Rate Limited     |
| 500  | Internal Server Error                |
| 503  | Service Unavailable                  |

---

## Performance Benchmarks (with indexes)

| Endpoint                          | Expected Time |
| --------------------------------- | ------------- |
| GET /api/courses                  | < 50ms        |
| GET /api/user/me/dashboard        | < 100ms       |
| GET /api/admin/stats              | < 150ms       |
| GET /api/leaderboard/all-time     | < 80ms        |
| GET /api/admin/users?role=STUDENT | < 50ms        |
| POST /api/lessons/:id/complete    | < 100ms       |

---

## Quick Start Checklist

- [ ] Import Thunder Client collection
- [ ] Set up environment variables
- [ ] Run all Phase 1 tests (Authentication)
- [ ] Save tokens to environment
- [ ] Run Phase 2 (Course Creation)
- [ ] Save course_id to environment
- [ ] Run Phase 3 (Student Flow)
- [ ] Verify badges awarded correctly
- [ ] Run Phase 4 (Admin Operations)
- [ ] Run Phase 5 (Edge Cases)
- [ ] Verify all response codes match expected
- [ ] Check performance benchmarks

---

## Troubleshooting

**Issue:** 401 Unauthorized  
**Fix:** Check token is saved in environment and valid

**Issue:** 403 Forbidden  
**Fix:** Verify user role matches endpoint requirements

**Issue:** 404 Not Found  
**Fix:** Check IDs (course_id, user_id) are correct

**Issue:** 429 Rate Limited  
**Fix:** Wait 15 minutes or restart server

**Issue:** Slow queries (> 200ms)  
**Fix:** Verify indexes applied with `npx prisma studio`
