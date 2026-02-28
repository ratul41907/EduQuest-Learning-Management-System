#!/bin/bash
# Path: E:\EduQuest\server\docker-start.sh

echo "🐳 Starting EduQuest Docker containers..."

# Wait for database to be ready
echo "⏳ Waiting for PostgreSQL..."
until pg_isready -h postgres -p 5432 -U eduquest; do
  sleep 2
done
echo "✅ PostgreSQL is ready"

# Wait for Redis to be ready
echo "⏳ Waiting for Redis..."
until redis-cli -h redis ping; do
  sleep 2
done
echo "✅ Redis is ready"

# Run Prisma migrations
echo "🔄 Running database migrations..."
npx prisma migrate deploy

# Seed database (optional - only first time)
if [ "$SEED_DB" = "true" ]; then
  echo "🌱 Seeding database..."
  npm run seed
fi

# Start the application
echo "🚀 Starting EduQuest API..."
node src/server.js