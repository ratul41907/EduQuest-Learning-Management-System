# EduQuest API Documentation (Day 14)

Base URL:

- http://localhost:5000

Health:

- GET /health

---

## Auth

### Register

- POST /api/auth/register
  Body:

```json
{
  "fullName": "Student One",
  "email": "studentday13@test.com",
  "password": "123456",
  "role": "STUDENT"
}
```

### Login

- **POST** `/api/auth/login`
- **Body:**

```json
{
  "email": "student2002@test.com",
  "password": "123456"
}
```
