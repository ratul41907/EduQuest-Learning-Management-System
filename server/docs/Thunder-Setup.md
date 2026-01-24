# Thunder Client Setup (EduQuest)

## Base URL

- http://localhost:5000

## Header format

For protected endpoints:

- Authorization: Bearer <TOKEN>
- Content-Type: application/json

## Token rule

Tokens are generated from:
POST /api/auth/login

Copy the token from the response and paste it into the Authorization header.

## Recommended environments (manual)

Create variables in Thunder Client (optional):

- BASE_URL = http://localhost:5000
- STUDENT_TOKEN = <paste token>
- INSTRUCTOR_TOKEN = <paste token>
