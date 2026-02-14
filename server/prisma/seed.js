// Path: E:\EduQuest\server\prisma\seed.js
// CHANGE: added PERFECT_SCORE badge to the array

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding badges...");

  const badges = [
    {
      code: "FIRST_LESSON",
      name: "First Step",
      description: "Completed your very first lesson.",
      pointsBonus: 20,
    },
    {
      code: "COURSE_FINISHER",
      name: "Course Finisher",
      description: "Completed all lessons in a course.",
      pointsBonus: 50,
    },
    {
      code: "FIRST_QUIZ",
      name: "Quiz Starter",
      description: "Completed your very first quiz attempt.",
      pointsBonus: 0,
    },
    {
      // NEW: was missing from DB entirely
      code: "PERFECT_SCORE",
      name: "Perfect Score",
      description: "Scored 100% on a quiz.",
      pointsBonus: 25,
    },
  ];

  for (const badge of badges) {
    const result = await prisma.badge.upsert({
      where: { code: badge.code },
      update: {
        name: badge.name,
        description: badge.description,
        pointsBonus: badge.pointsBonus,
      },
      create: badge,
    });
    console.log(`  ✅ Badge ready: ${result.code} — "${result.name}"`);
  }

  console.log("✅ Seeding complete.");
}

main()
  .catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());