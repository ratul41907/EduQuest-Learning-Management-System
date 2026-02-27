// Path: E:\EduQuest\server\src\services\search.service.js

const prisma = require("../prisma");
const Fuse = require("fuse.js");
const logger = require("../config/logger");

// ══════════════════════════════════════════════════════════════
// SEARCH COURSES
// ══════════════════════════════════════════════════════════════
async function searchCourses(query, filters = {}) {
  try {
    const { 
      level, 
      minPrice, 
      maxPrice, 
      instructorId,
      minRating,
      hasQuizzes,
      hasLessons,
      sortBy = "relevance",
      page = 1,
      limit = 20
    } = filters;

    const where = {};

    // Text search
    if (query && query.trim()) {
      where.OR = [
        { title: { contains: query.trim(), mode: "insensitive" } },
        { description: { contains: query.trim(), mode: "insensitive" } },
      ];
    }

    // Filters
    if (level !== undefined) where.level = parseInt(level);
    if (instructorId) where.instructorId = instructorId;
    
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = Number(minPrice);
      if (maxPrice !== undefined) where.price.lte = Number(maxPrice);
    }

    // Pagination
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, parseInt(limit));
    const skip = (pageNum - 1) * limitNum;

    // Get courses with related data
    const [total, courses] = await Promise.all([
      prisma.course.count({ where }),
      prisma.course.findMany({
        where,
        skip,
        take: limitNum,
        include: {
          instructor: {
            select: { id: true, fullName: true, email: true }
          },
          _count: {
            select: { 
              lessons: true, 
              quizzes: true, 
              enrollments: true,
              reviews: true
            }
          },
          reviews: {
            select: { rating: true }
          }
        },
        orderBy: getSortOrder(sortBy),
      }),
    ]);

    // Calculate average ratings and apply post-filters
    let results = courses.map(course => {
      const avgRating = course.reviews.length > 0
        ? course.reviews.reduce((sum, r) => sum + r.rating, 0) / course.reviews.length
        : 0;

      return {
        id: course.id,
        title: course.title,
        description: course.description,
        price: course.price,
        level: course.level,
        thumbnail: course.thumbnail,
        createdAt: course.createdAt,
        instructor: course.instructor,
        lessonCount: course._count.lessons,
        quizCount: course._count.quizzes,
        enrollmentCount: course._count.enrollments,
        reviewCount: course._count.reviews,
        avgRating: Math.round(avgRating * 10) / 10,
      };
    });

    // Post-filters (after database query)
    if (minRating !== undefined) {
      results = results.filter(c => c.avgRating >= Number(minRating));
    }
    if (hasQuizzes === "true") {
      results = results.filter(c => c.quizCount > 0);
    }
    if (hasLessons === "true") {
      results = results.filter(c => c.lessonCount > 0);
    }

    return {
      total: results.length,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(results.length / limitNum),
      results: results.slice(0, limitNum),
      facets: await getCourseFacets(query),
    };
  } catch (err) {
    logger.error("Search courses error", { error: err.message });
    throw err;
  }
}

// ══════════════════════════════════════════════════════════════
// SEARCH LESSONS
// ══════════════════════════════════════════════════════════════
async function searchLessons(query, filters = {}) {
  try {
    const { courseId, minPoints, page = 1, limit = 20 } = filters;

    const where = {};

    if (query && query.trim()) {
      where.OR = [
        { title: { contains: query.trim(), mode: "insensitive" } },
        { content: { contains: query.trim(), mode: "insensitive" } },
      ];
    }

    if (courseId) where.courseId = courseId;
    if (minPoints !== undefined) where.points = { gte: Number(minPoints) };

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, parseInt(limit));
    const skip = (pageNum - 1) * limitNum;

    const [total, lessons] = await Promise.all([
      prisma.lesson.count({ where }),
      prisma.lesson.findMany({
        where,
        skip,
        take: limitNum,
        include: {
          course: {
            select: { 
              id: true, 
              title: true,
              instructor: { select: { fullName: true } }
            }
          }
        },
        orderBy: { orderNo: "asc" },
      }),
    ]);

    return {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
      results: lessons,
    };
  } catch (err) {
    logger.error("Search lessons error", { error: err.message });
    throw err;
  }
}

// ══════════════════════════════════════════════════════════════
// SEARCH USERS
// ══════════════════════════════════════════════════════════════
async function searchUsers(query, filters = {}) {
  try {
    const { role, minPoints, minLevel, page = 1, limit = 20 } = filters;

    const where = {};

    if (query && query.trim()) {
      where.OR = [
        { fullName: { contains: query.trim(), mode: "insensitive" } },
        { email: { contains: query.trim(), mode: "insensitive" } },
      ];
    }

    if (role) where.role = role;
    if (minPoints !== undefined) where.totalPoints = { gte: Number(minPoints) };
    if (minLevel !== undefined) where.level = { gte: Number(minLevel) };

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, parseInt(limit));
    const skip = (pageNum - 1) * limitNum;

    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        skip,
        take: limitNum,
        select: {
          id: true,
          fullName: true,
          email: true,
          role: true,
          totalPoints: true,
          level: true,
          profilePicture: true,
          createdAt: true,
        },
        orderBy: { totalPoints: "desc" },
      }),
    ]);

    return {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
      results: users,
    };
  } catch (err) {
    logger.error("Search users error", { error: err.message });
    throw err;
  }
}

