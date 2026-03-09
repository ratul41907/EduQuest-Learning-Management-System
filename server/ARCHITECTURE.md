# 🏗️ EduQuest System Architecture

System design and architecture documentation for EduQuest LMS.

---

## High-Level Architecture

```
┌─────────────┐
│   Client    │  (React/Next.js Frontend)
│  (Browser)  │
└──────┬──────┘
       │ HTTPS
       ▼
┌─────────────────────────────────────────┐
│         Nginx / Load Balancer           │
│         (Reverse Proxy + SSL)           │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│        Node.js + Express API            │
│         (Port 5000)                     │
│  ┌──────────────────────────────────┐  │
│  │  Middleware Layer                │  │
│  │  - Auth (JWT)                    │  │
│  │  - Rate Limiting                 │  │
│  │  - Validation                    │  │
│  │  - Logging (Winston)             │  │
│  │  - Caching (Redis)               │  │
│  └──────────────────────────────────┘  │
│  ┌──────────────────────────────────┐  │
│  │  Route Handlers                  │  │
│  │  - Auth, Courses, Users, etc.   │  │
│  └──────────────────────────────────┘  │
│  ┌──────────────────────────────────┐  │
│  │  WebSocket (Socket.io)           │  │
│  │  - Real-time notifications       │  │
│  └──────────────────────────────────┘  │
└───┬──────────┬──────────┬──────────────┘
    │          │          │
    ▼          ▼          ▼
┌─────────┐ ┌────────┐ ┌──────────┐
│PostgreSQL│ │ Redis  │ │  Email   │
│    DB    │ │ Cache  │ │ Service  │
└─────────┘ └────────┘ └──────────┘
```

---

## Technology Stack

### Backend

- **Runtime:** Node.js 20.x
- **Framework:** Express 5.x
- **Language:** JavaScript (ES6+)

### Database

- **Primary DB:** PostgreSQL 16.x
- **ORM:** Prisma 6.x
- **Cache:** Redis 7.x (ioredis)

### Real-time

- **WebSocket:** Socket.io 4.x

### Infrastructure

- **Containerization:** Docker + docker-compose
- **Process Manager:** PM2 (production)

---

## Data Flow

### User Authentication Flow

```
1. User submits credentials
   ↓
2. Validate input (middleware/validate.js)
   ↓
3. Check user in database (Prisma)
   ↓
4. Compare password hash (bcrypt)
   ↓
5. Generate JWT token (jsonwebtoken)
   ↓
6. Return token to client
   ↓
7. Client includes token in future requests
```

### Course Enrollment Flow

```
1. Student requests enrollment (POST /courses/:id/enroll)
   ↓
2. Verify JWT authentication
   ↓
3. Check if already enrolled
   ↓
4. Create enrollment record (Prisma)
   ↓
5. Send enrollment email (Nodemailer)
   ↓
6. Create notification (Database + WebSocket)
   ↓
7. Return success response
```

### Caching Flow

```
1. Request arrives (GET /courses)
   ↓
2. Check Redis cache (middleware/cache.js)
   ↓
3a. Cache HIT → Return cached data
   ↓
3b. Cache MISS → Query database
      ↓
      Store in Redis (TTL: 5 min)
      ↓
      Return fresh data
```

---

## Database Schema Overview

### Core Entities

- **User** (1) ↔ (M) **Enrollment**
- **User** (1) ↔ (M) **Course** (as instructor)
- **Course** (1) ↔ (M) **Lesson**
- **Course** (1) ↔ (M) **Quiz**
- **Quiz** (1) ↔ (M) **Question**
- **User** (M) ↔ (M) **Badge** (via UserBadge)
- **User** (1) ↔ (M) **Certificate**

### Relationships

```
User
├── enrollments (Student enrolls in courses)
├── coursesCreated (Instructor creates courses)
├── lessonProgress (Tracks lesson completion)
├── quizAttempts (Quiz submissions)
├── userBadges (Badges earned)
├── certificates (Certificates earned)
├── reviews (Course reviews)
└── notifications

Course
├── instructor (Created by User)
├── enrollments (Students enrolled)
├── lessons
├── quizzes
├── reviews
└── certificates

Lesson
├── course
└── lessonProgress (Completion by users)

Quiz
├── course
├── questions
└── attempts
```

