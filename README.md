
# EduQuest – Backend API (Learning Management System)

EduQuest is a **production-style backend system** for a Learning Management Platform (LMS) built using **Node.js, Express.js, Prisma, and PostgreSQL**.

This project demonstrates **real-world backend engineering skills** including authentication, role-based access control, RESTful APIs, database design, gamification, reviews, notifications, and performance-conscious architecture.

---

## 🚀 Tech Stack

- **Runtime:** Node.js (v18+)
- **Framework:** Express.js
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Authentication:** JWT (Bearer Token)
- **Authorization:** Role-Based Access Control (RBAC)
- **API Style:** RESTful APIs
- **Testing:** Thunder Client / Postman
- **Version Control:** Git

---

## 📁 Project Structure

```

server/
│
├── src/
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── user.routes.js
│   │   ├── course.routes.js
│   │   ├── lesson.routes.js
│   │   ├── quiz.routes.js
│   │   ├── question.routes.js
│   │   ├── review.routes.js
│   │   ├── notification.routes.js
│   │   ├── leaderboard.routes.js
│   │
│   ├── middleware/
│   │   └── auth.js
│   │
│   ├── prisma/
│   │   └── index.js
│   │
│   └── app.js
│
├── prisma/
│   └── schema.prisma
│
├── .env
├── package.json
└── README.md

```

---

## 🧠 Database Models 

- **User**
- **Course**
- **Lesson**
- **LessonProgress**
- **Enrollment**
- **Quiz**
- **Question**
- **QuizAttempt**
- **Badge**
- **UserBadge**
- **Review**
- **Notification**

All relations are enforced using **Prisma relations, unique constraints, and indexes**.

---

## 🔐 Authentication Flow

1. User registers or logs in
2. Server returns a **JWT**
3. Client sends token with every protected request:

```

Authorization: Bearer <JWT_TOKEN>

````

4. `requireAuth` middleware validates the token
5. Access is granted based on user role

---

## ⚙️ Environment Setup

### 1️⃣ Clone Repository
```bash
git clone https://github.com/your-username/eduquest-backend.git
cd eduquest-backend
````

### 2️⃣ Install Dependencies

```bash
npm install
```

### 3️⃣ Environment Variables

Create a `.env` file:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/eduquest
JWT_SECRET=super_secret_key
PORT=5000
```

### 4️⃣ Generate Prisma Client

```bash
npx prisma generate
```

### 5️⃣ Sync Database

```bash
npx prisma db push
```

### 6️⃣ Start Server

```bash
npm run dev
```

Server runs on:

```
http://localhost:5000
```

---

## 🔍 API Endpoints (Key Examples)

### 🔑 Authentication

* `POST /api/auth/register`
* `POST /api/auth/login`
* `GET /api/auth/me`

### 📘 Courses

* `POST /api/courses` *(Instructor only)*
* `GET /api/courses`
* `GET /api/courses/:id`
* `POST /api/courses/:id/enroll`

### 📖 Lessons

* `POST /api/lessons`
* `GET /api/lessons/course/:courseId`
* `POST /api/lessons/:lessonId/complete`

### 📝 Quizzes

* `POST /api/quizzes`
* `POST /api/questions`
* `POST /api/quizzes/:quizId/submit`

### ⭐ Reviews

* `POST /api/reviews`
* `GET /api/reviews/course/:courseId`

### 🔔 Notifications

* `GET /api/notifications`
* `PATCH /api/notifications/:id/read`

### 🏆 Leaderboard

* `GET /api/leaderboard`

---

## 🧪 Testing (Thunder Client)

* All APIs tested using **Thunder Client**
* JWT manually attached for protected routes
* Edge cases tested:

  * Duplicate lesson completion
  * Duplicate reviews
  * Unauthorized access
  * Invalid tokens

---

## 🛡️ Security Measures

* JWT authentication
* Role-based route protection
* Secure password hashing (bcrypt)
* Unique database constraints
* Input validation
* Centralized error handling

---

## 📈 Performance & Scalability

* Indexed foreign keys
* Optimized Prisma queries
* Minimal `select` statements
* Stateless API design
* Clean separation of concerns

---

## 🧩 Completed Features 

✅ Authentication & Authorization
✅ Course Management
✅ Lessons & Progress Tracking
✅ Quizzes & Scoring
✅ Gamification (Points & Badges)
✅ Reviews & Ratings
✅ Notifications
✅ Leaderboard

---

## 🔜 Future Enhancements

* Course completion certificates (PDF)
* Admin dashboard
* Email notifications
* Redis caching
* Docker deployment
* Swagger API documentation
* Rate limiting
* AI-based recommendations

---


## 📜 License

MIT License

Copyright (c) Arafat Zaman Ratul 2026

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction.

