// Path: E:\EduQuest\server\src\prisma.js

const { PrismaClient } = require("@prisma/client");  // Import PrismaClient

const prisma = new PrismaClient();  // Initialize PrismaClient

module.exports = prisma;  // Export the Prisma client to be used in other parts of the app
