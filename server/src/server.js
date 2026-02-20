// Path: E:\EduQuest\server\src\server.js

require("dotenv").config();
const app = require("./app");
const prisma = require("./prisma");

// ══════════════════════════════════════════════════════════════
// ENVIRONMENT VALIDATION
// ══════════════════════════════════════════════════════════════
const requiredEnvVars = [
  "DATABASE_URL",
  "JWT_SECRET",
  "PORT",
];

const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);

if (missingVars.length > 0) {
  console.error("❌ FATAL: Missing required environment variables:");
  missingVars.forEach((varName) => {
    console.error(`   - ${varName}`);
  });
  console.error("\n💡 Please add these to your .env file and restart.\n");
  process.exit(1);
}

console.log("✅ Environment variables validated");

// ══════════════════════════════════════════════════════════════
// START SERVER
// ══════════════════════════════════════════════════════════════
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀 EduQuest API running on http://localhost:${PORT}`);
  console.log(`📚 API Docs available at http://localhost:${PORT}/api/docs`);
  console.log(`💚 Health check at http://localhost:${PORT}/health`);
});

// ══════════════════════════════════════════════════════════════
// GRACEFUL SHUTDOWN HANDLER
// ══════════════════════════════════════════════════════════════
const gracefulShutdown = async (signal) => {
  console.log(`\n⚠️  ${signal} received. Starting graceful shutdown...`);

  // Stop accepting new connections
  server.close(async () => {
    console.log("✅ HTTP server closed");

    try {
      // Disconnect Prisma
      await prisma.$disconnect();
      console.log("✅ Database connections closed");

      console.log("✅ Graceful shutdown complete");
      process.exit(0);
    } catch (err) {
      console.error("❌ Error during shutdown:", err);
      process.exit(1);
    }
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    console.error("⏱️  Shutdown timeout. Forcing exit...");
    process.exit(1);
  }, 10000);
};

// Listen for termination signals
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// Handle uncaught errors
process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});