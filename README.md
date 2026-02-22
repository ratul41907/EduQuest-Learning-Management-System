# 🎓 EduQuest - Learning Management System API

A full-featured e-learning platform backend built with Node.js, Express, Prisma ORM, and PostgreSQL. Complete with authentication, course management, gamification, file uploads, and comprehensive admin controls.

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.x-blue.svg)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-5.x-brightgreen.svg)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-blue.svg)](https://www.postgresql.org/)

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [Database Schema](#database-schema)
- [Scripts](#scripts)
- [API Endpoints](#api-endpoints)
- [Testing](#testing)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

### Core Functionality

- 🔐 **JWT Authentication** - Secure user authentication with role-based access control (Student, Instructor, Admin)
- 📚 **Course Management** - Complete CRUD operations with search, filtering, and pagination
- 📖 **Lesson System** - Ordered lessons with progress tracking
- 📝 **Quiz System** - Multiple-choice quizzes with auto-grading and instant feedback
- 🏆 **Gamification** - Badge system with 4 achievement types and auto-awards
- 📜 **Certificates** - Auto-generated certificates with PDF download and verification
- 🏅 **Leaderboards** - All-time, weekly, and per-course rankings
- ⭐ **Review System** - Student ratings and comments for courses
- 🔔 **Notifications** - Real-time notification system for user activities
- 📊 **Analytics** - Comprehensive reporting for admins and instructors
- 📁 **File Uploads** - Profile pictures and course thumbnails with validation
- 🔒 **Security** - Helmet.js, CORS, rate limiting, input validation

### Role-Based Features

**Students Can:**

- Browse and enroll in courses
- Track lesson completion and progress
- Take quizzes and earn points
- Collect badges and certificates
- View leaderboards and rankings
- Submit course reviews
- Upload profile pictures

**Instructors Can:**

- Create and manage courses
- Add lessons and quizzes with questions
- View student progress and analytics
- Access course-specific statistics
- Manage course enrollments
- View and respond to reviews

**Admins Can:**

- Manage all users (create, update, delete, role changes)
- Access platform-wide analytics
- Create and award badges manually
- Send mass notifications
- View comprehensive reports (users, enrollments, quizzes, revenue)
- Force delete any content
- Adjust user points manually

## 🛠️ Tech Stack

### Backend

- **Runtime:** Node.js 18+
- **Framework:** Express.js 4.x
- **ORM:** Prisma 5.x
- **Database:** PostgreSQL 14+
- **Authentication:** JWT (jsonwebtoken)
- **Password Hashing:** bcrypt
- **File Upload:** Multer
- **PDF Generation:** PDFKit
- **Validation:** Custom middleware
- **Security:** Helmet.js, CORS
- **Compression:** compression

### Development Tools

- **API Testing:** Postman / Thunder Client
- **Database GUI:** Prisma Studio
- **Version Control:** Git & GitHub

## 🚀 Getting Started

### Prerequisites

- Node.js 18 or higher
- PostgreSQL 14 or higher
- npm or yarn

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/eduquest-backend.git
cd eduquest-backend/server
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

Create a `.env` file in the `server` directory:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/eduquest"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
PORT=5000
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

4. **Set up the database**

```bash
# Generate Prisma Client
npx prisma generate

# Push schema to database
npx prisma db push

# Seed the database with initial data
npm run seed
```

5. **Start the development server**

```bash
npm run dev
```

The API will be available at `http://localhost:5000`

### Quick Test

```bash
# Check if the server is running
curl http://localhost:5000/health

# View API documentation
curl http://localhost:5000/api/docs
```

## 📚 API Documentation

Full API documentation is available at:

```
GET http://localhost:5000/api/docs
```

### Quick API Reference

| Category    | Endpoint                  | Method | Auth          |
| ----------- | ------------------------- | ------ | ------------- |
| **Auth**    | `/api/auth/register`      | POST   | ❌            |
|             | `/api/auth/login`         | POST   | ❌            |
|             | `/api/auth/me`            | GET    | ✅            |
| **Courses** | `/api/courses`            | GET    | ❌            |
|             | `/api/courses`            | POST   | ✅ Instructor |
|             | `/api/courses/:id`        | GET    | ❌            |
|             | `/api/courses/:id/enroll` | POST   | ✅ Student    |
| **Admin**   | `/api/admin/stats`        | GET    | ✅ Admin      |
|             | `/api/admin/users`        | GET    | ✅ Admin      |
|             | `/api/admin/reports/*`    | GET    | ✅ Admin      |

> **Note:** View complete endpoint list at `/api/docs`

## 📁 Project Structure

```
server/
├── src/
│   ├── middleware/
│   │   ├── auth.js          # JWT authentication
│   │   ├── validate.js      # Input validation
│   │   ├── logger.js        # Request logging
│   │   ├── rateLimiter.js   # Rate limiting
│   │   └── upload.js        # File upload handling
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── user.routes.js
│   │   ├── course.routes.js
│   │   ├── lesson.routes.js
│   │   ├── quiz.routes.js
│   │   ├── question.routes.js
│   │   ├── badge.routes.js
│   │   ├── notification.routes.js
│   │   ├── leaderboard.routes.js
│   │   ├── review.routes.js
│   │   ├── certificate.routes.js
│   │   ├── instructor.routes.js
│   │   ├── admin.routes.js
│   │   └── docs.routes.js
│   ├── app.js               # Express app setup
│   ├── server.js            # Server entry point
│   └── prisma.js            # Prisma client
├── prisma/
│   ├── schema.prisma        # Database schema
│   └── seed.js              # Database seeding
├── uploads/                 # User-uploaded files
│   ├── profiles/
│   ├── courses/
│   └── lessons/
├── tests/                   # API test collection
├── package.json
└── .env
```

## 🗄️ Database Schema

The application uses 13 Prisma models:

- **User** - Students, instructors, and admins
- **Course** - Course information and metadata
- **Lesson** - Course lessons with content
- **Enrollment** - Student-course relationships
- **LessonProgress** - Lesson completion tracking
- **Quiz** - Course quizzes
- **Question** - Quiz questions
- **QuizAttempt** - Student quiz submissions
- **Badge** - Achievement badges
- **UserBadge** - User badge awards
- **Review** - Course ratings and comments
- **Notification** - User notifications
- **Certificate** - Course completion certificates

### Key Relationships

```
User (1) ──→ (N) Enrollment ──→ (1) Course
User (1) ──→ (N) LessonProgress ──→ (1) Lesson
User (1) ──→ (N) QuizAttempt ──→ (1) Quiz
Course (1) ──→ (N) Lesson
Course (1) ──→ (N) Quiz ──→ (N) Question
```

View the full schema in `prisma/schema.prisma`

## 📜 Scripts

```bash
# Development
npm run dev          # Start development server with nodemon

# Database
npm run seed         # Seed database with initial data
npx prisma studio    # Open Prisma Studio GUI
npx prisma db push   # Push schema changes to database
npx prisma generate  # Generate Prisma Client

# Production
npm start            # Start production server
```

## 🔑 Environment Variables

| Variable          | Description                            | Example                                    |
| ----------------- | -------------------------------------- | ------------------------------------------ |
| `DATABASE_URL`    | PostgreSQL connection string           | `postgresql://user:pass@localhost:5432/db` |
| `JWT_SECRET`      | Secret key for JWT signing             | `super-secret-key-change-in-prod`          |
| `PORT`            | Server port                            | `5000`                                     |
| `NODE_ENV`        | Environment mode                       | `development` or `production`              |
| `ALLOWED_ORIGINS` | CORS allowed origins (comma-separated) | `http://localhost:3000`                    |

## 🧪 Testing

### Manual Testing

Use the provided Postman/Thunder Client collection in `tests/thunder-client-collection.json`

### Test User Accounts

After running `npm run seed`:

```javascript
// Student Account
email: student@test.com
password: password123

// Instructor Account
email: instructor@test.com
password: password123

// Admin Account
email: admin@test.com
password: password123
```

### Sample API Calls

**Register a new user:**

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "STUDENT"
  }'
```

**Login:**

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@test.com",
    "password": "password123"
  }'
```

**Get courses:**

```bash
curl http://localhost:5000/api/courses
```

## 📊 Key Features Explained

### Badge System

4 auto-awarded badges:

- **FIRST_LESSON** - Complete your first lesson
- **COURSE_FINISHER** - Complete all lessons in a course (100% progress)
- **FIRST_QUIZ** - Complete your first quiz attempt
- **PERFECT_SCORE** - Score 100% on any quiz

### Leaderboard Scoring

```javascript
score = (progress × 0.6) + min(quizPoints × 0.4, 40)
// 60% weight on course progress
// 40% weight on quiz points (capped at 40)
```

### Certificate Generation

- Auto-generated when course progress reaches 100%
- Unique verification code format: `CERT-{userId}-{timestamp}`
- Downloadable as PDF
- Public verification endpoint

### Level System

```javascript
level = floor(totalPoints / 100) + 1;
// Level 1: 0-99 points
// Level 2: 100-199 points
// Level 3: 200-299 points
// etc.
```

## 🔒 Security Features

- **JWT Authentication** - 7-day token expiry
- **Password Hashing** - bcrypt with salt rounds
- **Rate Limiting** - 10 requests per 15 minutes on auth endpoints
- **Input Validation** - Custom validation middleware on all inputs
- **CORS Protection** - Configurable allowed origins
- **Security Headers** - Helmet.js implementation
- **File Upload Limits** - 2MB for profiles, 5MB for course content
- **SQL Injection Protection** - Prisma ORM parameterized queries

## 🚢 Deployment

### Production Checklist

- [ ] Set `NODE_ENV=production` in environment
- [ ] Use strong `JWT_SECRET` (32+ characters)
- [ ] Configure production database
- [ ] Set up proper CORS origins
- [ ] Enable SSL/TLS
- [ ] Set up file upload storage (S3, etc.)
- [ ] Configure logging and monitoring
- [ ] Set up backup strategy
- [ ] Review and adjust rate limits

### Environment Setup

```bash
# Production environment variables
NODE_ENV=production
DATABASE_URL=postgresql://prod_user:prod_pass@prod_host:5432/prod_db
JWT_SECRET=your-production-secret-min-32-chars
PORT=5000
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow existing code style
- Add appropriate error handling
- Update documentation for new features
- Test all endpoints before submitting PR

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Arafat Ratul**

- GitHub: [@ratul41907](https://github.com/ratul41907)
- Email: zamanratul419@gmail.com

## 🙏 Acknowledgments

- Built with [Express.js](https://expressjs.com/)
- Database powered by [Prisma](https://www.prisma.io/)
- Authentication with [JWT](https://jwt.io/)
- File uploads via [Multer](https://github.com/expressjs/multer)

## 📞 Support

For support, email zamanratul419@gmail.com or open an issue in the GitHub repository.

---

**⭐ If you find this project useful, please consider giving it a star!**
