// Path: E:\EduQuest\server\prisma\seed.js

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

  console.log("");
  console.log("🔧 Running badge backfill...");

  // ── FIRST_LESSON backfill ──────────────────────────────
  // Award to any student who completed at least 1 lesson
  // but doesn't have the badge yet
  const firstLessonBadge = await prisma.badge.findUnique({
    where: { code: "FIRST_LESSON" },
  });

  if (firstLessonBadge) {
    // Find all students who have at least 1 lesson completion
    const studentsWithLessons = await prisma.lessonProgress.findMany({
      distinct: ["userId"],
      select: { userId: true },
    });

    let backfillCount = 0;

    for (const { userId } of studentsWithLessons) {
      // Check if they already have the badge
      const alreadyHas = await prisma.userBadge.findUnique({
        where: {
          userId_badgeId: { userId, badgeId: firstLessonBadge.id },
        },
      });

      if (!alreadyHas) {
        await prisma.userBadge.create({
          data: { userId, badgeId: firstLessonBadge.id },
        });
        backfillCount++;
        console.log(`  🎖️  FIRST_LESSON awarded to userId: ${userId}`);
      } else {
        console.log(`  ⏭️  FIRST_LESSON already owned by userId: ${userId}`);
      }
    }

    console.log(`  ✅ FIRST_LESSON backfill done — awarded to ${backfillCount} student(s)`);
  }

  // ── COURSE_FINISHER backfill ───────────────────────────
  // Award to any student whose enrollment progress === 100
  // but doesn't have the badge yet
  const courseFinisherBadge = await prisma.badge.findUnique({
    where: { code: "COURSE_FINISHER" },
  });

  if (courseFinisherBadge) {
    const completedEnrollments = await prisma.enrollment.findMany({
      where: { progress: 100 },
      distinct: ["userId"],
      select: { userId: true },
    });

    let backfillCount = 0;

    for (const { userId } of completedEnrollments) {
      const alreadyHas = await prisma.userBadge.findUnique({
        where: {
          userId_badgeId: { userId, badgeId: courseFinisherBadge.id },
        },
      });

      if (!alreadyHas) {
        await prisma.userBadge.create({
          data: { userId, badgeId: courseFinisherBadge.id },
        });
        backfillCount++;
        console.log(`  🎖️  COURSE_FINISHER awarded to userId: ${userId}`);
      } else {
        console.log(`  ⏭️  COURSE_FINISHER already owned by userId: ${userId}`);
      }
    }

    console.log(`  ✅ COURSE_FINISHER backfill done — awarded to ${backfillCount} student(s)`);
  }

  // ── FIRST_QUIZ backfill ────────────────────────────────
  // Award to any student who has at least 1 quiz attempt
  // but doesn't have the badge yet
  const firstQuizBadge = await prisma.badge.findUnique({
    where: { code: "FIRST_QUIZ" },
  });

  if (firstQuizBadge) {
    const studentsWithAttempts = await prisma.quizAttempt.findMany({
      distinct: ["userId"],
      select: { userId: true },
    });

    let backfillCount = 0;

    for (const { userId } of studentsWithAttempts) {
      const alreadyHas = await prisma.userBadge.findUnique({
        where: {
          userId_badgeId: { userId, badgeId: firstQuizBadge.id },
        },
      });

      if (!alreadyHas) {
        await prisma.userBadge.create({
          data: { userId, badgeId: firstQuizBadge.id },
        });
        backfillCount++;
        console.log(`  🎖️  FIRST_QUIZ awarded to userId: ${userId}`);
      } else {
        console.log(`  ⏭️  FIRST_QUIZ already owned by userId: ${userId}`);
      }
    }

    console.log(`  ✅ FIRST_QUIZ backfill done — awarded to ${backfillCount} student(s)`);
  }

  console.log("");
  console.log("✅ All seeding and backfill complete.");
}

main()
  .catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());