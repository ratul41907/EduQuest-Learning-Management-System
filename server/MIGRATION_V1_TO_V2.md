# API Migration Guide: v1 → v2

## Overview

API v2 introduces improved response formats, better error handling, and enhanced metadata.

## Key Changes

### 1. Response Format

**v1:**

```json
{
  "user": {...},
  "token": "..."
}
```

**v2:**

```json
{
  "success": true,
  "data": {
    "user": {...},
    "token": "...",
    "tokenExpiresIn": "7d"
  },
  "meta": {
    "version": "2.0.0",
    "timestamp": "2026-02-27T..."
  }
}
```

### 2. Error Format

**v1:**

```json
{
  "message": "Email already exists"
}
```

**v2:**

```json
{
  "success": false,
  "error": {
    "code": "EMAIL_EXISTS",
    "message": "Email already exists"
  },
  "timestamp": "..."
}
```

### 3. Endpoints Upgraded

#### Auth Endpoints

- `POST /api/v2/auth/register` - Enhanced with metadata
- `POST /api/v2/auth/login` - Improved error messages
- `GET /api/v2/auth/me` - Includes user stats

### 4. Headers

v2 includes these headers:

- `X-API-Version: 2.0.0`
- `Warning` (for deprecated endpoints)
- `Sunset` (RFC 8594 - deprecation date)

## Migration Steps

1. Update base URL from `/api/v1` to `/api/v2` (or just `/api`)
2. Update response parsing to handle new structure
3. Update error handling to use error codes
4. Test all endpoints

## Timeline

- v1 sunset: 2027-01-01
- v2 stable: Now
