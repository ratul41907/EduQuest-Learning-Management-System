// Path: E:\EduQuest\server\src\routes\certificate.routes.js

const router = require("express").Router();
const prisma = require("../prisma");
const { requireAuth } = require("../middleware/auth");
const PDFDocument = require("pdfkit");

// =========================================
// GET /api/certificates/my
// Student: list my earned certificates
// IMPORTANT: must stay above /:courseId routes
// =========================================
router.get("/my", requireAuth, async (req, res) => {
  try {
    const userId = req.user.sub;

    const certs = await prisma.certificate.findMany({
      where: { userId },
      include: {
        course: { select: { id: true, title: true } },
      },
      orderBy: { issuedAt: "desc" },
    });

    res.json({ count: certs.length, certificates: certs });
  } catch (err) {
    res.status(500).json({
      message: "Failed to load certificates",
      error: err.message,
    });
  }
});

// =========================================
// GET /api/certificates/verify/:code
// Public: verify a certificate by code
// IMPORTANT: must stay above /:courseId routes
// =========================================
router.get("/verify/:code", async (req, res) => {
  try {
    const { code } = req.params;

    const cert = await prisma.certificate.findUnique({
      where: { code },
      include: {
        user: { select: { fullName: true } },
        course: { select: { title: true } },
      },
    });

    if (!cert) {
      return res.status(404).json({
        valid: false,
        message: "Invalid certificate code",
      });
    }

    res.json({
      valid: true,
      code: cert.code,
      issuedAt: cert.issuedAt,
      student: cert.user.fullName,
      course: cert.course.title,
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to verify certificate",
      error: err.message,
    });
  }
});

// =========================================
// GET /api/certificates/:courseId/pdf
// Student: download certificate as PDF
// Must have completed the course first
// =========================================
router.get("/:courseId/pdf", requireAuth, async (req, res) => {
  try {
    const userId = req.user.sub;
    const { courseId } = req.params;

    const cert = await prisma.certificate.findUnique({
      where: { userId_courseId: { userId, courseId } },
      include: {
        user: { select: { fullName: true } },
        course: { select: { title: true } },
      },
    });

    if (!cert) {
      return res.status(404).json({
        message: "Certificate not found. Finish the course first.",
      });
    }

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename="certificate-${cert.code}.pdf"`
    );

    const doc = new PDFDocument({ size: "A4", margin: 60 });
    doc.pipe(res);

    // Header
    doc
      .fontSize(28)
      .fillColor("#1A56DB")
      .text("EduQuest", { align: "center" });

    doc
      .fontSize(20)
      .fillColor("#1E2A3A")
      .text("Certificate of Completion", { align: "center" });

    doc.moveDown(1.5);

    // Body
    doc
      .fontSize(14)
      .fillColor("#374151")
      .text("This certifies that", { align: "center" });

    doc.moveDown(0.5);

    doc
      .fontSize(26)
      .fillColor("#111827")
      .text(cert.user.fullName, { align: "center" });

    doc.moveDown(0.5);

    doc
      .fontSize(14)
      .fillColor("#374151")
      .text("has successfully completed the course", { align: "center" });

    doc.moveDown(0.5);

    doc
      .fontSize(20)
      .fillColor("#1A56DB")
      .text(cert.course.title, { align: "center" });

    doc.moveDown(2);

    // Footer
    doc
      .fontSize(11)
      .fillColor("#6B7280")
      .text(`Certificate ID: ${cert.code}`, { align: "center" });

    doc
      .fontSize(11)
      .fillColor("#6B7280")
      .text(
        `Issued: ${new Date(cert.issuedAt).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}`,
        { align: "center" }
      );

    doc.moveDown(1);

    doc
      .fontSize(10)
      .fillColor("#9CA3AF")
      .text("Verify this certificate at:", { align: "center" });

    doc
      .fontSize(10)
      .fillColor("#9CA3AF")
      .text(`GET /api/certificates/verify/${cert.code}`, { align: "center" });

    doc.end();
  } catch (err) {
    res.status(500).json({
      message: "Failed to generate certificate",
      error: err.message,
    });
  }
});

module.exports = router;