// Path: E:\EduQuest\server\src\server.js

require("dotenv").config();
const http = require("http");
const app = require("./app");
const prisma = require("./prisma");
const { closeRedis } = require("./config/redis");
const { initializeSocket } = require("./config/socket"); // Day 20

const PORT = process.env.PORT || 5000;

// ══════════════════════════════════════════════════════════════
// VALIDATE REQUIRED ENVIRONMENT VARIABLES
// ══════════════════════════════════════════════════════════════
const requiredEnvVars = ["DATABASE_URL", "JWT_SECRET", "PORT"];
const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);

if (missingVars.length > 0) {
  console.error(`❌ Missing required environment variables: ${missingVars.join(", ")}`);
  process.exit(1);
}

console.log("✅ Environment variables validated");

// ══════════════════════════════════════════════════════════════
// CREATE HTTP SERVER
// ══════════════════════════════════════════════════════════════
const server = http.createServer(app);

// ══════════════════════════════════════════════════════════════
// DAY 20: INITIALIZE SOCKET.IO
// ══════════════════════════════════════════════════════════════
initializeSocket(server);
console.log("🔌 Socket.io initialized");

// ══════════════════════════════════════════════════════════════
// START SERVER
// ══════════════════════════════════════════════════════════════
server.listen(PORT, () => {
  console.log(`🚀 EduQuest API running on http://localhost:${PORT}`);
  console.log(`📚 API Docs available at http://localhost:${PORT}/api/docs`);
  console.log(`💚 Health check at http://localhost:${PORT}/health`);
});

// ══════════════════════════════════════════════════════════════
// GRACEFUL SHUTDOWN
// ══════════════════════════════════════════════════════════════
async function gracefulShutdown() {
  console.log("\n🛑 Shutting down gracefully...");

  server.close(() => {
    console.log("✅ HTTP server closed");
  });

  try {
    await prisma.$disconnect();
    console.log("✅ Database connections closed");

    await closeRedis();
    console.log("✅ Redis connection closed");

    console.log("✅ Graceful shutdown complete");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error during shutdown:", err);
    process.exit(1);
  }

  setTimeout(() => {
    console.error("⏱️  Forced shutdown after timeout");
    process.exit(1);
  }, 10000);
}

process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);

process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
});

process.on("uncaughtException", (error) => {
  console.error("❌ Uncaught Exception:", error);
  process.exit(1);
});