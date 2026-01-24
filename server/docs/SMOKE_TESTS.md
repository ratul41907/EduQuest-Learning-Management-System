# EduQuest API Smoke Tests

## Health

- GET /health => 200 OK

## Auth

- POST /api/auth/register (student) => 201 + token
- POST /api/auth/login (student) => 200 + token
- GET /api/auth/me (student token) => 200 user

## Courses

- GET /api/courses => 200 list
- POST /api/courses (instructor token) => 201 course
- GET /api/courses/:id => 200 details
- POST /api/courses/:id/enroll (student token) => 201 enrollment
- PATCH /api/courses/:id/progress (student token) => 200 updated

## Quizzes

- POST /api/quizzes/:courseId (instructor token) => 201 quiz
- GET /api/quizzes => 200 list
- GET /api/quizzes/:id => 200 quiz details
- POST /api/quizzes/:id/attempt (student token) => 201 attempt + points update
- GET /api/quizzes/my/attempts (student token) => 200 list
- GET /api/quizzes/:id/attempts (instructor/admin token) => 200 list

## Badges

- GET /api/badges => 200 list
