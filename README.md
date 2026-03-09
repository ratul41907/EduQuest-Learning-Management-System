# 🎓 EduQuest - Learning Management System API

A comprehensive, production-ready Learning Management System (LMS) backend built with Node.js, Express, PostgreSQL, Redis, and Socket.io.

[![Node.js](https://img.shields.io/badge/Node.js-20.x-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.x-blue.svg)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16.x-blue.svg)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-7.x-red.svg)](https://redis.io/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](https://www.docker.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 🌟 Features

### Core Functionality

- ✅ **75+ RESTful API Endpoints** - Complete CRUD operations
- ✅ **Authentication & Authorization** - JWT-based with role-based access control (RBAC)
- ✅ **User Roles** - Student, Instructor, Admin
- ✅ **Course Management** - Create, update, delete courses with lessons and quizzes
- ✅ **Quiz System** - Multiple choice questions with auto-grading
- ✅ **Progress Tracking** - Real-time student progress monitoring
- ✅ **Certificate Generation** - Automatic certificate issuance upon course completion

### Gamification

- 🎮 **Point System** - Earn points for completing lessons and quizzes
- 🏆 **Badges** - 10+ achievement badges (First Lesson, Course Finisher, Quiz Master, etc.)
- 📊 **Leaderboards** - All-time and weekly rankings
- 📈 **Leveling System** - Progressive user levels based on total points

### Advanced Features

- 🔒 **Security** - Rate limiting, XSS protection, SQL injection prevention, IP blocking
- 📧 **Email Notifications** - Welcome emails, password reset, course enrollment, badges earned
- 📁 **File Uploads** - Profile pictures, course thumbnails, lesson images (Multer)
- 🔍 **Advanced Search** - Full-text search, fuzzy search, faceted search, auto-complete
- 💾 **Redis Caching** - High-performance caching with 75%+ hit rate
- 🔌 **WebSocket (Socket.io)** - Real-time notifications, online user tracking, chat rooms
- 📝 **Logging** - Winston with daily file rotation (application, error, HTTP, security logs)
- 🐳 **Docker Support** - Complete containerization with docker-compose
- 🔄 **API Versioning** - v1 (deprecated) and v2 (current) with structured responses
- 🧪 **Testing Suite** - Jest + Supertest with unit and integration tests

---

## 🏗️ Tech Stack

### Backend

- **Runtime:** Node.js 20.x
- **Framework:** Express 5.x
- **Database:** PostgreSQL 16.x
- **ORM:** Prisma 6.x
- **Cache:** Redis 7.x (ioredis)
- **Real-time:** Socket.io 4.x

### Security & Middleware

- **Authentication:** JWT (jsonwebtoken)
- **Password Hashing:** bcrypt
- **Rate Limiting:** express-rate-limit
- **Security Headers:** Helmet
- **CORS:** cors
- **Compression:** compression

### Development & DevOps

- **Logging:** Winston + winston-daily-rotate-file
- **Testing:** Jest + Supertest
- **Containerization:** Docker + docker-compose
- **File Upload:** Multer
- **Email:** Nodemailer
- **Search:** Fuse.js (fuzzy search)

---

## 📊 Project Statistics

- **Total Endpoints:** 75+
- **Database Tables:** 15
- **API Versions:** 2 (v1, v2)
- **Security Middleware:** 7+
- **Test Coverage:** 40-60%
- **Docker Services:** 3 (API, PostgreSQL, Redis)
- **Email Templates:** 6
- **Badge Types:** 10+

---

## 🚀 Quick Start

### Prerequisites

- Node.js 20.x or higher
- PostgreSQL 16.x
- Redis 7.x (optional, for caching)
- npm or yarn

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

```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Create database**

```bash
createdb eduquest
# Or use pgAdmin to create database
```

5. **Run Prisma migrations**

```bash
npx prisma migrate deploy
```

6. **Seed the database** (optional)

```bash
npm run seed
```

7. **Start the server**

```bash
# Development mode
npm run dev

# Production mode
npm start
```

Server will be running at: `http://localhost:5000`

---

## 🐳 Docker Deployment

### Quick Start with Docker

```bash
# Build and start all services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f api

# Stop services
docker-compose down
```

### Docker Services

- **API:** Port 5000
- **PostgreSQL:** Port 5432
- **Redis:** Port 6379

See [DOCKER.md](DOCKER.md) for detailed Docker documentation.

---

## 📁 Project Structure

```
server/
├── src/
│   ├── config/           # Configuration files
│   │   ├── logger.js     # Winston logger config
│   │   ├── redis.js      # Redis client setup
│   │   └── socket.js     # Socket.io configuration
│   ├── middleware/       # Express middleware
│   │   ├── auth.js       # JWT authentication
│   │   ├── validate.js   # Request validation
│   │   ├── rateLimiter.js # Rate limiting & IP blocking
│   │   ├── sanitize.js   # XSS & SQL injection protection
│   │   ├── cache.js      # Redis caching middleware
│   │   ├── logger.js     # HTTP request logging
│   │   └── analytics.js  # Request tracking
│   ├── routes/           # API route handlers
│   │   ├── v1/           # API v1 (deprecated)
│   │   ├── v2/           # API v2 (current)
│   │   ├── auth.routes.js
│   │   ├── course.routes.js
│   │   ├── lesson.routes.js
│   │   ├── quiz.routes.js
│   │   ├── user.routes.js
│   │   ├── badge.routes.js
│   │   ├── leaderboard.routes.js
│   │   ├── notification.routes.js
│   │   ├── search.routes.js
│   │   └── ... (15+ route files)
│   ├── services/         # Business logic
│   │   └── search.service.js
│   ├── utils/            # Utility functions
│   │   └── email.js      # Email sending
│   ├── app.js            # Express app setup
│   ├── server.js         # Server entry point
│   └── prisma.js         # Prisma client
├── prisma/
│   ├── schema.prisma     # Database schema
│   ├── migrations/       # Database migrations
│   └── seed.js           # Database seeding
├── tests/
│   ├── unit/             # Unit tests
│   ├── integration/      # Integration tests
│   ├── helpers/          # Test utilities
│   └── setup.js          # Test configuration
├── uploads/              # Uploaded files
│   ├── profiles/
│   ├── courses/
│   └── lessons/
├── logs/                 # Application logs
├── public/               # Static files
│   └── socket-test.html  # WebSocket test page
├── docker-compose.yml    # Docker compose config
├── Dockerfile            # Docker image
├── jest.config.js        # Jest configuration
├── .env                  # Environment variables
└── package.json          # Dependencies
```

---

## 🔑 Environment Variables

Create a `.env` file in the root directory:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/eduquest

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Redis (optional)
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# Email (Gmail example)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
FRONTEND_URL=http://localhost:3000

# Logging
LOG_LEVEL=info
```

---

## 📖 API Documentation

### Base URL

```
http://localhost:5000/api
```

### API Versions

- **v1:** `/api/v1/*` (Deprecated, sunset: 2027-01-01)
- **v2:** `/api/v2/*` (Current, recommended)
- **Default:** `/api/*` (Uses v2)

### Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Response Format (v2)

**Success Response:**

```json
{
  "success": true,
  "data": {
    // Response data
  },
  "meta": {
    "version": "2.0.0",
    "timestamp": "2026-03-04T..."
  }
}
```

**Error Response:**

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description"
  },
  "timestamp": "2026-03-04T..."
}
```

### Key Endpoints

#### Authentication

```
POST   /api/v2/auth/register          - Register new user
POST   /api/v2/auth/login             - Login
GET    /api/v2/auth/me                - Get current user info
POST   /api/v2/auth/forgot-password   - Request password reset
POST   /api/v2/auth/reset-password    - Reset password
```

#### Courses

```
GET    /api/v2/courses                - List all courses (with search/filters)
POST   /api/v2/courses                - Create course (Instructor only)
GET    /api/v2/courses/:id            - Get course by ID
PATCH  /api/v2/courses/:id            - Update course
DELETE /api/v2/courses/:id            - Delete course
POST   /api/v2/courses/:id/enroll     - Enroll in course (Student only)
GET    /api/v2/courses/:id/stats      - Get course statistics
GET    /api/v2/courses/:id/leaderboard - Get course leaderboard
```

#### Lessons

```
GET    /api/lessons/course/:courseId  - Get lessons for a course
POST   /api/lessons                   - Create lesson (Instructor only)
GET    /api/lessons/:id               - Get lesson by ID
PATCH  /api/lessons/:id               - Update lesson
DELETE /api/lessons/:id               - Delete lesson
POST   /api/lessons/:id/complete      - Mark lesson as complete (Student)
```

#### Quizzes

```
GET    /api/quizzes/course/:courseId  - Get quizzes for a course
POST   /api/quizzes                   - Create quiz (Instructor only)
GET    /api/quizzes/:id               - Get quiz by ID
POST   /api/quizzes/:id/attempt       - Submit quiz attempt (Student)
GET    /api/quizzes/:id/attempts      - Get my attempts
```

#### Search

```
GET    /api/search/courses            - Search courses (full-text, filters)
GET    /api/search/lessons            - Search lessons
GET    /api/search/global             - Search everything
GET    /api/search/suggestions        - Auto-complete suggestions
GET    /api/search/fuzzy              - Typo-tolerant search
GET    /api/search/popular            - Popular search terms
```

#### Leaderboard

```
GET    /api/leaderboard/all-time      - All-time top users
GET    /api/leaderboard/weekly        - Weekly top users
```

#### Admin

```
GET    /api/admin/users               - List all users (Admin only)
GET    /api/admin/analytics           - System analytics
GET    /api/admin/reports             - Generate reports
```

See [API.md](API.md) for complete endpoint documentation.

---

## 🧪 Testing

```bash
# Run all tests
npm test

# Run unit tests only
npm run test:unit

# Run integration tests
npm run test:integration

# Generate coverage report
npm run test:coverage

# Watch mode
npm run test:watch
```

---

## 📊 Database Schema

### Core Tables

- **User** - User accounts (Student, Instructor, Admin)
- **Course** - Courses created by instructors
- **Lesson** - Lessons within courses
- **Quiz** - Quizzes for courses
- **Question** - Quiz questions
- **Enrollment** - Student course enrollments
- **LessonProgress** - Lesson completion tracking
- **QuizAttempt** - Quiz submission records
- **Badge** - Achievement badges
- **UserBadge** - Badges earned by users
- **Certificate** - Course completion certificates
- **Review** - Course reviews
- **Notification** - User notifications

See [prisma/schema.prisma](prisma/schema.prisma) for complete schema.

---

## 🔐 Security Features

- ✅ **JWT Authentication** - Secure token-based auth
- ✅ **Password Hashing** - bcrypt with salt rounds
- ✅ **Rate Limiting** - Prevent brute force attacks
- ✅ **IP Blocking** - Automatic IP blocking after violations
- ✅ **XSS Protection** - Input sanitization
- ✅ **SQL Injection Prevention** - Prisma ORM + validation
- ✅ **NoSQL Injection Prevention** - Request sanitization
- ✅ **CORS** - Configured allowed origins
- ✅ **Helmet** - Security headers
- ✅ **Request Size Limits** - 10MB max payload
- ✅ **Logging** - Security event tracking

---

## 📝 Logging

Logs are stored in the `logs/` directory with daily rotation:

- **application-YYYY-MM-DD.log** - All logs (14 days retention)
- **error-YYYY-MM-DD.log** - Errors only (30 days retention)
- **http-YYYY-MM-DD.log** - HTTP requests (7 days retention)
- **exceptions-YYYY-MM-DD.log** - Unhandled exceptions (30 days)
- **rejections-YYYY-MM-DD.log** - Unhandled promise rejections (30 days)

Log levels: `error`, `warn`, `info`, `http`, `debug`

---

## 🚀 Production Deployment

### Pre-deployment Checklist

- [ ] Update `.env` with production values
- [ ] Change `JWT_SECRET` to a strong random string (32+ characters)
- [ ] Set `NODE_ENV=production`
- [ ] Configure production database
- [ ] Set up Redis (for caching)
- [ ] Configure email service (SMTP)
- [ ] Update `ALLOWED_ORIGINS` with your frontend URL
- [ ] Set up SSL/TLS certificates
- [ ] Configure reverse proxy (Nginx/Apache)
- [ ] Set up monitoring (PM2, New Relic, etc.)
- [ ] Configure backups
- [ ] Test all endpoints
- [ ] Run security audit: `npm audit`

### Deployment Platforms

- **Docker:** Use included docker-compose setup
- **Heroku:** See [HEROKU.md](HEROKU.md)
- **AWS:** EC2 + RDS + ElastiCache
- **DigitalOcean:** App Platform or Droplet
- **Railway:** One-click deploy
- **Render:** Free tier available

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Ratul Zaman**

- GitHub: [@ratul41907](https://github.com/ratul41907)
- Email: zamanratul419@gmail.com

---

## 🙏 Acknowledgments

- Built with Node.js, Express, and PostgreSQL
- Inspired by modern LMS platforms like Udemy, Coursera
- Special thanks to the open-source community

---

## 📞 Support

For issues, questions, or suggestions:

- **GitHub Issues:** [Create an issue](https://github.com/ratul41907/EduQuest-Learning-Management-System/issues)
- **Email:** zamanratul419@gmail.com

---

**⭐ Star this repo if you find it helpful!**