---

## Middleware Pipeline

Every HTTP request goes through these middleware in order:

```
1. Trust Proxy
2. Helmet (Security headers)
3. CORS (Cross-origin)
4. Compression
5. Body parsers (JSON, URL-encoded)
6. IP Blocker (checkBlockedIP)
7. Sanitization (XSS, SQL, NoSQL injection prevention)
8. Rate Limiters (Global, Auth-specific, Upload, etc.)
9. Speed Limiter
10. Request Tracker (Analytics)
11. Logger (Winston HTTP logging)
12. Route Handlers
13. Error Handler (Global)
```

---

## Security Architecture

### Authentication

- **JWT-based** authentication
- Tokens expire in 7 days
- Payload: `{ sub: userId, role, email }`

### Authorization

- **Role-based access control (RBAC)**
- Roles: `STUDENT`, `INSTRUCTOR`, `ADMIN`
- Middleware: `requireAuth`, `requireRole`

### Rate Limiting

- **Global:** 100 req/15min per IP
- **Auth:** 5 req/15min (login, register)
- **Upload:** 10 req/15min
- **Admin:** 50 req/15min
- **Speed:** Max 10 req/second

### IP Blocking

- Automatic IP blocking after violations
- Block duration: 1-24 hours (configurable)
- Logged in security logs

### Input Sanitization

1. **XSS Prevention** - Remove `<script>` tags
2. **SQL Injection** - Pattern detection
3. **NoSQL Injection** - Remove `$`, `{}` from queries
4. **Null Bytes** - Remove `\0`

---

## Caching Strategy

### Cache Layers

1. **Application Cache** (Redis)
   - Courses list (TTL: 5 min)
   - Course details (TTL: 10 min)
   - Leaderboards (TTL: 2 min)
   - Search results (TTL: 2 min)

2. **Database Query Cache** (Prisma)
   - Enabled automatically

### Cache Invalidation

- **On CREATE:** Clear list caches
- **On UPDATE:** Clear specific item + lists
- **ON DELETE:** Clear all related caches

### Cache Keys Pattern

```
cache:/api/courses             → Courses list
cache:/api/courses/:id         → Course detail
cache:user:{userId}:/api/...   → User-specific data
```

---

## Logging Architecture

### Log Levels

- **error** - Application errors
- **warn** - Warnings (slow requests, deprecations)
- **info** - General info (auth events, startup)
- **http** - HTTP requests
- **debug** - Debugging info (development only)

### Log Types

1. **Application Logs** - General app activity
2. **Error Logs** - Errors and exceptions
3. **HTTP Logs** - All HTTP requests
4. **Security Logs** - Auth events, rate limits, IP blocks
5. **Exception Logs** - Unhandled exceptions
6. **Rejection Logs** - Unhandled promise rejections

### Log Rotation

- Daily rotation
- Retention: 7-30 days depending on type
- Max file size: 20MB

---

## WebSocket Architecture

### Connection Flow

```
1. Client connects with JWT token
   ↓
2. Authenticate user (socket.io middleware)
   ↓
3. Store userId ↔ socketId mapping
   ↓
4. Add to online users list
   ↓
5. Broadcast updated online users
   ↓
6. User can join course rooms
   ↓
7. Real-time events (messages, notifications)
```

### Events

**Client → Server:**

- `join-course`
- `leave-course`
- `typing`
- `course-message`

**Server → Client:**

- `notification` (individual)
- `online-users` (broadcast)
- `course-notification` (room)
- `user-joined-course`
- `course-message`

---

## File Upload Architecture

### Storage

- **Development:** Local filesystem (`uploads/`)
- **Production:** Recommended AWS S3 or Cloudinary

### Upload Types

1. **Profile Pictures**
   - Max size: 5MB
   - Formats: JPEG, PNG, GIF
   - Path: `uploads/profiles/`

2. **Course Thumbnails**
   - Max size: 10MB
   - Formats: JPEG, PNG
   - Path: `uploads/courses/`

3. **Lesson Images**
   - Max size: 10MB
   - Formats: JPEG, PNG, GIF
   - Path: `uploads/lessons/`

