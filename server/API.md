# 📖 EduQuest API Documentation

Complete API reference for EduQuest Learning Management System.

**Base URL:** `http://localhost:5000/api`

**Current Version:** v2.0.0

---

## Table of Contents

1. [Authentication](#authentication)
2. [Users](#users)
3. [Courses](#courses)
4. [Lessons](#lessons)
5. [Quizzes](#quizzes)
6. [Enrollments](#enrollments)
7. [Badges](#badges)
8. [Leaderboard](#leaderboard)
9. [Notifications](#notifications)
10. [Search](#search)
11. [Admin](#admin)
12. [WebSocket](#websocket)

---

## Authentication

### Register

**Endpoint:** `POST /api/v2/auth/register`

**Body:**

```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "STUDENT"
}
```

**Response:** (201 Created)

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "fullName": "John Doe",
      "email": "john@example.com",
      "role": "STUDENT",
      "totalPoints": 0,
      "level": 1
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "tokenExpiresIn": "7d"
  },
  "meta": {
    "version": "2.0.0",
    "timestamp": "2026-03-04T..."
  }
}
```

---

### Login

**Endpoint:** `POST /api/v2/auth/login`

**Body:**

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:** (200 OK)

```json
{
  "success": true,
  "data": {
    "user": { ... },
    "token": "...",
    "tokenExpiresIn": "7d"
  }
}
```

---

### Get Current User

**Endpoint:** `GET /api/v2/auth/me`

**Headers:**

```
Authorization: Bearer <token>
```

**Response:** (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "fullName": "John Doe",
    "email": "john@example.com",
    "role": "STUDENT",
    "totalPoints": 150,
    "level": 2,
    "stats": {
      "enrollments": 5,
      "lessonsCompleted": 12,
      "quizzesAttempted": 8,
      "badgesEarned": 3
    }
  }
}
```

---

## Courses

### List Courses

**Endpoint:** `GET /api/v2/courses`

**Query Parameters:**

- `search` (string) - Search term
- `level` (number) - Filter by level (1-5)
- `minPrice` (number) - Minimum price
- `maxPrice` (number) - Maximum price
- `page` (number) - Page number (default: 1)
- `limit` (number) - Items per page (default: 10, max: 50)
- `sortBy` (string) - Sort order: `newest`, `oldest`, `price-low`, `price-high`

**Example:**

```
GET /api/v2/courses?search=react&level=1&page=1&limit=10
```

**Response:** (200 OK)

```json
{
  "total": 25,
  "page": 1,
  "limit": 10,
  "totalPages": 3,
  "courses": [
    {
      "id": "uuid",
      "title": "React Basics",
      "description": "Learn React from scratch",
      "price": 0,
      "level": 1,
      "thumbnail": "/uploads/courses/...",
      "instructor": {
        "id": "uuid",
        "fullName": "Instructor Name"
      },
      "lessonCount": 10,
      "quizCount": 3,
      "enrollmentCount": 150,
      "avgRating": 4.5
    }
  ],
  "facets": {
    "levels": [
      { "level": 1, "count": 15 },
      { "level": 2, "count": 10 }
    ],
    "priceRange": { "min": 0, "max": 100 }
  }
}
```

---

### Create Course

**Endpoint:** `POST /api/v2/courses`

**Headers:**

```
Authorization: Bearer <instructor-token>
```

**Body:**

```json
{
  "title": "Advanced Node.js",
  "description": "Master Node.js with this comprehensive course",
  "price": 49.99,
  "level": 3
}
```

**Response:** (201 Created)

---

### Get Course by ID

**Endpoint:** `GET /api/v2/courses/:id`

---

### Update Course

**Endpoint:** `PATCH /api/v2/courses/:id`

**Headers:**

```
Authorization: Bearer <instructor-token>
```

---

### Delete Course

**Endpoint:** `DELETE /api/v2/courses/:id`

---

### Enroll in Course

**Endpoint:** `POST /api/v2/courses/:id/enroll`

**Headers:**

```
Authorization: Bearer <student-token>
```

**Response:** (201 Created)

---

### Get Course Statistics

**Endpoint:** `GET /api/v2/courses/:id/stats`

**Response:**

```json
{
  "courseId": "uuid",
  "title": "React Basics",
  "lessonCount": 10,
  "quizCount": 3,
  "enrollmentCount": 150,
  "completionCount": 45,
  "completionRate": 30,
  "avgProgress": 65,
  "avgRating": 4.5,
  "reviewCount": 78
}
```

---

### Get Course Leaderboard

**Endpoint:** `GET /api/v2/courses/:id/leaderboard`

**Response:**

```json
{
  "courseId": "uuid",
  "title": "React Basics",
  "leaderboard": [
    {
      "rank": 1,
      "userId": "uuid",
      "fullName": "Top Student",
      "progress": 100,
      "lessonsCompleted": 10,
      "quizPoints": 95,
      "score": 100
    }
  ]
}
```

---

## Search

### Search Courses

**Endpoint:** `GET /api/search/courses`

**Query Parameters:**

- `q` (string) - Search query
- `level` (number) - Filter by level
- `minPrice`, `maxPrice` (number)
- `minRating` (number) - Minimum rating (1-5)
- `hasQuizzes` (boolean) - Has quizzes
- `hasLessons` (boolean) - Has lessons
- `sortBy` (string)

---

### Global Search

**Endpoint:** `GET /api/search/global`

**Query:** `?q=react&types=courses,lessons&limit=5`

**Response:**

```json
{
  "query": "react",
  "results": {
    "courses": [ ... ],
    "lessons": [ ... ]
  },
  "totalResults": 15
}
```

---

### Auto-complete Suggestions

**Endpoint:** `GET /api/search/suggestions?q=rea`

**Response:**

```json
[
  { "type": "course", "id": "uuid", "text": "React Basics" },
  { "type": "course", "id": "uuid", "text": "React Advanced" }
]
```

---

### Fuzzy Search

**Endpoint:** `GET /api/search/fuzzy?q=reacr&type=courses`

Typo-tolerant search (finds "React" even with typo "reacr")

---

## Leaderboard

### All-Time Leaderboard

**Endpoint:** `GET /api/leaderboard/all-time?limit=10`

**Response:**

```json
{
  "type": "all-time",
  "leaderboard": [
    {
      "rank": 1,
      "userId": "uuid",
      "fullName": "Top User",
      "totalPoints": 5000,
      "level": 10
    }
  ]
}
```

---

### Weekly Leaderboard

**Endpoint:** `GET /api/leaderboard/weekly?limit=10`

---

## Admin

### Get All Users

**Endpoint:** `GET /api/admin/users`

**Headers:**

```
Authorization: Bearer <admin-token>
```

**Query:** `?role=STUDENT&page=1&limit=20`

---

### Get Analytics

**Endpoint:** `GET /api/admin/analytics`

**Response:**

```json
{
  "users": {
    "total": 1500,
    "students": 1200,
    "instructors": 50,
    "admins": 5
  },
  "courses": {
    "total": 200,
    "published": 180
  },
  "enrollments": 3500,
  "revenue": 125000
}
```

---

## WebSocket Events

**Connect:**

```javascript
const socket = io("http://localhost:5000", {
  auth: { token: "your-jwt-token" },
});
```

**Events to emit:**

- `join-course` - Join course room
- `leave-course` - Leave course room
- `typing` - Show typing indicator
- `course-message` - Send message to course

**Events to listen:**

- `notification` - New notification
- `online-users` - List of online users
- `user-joined-course` - User joined room
- `course-message` - New message in course

---

## Error Codes

| Code                  | Description              |
| --------------------- | ------------------------ |
| `EMAIL_EXISTS`        | Email already registered |
| `INVALID_CREDENTIALS` | Login failed             |
| `USER_NOT_FOUND`      | User doesn't exist       |
| `UNAUTHORIZED`        | Missing/invalid token    |
| `FORBIDDEN`           | Insufficient permissions |
| `NOT_FOUND`           | Resource not found       |
| `VALIDATION_ERROR`    | Invalid input            |
| `SERVER_ERROR`        | Internal server error    |

---

## Rate Limits

- **Global:** 100 requests per 15 minutes
- **Auth endpoints:** 5 requests per 15 minutes
- **Upload endpoints:** 10 requests per 15 minutes
- **Admin endpoints:** 50 requests per 15 minutes

---

**For complete endpoint list, see the API routes in `src/routes/`**
