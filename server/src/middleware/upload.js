// Path: E:\EduQuest\server\src\middleware\upload.js

const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ══════════════════════════════════════════════════════════════
// ENSURE UPLOAD DIRECTORIES EXIST
// ══════════════════════════════════════════════════════════════
const uploadDir = path.join(__dirname, "../../uploads");
const profilesDir = path.join(uploadDir, "profiles");
const coursesDir = path.join(uploadDir, "courses");
const lessonsDir = path.join(uploadDir, "lessons");

[uploadDir, profilesDir, coursesDir, lessonsDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// ══════════════════════════════════════════════════════════════
// FILE FILTER (only images)
// ══════════════════════════════════════════════════════════════
const imageFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPEG, PNG, and WEBP images are allowed"), false);
  }
};

// ══════════════════════════════════════════════════════════════
// STORAGE CONFIGURATION
// ══════════════════════════════════════════════════════════════

// Profile pictures storage
const profileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, profilesDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${req.user.sub}-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

// Course thumbnails storage
const courseStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, coursesDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `course-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

// Lesson content storage
const lessonStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, lessonsDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `lesson-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

// ══════════════════════════════════════════════════════════════
// MULTER INSTANCES
// ══════════════════════════════════════════════════════════════

const uploadProfilePicture = multer({
  storage: profileStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
}).single("profilePicture");

const uploadCourseThumbnail = multer({
  storage: courseStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
}).single("thumbnail");

const uploadLessonImage = multer({
  storage: lessonStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
}).single("image");

// ══════════════════════════════════════════════════════════════
// ERROR HANDLER MIDDLEWARE
// ══════════════════════════════════════════════════════════════
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "File too large",
        limit: err.field === "profilePicture" ? "2MB" : "5MB",
      });
    }
    return res.status(400).json({
      success: false,
      message: "File upload error",
      error: err.message,
    });
  }
  
  if (err) {
    return res.status(400).json({
      success: false,
      message: err.message || "Upload failed",
    });
  }
  
  next();
};

module.exports = {
  uploadProfilePicture,
  uploadCourseThumbnail,
  uploadLessonImage,
  handleUploadError,
};