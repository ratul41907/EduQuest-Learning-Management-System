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

```
{
  "fullName": "MAX",
  "email": "teacher13@test.com",
  "password": "123456",
  "role": "INSTRUCTOR"
}
{
  "user": {
    "id": "cmktrziz50000wpzg3kozhpp1",
    "fullName": "MAX",
    "email": "teacher13@test.com",
    "role": "INSTRUCTOR",
    "totalPoints": 0,
    "level": 1,
    "createdAt": "2026-01-25T13:29:43.119Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbWt0cnppejUwMDAwd3B6ZzNrb3pocHAxIiwicm9sZSI6IklOU1RSVUNUT1IiLCJlbWFpbCI6InRlYWNoZXIxM0B0ZXN0LmNvbSIsImlhdCI6MTc2OTM0Nzc4MywiZXhwIjoxNzY5OTUyNTgzfQ.6w3ZtTiA18L1RrYbWEBgahneiIZ9bDRbhN5KHBL80g4"
}


```
