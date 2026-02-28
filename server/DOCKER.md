# Docker Deployment Guide

## Prerequisites

- Docker Desktop installed
- Docker Compose v2.0+

## Quick Start

### 1. Build and Start Containers

```bash
npm run docker:build
npm run docker:up
```

### 2. Check Status

```bash
docker-compose ps
```

### 3. View Logs

```bash
npm run docker:logs
```

### 4. Access API

```
http://localhost:5000/health
```

## Environment Variables

Copy `.env.docker` to `.env` and update:

```bash
cp .env.docker .env
# Edit .env with your values
```

## Docker Commands

### Start containers

```bash
docker-compose up -d
```

### Stop containers

```bash
docker-compose down
```

### Rebuild after code changes

```bash
docker-compose up -d --build
```

### View logs

```bash
docker-compose logs -f api
docker-compose logs -f postgres
docker-compose logs -f redis
```

### Execute commands in container

```bash
# Access API container
docker exec -it eduquest-api sh

# Access PostgreSQL
docker exec -it eduquest-postgres psql -U eduquest -d eduquest

# Access Redis
docker exec -it eduquest-redis redis-cli
```

### Database migrations

```bash
docker exec -it eduquest-api npx prisma migrate deploy
```

### Seed database

```bash
docker exec -it eduquest-api npm run seed
```

## Volumes

Data is persisted in Docker volumes:

- `postgres_data` - Database files
- `redis_data` - Redis persistence
- `./uploads` - Uploaded files (bind mount)
- `./logs` - Application logs (bind mount)

## Ports

- **5000** - API Server
- **5432** - PostgreSQL
- **6379** - Redis

## Troubleshooting

### Container won't start

```bash
docker-compose logs api
```

### Database connection issues

```bash
docker-compose exec postgres pg_isready -U eduquest
```

### Reset everything (DANGER - deletes data)

```bash
npm run docker:clean
```

## Production Deployment

1. Update `.env` with production values
2. Change database password in `docker-compose.yml`
3. Use a strong JWT_SECRET
4. Configure proper ALLOWED_ORIGINS
5. Set up SSL/TLS (use reverse proxy like Nginx)
6. Enable production logging
7. Set up automated backups
