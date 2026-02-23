# 🎓 EduQuest - Learning Management System API

A production-ready e-learning platform backend built with Node.js, Express, Prisma ORM, and PostgreSQL. Features 75+ endpoints with JWT authentication, file uploads, email notifications, gamification, and enterprise-grade security.

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.x-blue.svg)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-5.x-brightgreen.svg)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-blue.svg)](https://www.postgresql.org/)

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [API Documentation](#api-documentation)
- [Security Features](#security-features)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [Database Schema](#database-schema)
- [Scripts](#scripts)
- [Testing](#testing)
- [License](#license)

## ✨ Features

### Core Functionality

- 🔐 **JWT Authentication** - Secure token-based auth with 7-day expiry and role-based access (Student, Instructor, Admin)
- 📚 **Course Management** - Complete CRUD with search, filtering, pagination, and thumbnails
- 📖 **Lesson System** - Ordered lessons with progress tracking and point rewards
- 📝 **Quiz System** - Multiple-choice quizzes with auto-grading, time limits, and instant feedback
- 🏆 **Gamification** - 4 auto-awarded badges, points system, and level progression
- 📜 **Certificates** - Auto-generated certificates with PDF download and public verification
- 🏅 **Leaderboards** - All-time, weekly, and per-course rankings with custom scoring
- ⭐ **Review System** - Student ratings and comments with automatic average calculation
- 🔔 **Notifications** - Real-time alerts for badges, completions, and enrollments
- 📊 **Analytics** - Request tracking, error logging, and performance monitoring
- 📁 **File Uploads** - Profile pictures and course thumbnails with Multer validation
- 📧 **Email System** - Welcome emails, enrollment confirmations, badge notifications, certificates, and password reset

### Security & Performance

- 🛡️ **Rate Limiting** - Global (100/15min), Auth (10/15min), Upload (20/hour), Admin (200/15min)
- 🚫 **IP Blocking** - Automatic temporary blocking for suspicious activity
- 🔒 **Input Sanitization** - XSS protection, NoSQL injection prevention, SQL injection detection
- 🗜️ **Response Compression** - Gzip compression for reduced payload sizes
- ⚡ **Database Optimization** - 50+ strategic indexes for fast queries
- 🔐 **Security Headers** - Helmet.js implementation with CSP and frame protection
- 📝 **Request Logging** - Comprehensive request/response logging with timestamps
- 🎯 **CORS Protection** - Configurable origin whitelist with credential support

### Role-Based Features

**Students Can:**

- Browse and enroll in courses with progress tracking
- Complete lessons and earn points (10 points/lesson)
- Take quizzes with instant feedback and grading
- Collect 4 achievement badges (First Lesson, Quiz Starter, Perfect Score, Course Finisher)
- View leaderboards (all-time, weekly, per-course)
- Submit course reviews and ratings
- Download completion certificates as PDF
- Upload profile pictures (2MB limit)
- Receive email notifications for all activities

**Instructors Can:**

- Create and manage unlimited courses
- Add lessons with custom ordering and point values
- Create quizzes with multiple-choice questions
- Upload course thumbnails (5MB limit)
- View detailed student progress and analytics
- Access course-specific statistics (enrollment, completion, ratings)
- Manage course enrollments
- Receive email notifications for new enrollments

**Admins Can:**

- Full user management (create, update, delete, role changes, point adjustments)
- Platform-wide analytics and insights
- Create and award badges manually
- Send mass notifications with role filtering
- Access comprehensive reports:
  - User growth trends (daily breakdown by role)
  - Enrollment analytics with revenue tracking
  - Quiz performance metrics
  - Revenue reports with course breakdown
- Force delete any content
- View all notifications across the platform
- Adjust user points and levels manually

## 🛠️ Tech Stack

### Backend

- **Runtime:** Node.js 18+
- **Framework:** Express.js 4.x
- **ORM:** Prisma 5.x
- **Database:** PostgreSQL 14+
- **Authentication:** JWT (jsonwebtoken)
- **Password Hashing:** bcrypt (10 salt rounds)
- **File Upload:** Multer with file type validation
- **PDF Generation:** PDFKit
- **Email:** Nodemailer with HTML templates
- **Validation:** Custom middleware with regex patterns
- **Security:** Helmet.js, CORS, manual XSS/injection protection
- **Performance:** compression, express-rate-limit, express-slow-down

### Development Tools

- **API Testing:** Postman / Thunder Client
- **Database GUI:** Prisma Studio
- **Version Control:** Git & GitHub

## 🚀 Getting Started

### Prerequisites

- Node.js 18 or higher
- PostgreSQL 14 or higher
- npm or yarn
- Gmail account (for email features)

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/ratul41907/EduQuest-Learning-Management-System.git
cd EduQuest-Learning-Management-System/server
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

Create a `.env` file in the `server` directory:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/eduquest"

# Authentication
JWT_SECRET="your-super-secret-jwt-key-min-32-characters-change-in-production"

# Server
PORT=5000
NODE_ENV=development

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# Email (Optional - for email notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-gmail-app-password
FRONTEND_URL=http://localhost:3000
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
# or
node src/server.js
```

The API will be available at `http://localhost:5000`

### Quick Test

```bash
# Check server health
curl http://localhost:5000/health

# View API documentation
curl http://localhost:5000/api/docs

# View analytics
curl http://localhost:5000/analytics
```

## 📚 API Documentation

Full API documentation is available at:

```
GET http://localhost:5000/api/docs
```

### Quick API Reference

| Category      | Endpoint                            | Method | Auth          | Rate Limit |
| ------------- | ----------------------------------- | ------ | ------------- | ---------- |
| **Auth**      | `/api/auth/register`                | POST   | ❌            | 10/15min   |
|               | `/api/auth/login`                   | POST   | ❌            | 10/15min   |
|               | `/api/auth/forgot-password`         | POST   | ❌            | 10/15min   |
|               | `/api/auth/reset-password`          | POST   | ❌            | 10/15min   |
|               | `/api/auth/me`                      | GET    | ✅            | 100/15min  |
| **Courses**   | `/api/courses`                      | GET    | ❌            | 100/15min  |
|               | `/api/courses`                      | POST   | ✅ Instructor | 100/15min  |
|               | `/api/courses/:id`                  | GET    | ❌            | 100/15min  |
|               | `/api/courses/:id/enroll`           | POST   | ✅ Student    | 100/15min  |
|               | `/api/courses/:id/upload-thumbnail` | POST   | ✅ Instructor | 20/hour    |
| **User**      | `/api/user/me/upload-picture`       | POST   | ✅            | 20/hour    |
| **Admin**     | `/api/admin/stats`                  | GET    | ✅ Admin      | 200/15min  |
|               | `/api/admin/users`                  | GET    | ✅ Admin      | 200/15min  |
|               | `/api/admin/reports/*`              | GET    | ✅ Admin      | 200/15min  |
| **Analytics** | `/analytics`                        | GET    | Public        | 100/15min  |

> **Note:** View complete endpoint list at `/api/docs`

## 🔒 Security Features

### Authentication & Authorization

- JWT tokens with 7-day expiry
- bcrypt password hashing (10 salt rounds)
- Role-based access control (Student, Instructor, Admin)
- Secure password reset with 1-hour token expiry

### Rate Limiting & Throttling

- **Global:** 100 requests per 15 minutes per IP
- **Authentication:** 10 requests per 15 minutes (strict)
- **File Uploads:** 20 uploads per hour
- **Admin Actions:** 200 requests per 15 minutes
- **Speed Limiter:** Adds progressive delays after 50 requests

### IP Blocking System

- Automatic temporary blocking after repeated rate limit violations
- 30-minute block for general abuse
- 1-hour block for authentication abuse
- Memory-based storage with automatic expiry

### Input Validation & Sanitization

- **XSS Protection:** Strips script tags, iframes, javascript: protocols, event handlers
- **NoSQL Injection:** Removes $ operators and dot notation from queries
- **SQL Injection:** Detects and blocks common SQL keywords (SELECT, DROP, UNION, etc.)
- **Null Byte Removal:** Prevents null byte injection attacks
- **Whitespace Trimming:** Automatic trimming of all string inputs

### File Upload Security

- File type validation (JPEG, PNG, WEBP only)
- Size limits (2MB profiles, 5MB courses)
- Unique filename generation with timestamps
- Automatic old file cleanup

### Headers & Network Security

- Helmet.js security headers
- CORS with origin whitelist
- Request size limits (10MB)
- Trust proxy configuration for accurate IP detection

## 📁 Project Structure

```
server/
├── src/
│   ├── middleware/
│   │   ├── auth.js              # JWT authentication & role checks
│   │   ├── validate.js          # Input validation with custom rules
│   │   ├── logger.js            # Request/response logging
│   │   ├── rateLimiter.js       # Rate limiting & IP blocking
│   │   ├── sanitize.js          # XSS/injection protection
│   │   ├── analytics.js         # Request tracking & monitoring
│   │   └── upload.js            # File upload handling (Multer)
│   ├── routes/
│   │   ├── auth.routes.js       # Registration, login, password reset
│   │   ├── user.routes.js       # Profile, dashboard, uploads
│   │   ├── course.routes.js     # Course CRUD, enrollment, thumbnails
│   │   ├── lesson.routes.js     # Lessons, completion, points
│   │   ├── quiz.routes.js       # Quiz attempts, scoring
│   │   ├── question.routes.js   # Quiz questions
│   │   ├── badge.routes.js      # Badge management
│   │   ├── notification.routes.js # Notifications
│   │   ├── leaderboard.routes.js # Rankings
│   │   ├── review.routes.js     # Course reviews
│   │   ├── certificate.routes.js # Certificate generation & verification
│   │   ├── instructor.routes.js # Instructor dashboard
│   │   ├── admin.routes.js      # Admin panel & reports
│   │   └── docs.routes.js       # API documentation
│   ├── utils/
│   │   └── email.js             # Email templates & sending
│   ├── app.js                   # Express app setup
│   ├── server.js                # Server entry with graceful shutdown
│   └── prisma.js                # Prisma client
├── prisma/
│   ├── schema.prisma            # Database schema with 13 models
│   └── seed.js                  # Database seeding script
├── uploads/                     # User-uploaded files
│   ├── profiles/                # Profile pictures
│   ├── courses/                 # Course thumbnails
│   └── lessons/                 # Lesson images
├── tests/                       # API test collections
│   ├── thunder-client-collection.json
│   └── API_TEST_GUIDE.md
├── package.json
└── .env
```

## 🗄️ Database Schema

The application uses 13 Prisma models with 50+ optimized indexes:

### Core Models

- **User** - Authentication, profiles, points, levels, roles
- **Course** - Course metadata, pricing, thumbnails
- **Lesson** - Ordered lessons with content and points
- **Enrollment** - Student-course relationships with progress
- **LessonProgress** - Lesson completion tracking

### Assessment Models

- **Quiz** - Quiz metadata with time limits and pass scores
- **Question** - Multiple-choice questions with correct answers
- **QuizAttempt** - Student quiz submissions with scores

### Gamification Models

- **Badge** - Achievement badges (4 types)
- **UserBadge** - Badge awards with timestamps
- **Certificate** - Course completion certificates with verification codes

### Social Models

- **Review** - Course ratings and comments
- **Notification** - User notifications for various events

### Key Relationships

```
User (1) ──→ (N) Enrollment ──→ (1) Course
User (1) ──→ (N) LessonProgress ──→ (1) Lesson
User (1) ──→ (N) QuizAttempt ──→ (1) Quiz
Course (1) ──→ (N) Lesson
Course (1) ──→ (N) Quiz ──→ (N) Question
User (1) ──→ (N) UserBadge ──→ (1) Badge
User (1) ──→ (N) Certificate ──→ (1) Course
```

### Database Indexes (50+ total)

- User: email, totalPoints, role
- Course: level, price, instructorId
- Enrollment: progress, userId, courseId
- QuizAttempt: passed, createdAt, userId, quizId
- Review: rating, courseId, userId
- Notification: isRead, createdAt, userId
- Certificate: code, userId, courseId

View the full schema in `prisma/schema.prisma`

## 📜 Scripts

```bash
# Development
npm run dev          # Start development server with nodemon
node src/server.js   # Start production server

# Database
npm run seed         # Seed database with test data
npx prisma studio    # Open Prisma Studio GUI
npx prisma db push   # Push schema changes to database
npx prisma generate  # Generate Prisma Client

# Testing
# Import tests/thunder-client-collection.json into Thunder Client/Postman
```

## 🔑 Environment Variables

| Variable          | Description                                     | Required | Example                                       |
| ----------------- | ----------------------------------------------- | -------- | --------------------------------------------- |
| `DATABASE_URL`    | PostgreSQL connection string                    | ✅       | `postgresql://user:pass@localhost:5432/db`    |
| `JWT_SECRET`      | Secret key for JWT signing (min 32 chars)       | ✅       | `super-secret-key-change-in-production`       |
| `PORT`            | Server port                                     | ✅       | `5000`                                        |
| `NODE_ENV`        | Environment mode                                | ✅       | `development` or `production`                 |
| `ALLOWED_ORIGINS` | CORS allowed origins (comma-separated)          | ✅       | `http://localhost:3000,http://localhost:5173` |
| `EMAIL_HOST`      | SMTP server host                                | ❌       | `smtp.gmail.com`                              |
| `EMAIL_PORT`      | SMTP server port                                | ❌       | `587`                                         |
| `EMAIL_USER`      | Email account username                          | ❌       | `your-email@gmail.com`                        |
| `EMAIL_PASSWORD`  | Email account password (app password for Gmail) | ❌       | `your-app-password`                           |
| `FRONTEND_URL`    | Frontend application URL                        | ❌       | `http://localhost:3000`                       |

## 🧪 Testing

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

### Manual Testing

1. Import `tests/thunder-client-collection.json` into Thunder Client or Postman
2. Create environment variables for tokens
3. Follow test sequence in `tests/API_TEST_GUIDE.md`

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

**View analytics:**

```bash
curl http://localhost:5000/analytics
```

## 📊 Key Features Explained

### Badge System

4 auto-awarded badges with point bonuses:

- **FIRST_LESSON** (20 points) - Complete your first lesson
- **COURSE_FINISHER** (50 points) - Complete all lessons in a course (100% progress)
- **FIRST_QUIZ** (25 points) - Complete your first quiz attempt
- **PERFECT_SCORE** (25 points) - Score 100% on any quiz

### Leaderboard Scoring Formula

```javascript
score = (progress × 0.6) + min(quizPoints × 0.4, 40)
// 60% weight on course progress
// 40% weight on quiz points (capped at 40)
```

### Certificate Generation

- Auto-generated when course progress reaches 100%
- Unique verification code format: `CERT-{userId}-{timestamp}`
- Downloadable as PDF with course and instructor details
- Public verification endpoint: `/api/certificates/verify/:code`

### Level System

```javascript
level = floor(totalPoints / 100) + 1;
// Level 1: 0-99 points
// Level 2: 100-199 points
// Level 3: 200-299 points
// etc.
```

### Email Templates

- **Welcome Email** - Sent on registration with platform introduction
- **Enrollment Email** - Sent to student on course enrollment
- **Instructor Notification** - Sent to instructor when new student enrolls
- **Badge Email** - Sent when user earns a badge with description
- **Certificate Email** - Sent on course completion with download link
- **Password Reset** - Sent with 1-hour expiry token

### Rate Limiting Behavior

- After hitting rate limit, requests return 429 with `retryAfter` header
- 3 consecutive rate limit hits trigger automatic IP blocking
- Auth endpoint abuse (10+ attempts) triggers 1-hour IP block
- General abuse triggers 30-minute IP block
- Blocks stored in memory and auto-expire

### Analytics Tracking

- Total requests by endpoint, method, and status code
- Top 10 most-used endpoints
- Last 100 errors with timestamps and details
- Last 50 slow requests (>1 second)
- Server uptime and start time
- Request tracking in real-time

## 🚢 Deployment

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use strong `JWT_SECRET` (32+ random characters)
- [ ] Configure production PostgreSQL database
- [ ] Set proper `ALLOWED_ORIGINS` (your frontend domains)
- [ ] Enable SSL/TLS
- [ ] Configure production email service (SendGrid/AWS SES)
- [ ] Set up file storage (AWS S3/Cloudinary)
- [ ] Configure logging service (Winston/CloudWatch)
- [ ] Set up monitoring (Sentry/New Relic)
- [ ] Implement database backup strategy
- [ ] Review and adjust rate limits for production load
- [ ] Set up reverse proxy (Nginx)
- [ ] Configure environment-specific CORS
- [ ] Enable database connection pooling
- [ ] Set up CDN for static assets

### Production Environment Example

```env
NODE_ENV=production
DATABASE_URL=postgresql://prod_user:prod_pass@prod_host:5432/prod_db
JWT_SECRET=your-production-secret-min-32-chars-random
PORT=5000
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASSWORD=your-sendgrid-api-key
FRONTEND_URL=https://yourdomain.com
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow existing code style and patterns
- Add appropriate error handling
- Update documentation for new features
- Test all endpoints before submitting PR
- Keep commits atomic and well-described

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Arafat Zaman Ratul**

- GitHub: [@ratul41907](https://github.com/ratul41907)
- Email: zamanratul419@gmail.com

## 🙏 Acknowledgments

- Built with [Express.js](https://expressjs.com/)
- Database powered by [Prisma](https://www.prisma.io/)
- Authentication with [JWT](https://jwt.io/)
- File uploads via [Multer](https://github.com/expressjs/multer)
- Email service via [Nodemailer](https://nodemailer.com/)
- Security by [Helmet.js](https://helmetjs.github.io/)

## 📞 Support

For support, email zamanratul419@gmail.com or open an issue in the GitHub repository.

---

## 📈 Project Stats

- **Total Endpoints:** 75+
- **Route Files:** 14
- **Middleware:** 6 custom layers
- **Database Models:** 13
- **Database Indexes:** 50+
- **Development Time:** 17 days
- **Lines of Code:** ~5,000+

---

## 🎯 Roadmap

- [ ] WebSocket integration for real-time notifications
- [ ] Redis caching layer for improved performance
- [ ] Advanced logging with Winston
- [ ] Docker containerization
- [ ] API versioning (/api/v1, /api/v2)
- [ ] Elasticsearch for advanced search
- [ ] Payment integration (Stripe)
- [ ] Video streaming support
- [ ] Mobile app API enhancements
- [ ] GraphQL endpoint

---

**⭐ If you find this project useful, please consider giving it a star!**

**Built with ❤️ by Arafat Zaman Ratul**
