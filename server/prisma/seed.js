const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Seed badges
  await prisma.badge.createMany({
    data: [
      {
        code: "FIRST_QUIZ",
        name: "First Quiz Completed",
        description: "Awarded for completing the first quiz.",
        pointsBonus: 10,
      },
      {
        code: "COURSE_COMPLETION",
        name: "Course Completion",
        description: "Awarded for completing a course.",
        pointsBonus: 50,
      },
    ],
  });

  console.log('Seeded badges');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