### Upload Flow

```
1. Multer middleware intercepts multipart/form-data
2. Validate file type and size
3. Generate unique filename (timestamp + original)
4. Save to disk (or upload to S3)
5. Store file path in database
6. Return file URL to client
```

---

## Scalability Considerations

### Horizontal Scaling

- **Stateless API** - Can run multiple instances
- **Session Storage** - JWT (no server-side sessions)
- **WebSocket** - Use sticky sessions or Redis adapter

### Database Scaling

- **Read Replicas** - For read-heavy operations
- **Connection Pooling** - Prisma handles this
- **Indexes** - On frequently queried fields

### Caching

- **Redis** - Reduces database load by 50-75%
- **CDN** - For static assets (future)

### Load Balancing

- **Nginx** - Reverse proxy + load balancer
- **Round-robin** - Distribute requests evenly

---

## Monitoring & Observability

### Health Checks

- Endpoint: `GET /health`
- Checks: Database connection, uptime

### Metrics to Monitor

- Request rate (req/sec)
- Response time (avg, p95, p99)
- Error rate (4xx, 5xx)
- Database query time
- Cache hit rate
- Memory usage
- CPU usage

### Recommended Tools

- **Application:** PM2, New Relic, DataDog
- **Errors:** Sentry, LogRocket
- **Uptime:** UptimeRobot, Pingdom
- **Logs:** ELK Stack, Papertrail

---

## Deployment Architecture

### Development

```
Local Machine
├── Node.js server (localhost:5000)
├── PostgreSQL (localhost:5432)
└── Redis (localhost:6380)
```

### Production (Docker)

```
Docker Host
├── Container: API (port 5000)
├── Container: PostgreSQL (port 5432)
└── Container: Redis (port 6379)
```

### Production (Cloud)

```
AWS/DigitalOcean
├── EC2/Droplet: Node.js + Nginx
├── RDS/Managed DB: PostgreSQL
├── ElastiCache: Redis
└── S3/Spaces: File storage
```

---

## API Versioning Strategy

### Version Strategy

- **URL-based versioning:** `/api/v1`, `/api/v2`
- **Default:** `/api` → v2 (latest)

### Version Lifecycle

- **v1:** Deprecated (sunset: 2027-01-01)
- **v2:** Current (stable)
- **v3:** Future

### Deprecation Process

1. Announce deprecation (6-12 months notice)
2. Add deprecation headers (`Warning`, `Sunset`)
3. Log usage of deprecated endpoints
4. Provide migration guide
5. Sunset old version

---

## Error Handling Architecture

### Error Types

1. **Validation Errors** (400) - Invalid input
2. **Authentication Errors** (401) - Missing/invalid token
3. **Authorization Errors** (403) - Insufficient permissions
4. **Not Found Errors** (404) - Resource doesn't exist
5. **Conflict Errors** (409) - Duplicate data
6. **Server Errors** (500) - Internal errors

### Error Response Format (v2)

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message"
  },
  "timestamp": "ISO 8601 timestamp"
}
```

### Error Logging

- All errors logged with context (user, IP, request)
- Stack traces in development only
- Error tracking service (Sentry) recommended

---

## Testing Architecture

### Test Layers

1. **Unit Tests** - Individual functions (middleware, utilities)
2. **Integration Tests** - API endpoints
3. **E2E Tests** - Full user flows (future)

### Test Database

- Separate test database (`eduquest_test`)
- Cleared before each test suite
- Seeded with test data

### Test Coverage Goals

- **Unit Tests:** 70%+
- **Integration Tests:** 50%+
- **Overall:** 60%+

---

## Future Enhancements

### Phase 2 (Next 6 months)

- [ ] Frontend (React/Next.js)
- [ ] Video streaming (AWS S3 + CloudFront)
- [ ] Payment integration (Stripe)
- [ ] Mobile app (React Native)

### Phase 3 (Next 12 months)

- [ ] AI-powered features (quiz generation, chatbot)
- [ ] Advanced analytics dashboard
- [ ] Mobile apps (iOS, Android)
- [ ] Multi-language support
- [ ] White-label solution

---

**Last Updated:** March 2026