// ══════════════════════════════════════════════════════════════
// GLOBAL SEARCH (All types)
// ══════════════════════════════════════════════════════════════
async function globalSearch(query, options = {}) {
  try {
    const { types = ["courses", "lessons", "users"], limit = 5 } = options;

    const results = {};

    if (types.includes("courses")) {
      const coursesResult = await searchCourses(query, { limit });
      results.courses = coursesResult.results;
    }

    if (types.includes("lessons")) {
      const lessonsResult = await searchLessons(query, { limit });
      results.lessons = lessonsResult.results;
    }

    if (types.includes("users")) {
      const usersResult = await searchUsers(query, { limit });
      results.users = usersResult.results;
    }

    return {
      query,
      results,
      totalResults: 
        (results.courses?.length || 0) +
        (results.lessons?.length || 0) +
        (results.users?.length || 0),
    };
  } catch (err) {
    logger.error("Global search error", { error: err.message });
    throw err;
  }
}

// ══════════════════════════════════════════════════════════════
// SEARCH SUGGESTIONS (Auto-complete)
// ══════════════════════════════════════════════════════════════
async function getSearchSuggestions(query, limit = 10) {
  try {
    if (!query || query.length < 2) return [];

    const courses = await prisma.course.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
        ],
      },
      select: { id: true, title: true },
      take: limit,
    });

    return courses.map(c => ({
      type: "course",
      id: c.id,
      text: c.title,
    }));
  } catch (err) {
    logger.error("Search suggestions error", { error: err.message });
    return [];
  }
}

// ══════════════════════════════════════════════════════════════
// GET FACETS (Filter counts)
// ══════════════════════════════════════════════════════════════
async function getCourseFacets(query = "") {
  try {
    const where = query
      ? {
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
          ],
        }
      : {};

    const [levels, priceRanges] = await Promise.all([
      // Count by level
      prisma.course.groupBy({
        by: ["level"],
        where,
        _count: true,
      }),
      // Get min/max price
      prisma.course.aggregate({
        where,
        _min: { price: true },
        _max: { price: true },
      }),
    ]);

    return {
      levels: levels.map(l => ({ level: l.level, count: l._count })),
      priceRange: {
        min: priceRanges._min.price || 0,
        max: priceRanges._max.price || 0,
      },
    };
  } catch (err) {
    logger.error("Get facets error", { error: err.message });
    return { levels: [], priceRange: { min: 0, max: 0 } };
  }
}

// ══════════════════════════════════════════════════════════════
// FUZZY SEARCH (Typo-tolerant)
// ══════════════════════════════════════════════════════════════
async function fuzzySearch(query, type = "courses", options = {}) {
  try {
    let data;
    let keys;

    if (type === "courses") {
      data = await prisma.course.findMany({
        include: {
          instructor: { select: { fullName: true } },
        },
      });
      keys = ["title", "description", "instructor.fullName"];
    } else if (type === "lessons") {
      data = await prisma.lesson.findMany();
      keys = ["title", "content"];
    } else if (type === "users") {
      data = await prisma.user.findMany({
        select: {
          id: true,
          fullName: true,
          email: true,
          role: true,
          totalPoints: true,
          level: true,
        },
      });
      keys = ["fullName", "email"];
    }

    const fuse = new Fuse(data, {
      keys,
      threshold: 0.4, // 0 = perfect match, 1 = match anything
      includeScore: true,
    });

    const results = fuse.search(query);
    return results.slice(0, options.limit || 20).map(r => ({
      ...r.item,
      score: r.score,
    }));
  } catch (err) {
    logger.error("Fuzzy search error", { error: err.message });
    return [];
  }
}

// ══════════════════════════════════════════════════════════════
// POPULAR SEARCHES (Track & Return)
// ══════════════════════════════════════════════════════════════
const searchCache = new Map();

function trackSearch(query) {
  if (!query || query.length < 2) return;
  const normalized = query.toLowerCase().trim();
  const count = searchCache.get(normalized) || 0;
  searchCache.set(normalized, count + 1);
  
  logger.info("Search tracked", { query: normalized, count: count + 1 });
}

function getPopularSearches(limit = 10) {
  const sorted = Array.from(searchCache.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit);
  
  return sorted.map(([query, count]) => ({ query, count }));
}

// ══════════════════════════════════════════════════════════════
// HELPER: Get sort order
// ══════════════════════════════════════════════════════════════
function getSortOrder(sortBy) {
  switch (sortBy) {
    case "newest":
      return { createdAt: "desc" };
    case "oldest":
      return { createdAt: "asc" };
    case "price-low":
      return { price: "asc" };
    case "price-high":
      return { price: "desc" };
    case "title":
      return { title: "asc" };
    default:
      return { createdAt: "desc" }; // relevance/default
  }
}

module.exports = {
  searchCourses,
  searchLessons,
  searchUsers,
  globalSearch,
  getSearchSuggestions,
  getCourseFacets,
  fuzzySearch,
  trackSearch,
  getPopularSearches,
};