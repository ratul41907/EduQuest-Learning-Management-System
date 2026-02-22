// Path: E:\EduQuest\server\src\utils\email.js

const nodemailer = require("nodemailer");

// ══════════════════════════════════════════════════════════════
// EMAIL TRANSPORTER CONFIGURATION
// ══════════════════════════════════════════════════════════════

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: process.env.EMAIL_PORT || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// ══════════════════════════════════════════════════════════════
// EMAIL TEMPLATES
// ══════════════════════════════════════════════════════════════

const emailTemplates = {
  welcome: (fullName) => ({
    subject: "Welcome to EduQuest! 🎓",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1E3A5F;">Welcome to EduQuest, ${fullName}!</h1>
        <p>Thank you for joining our learning platform. We're excited to have you on board!</p>
        <p>Start your learning journey by:</p>
        <ul>
          <li>Browsing our course catalog</li>
          <li>Enrolling in your first course</li>
          <li>Earning badges and certificates</li>
        </ul>
        <p style="margin-top: 30px;">
          <a href="${process.env.FRONTEND_URL || "http://localhost:3000"}" 
             style="background-color: #1E3A5F; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
            Explore Courses
          </a>
        </p>
        <p style="color: #666; margin-top: 40px; font-size: 12px;">
          If you didn't create an account, please ignore this email.
        </p>
      </div>
    `,
  }),

  enrollment: (fullName, courseTitle) => ({
    subject: `You're enrolled in ${courseTitle}! 📚`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1E3A5F;">Enrollment Confirmed!</h1>
        <p>Hi ${fullName},</p>
        <p>You've successfully enrolled in <strong>${courseTitle}</strong>.</p>
        <p>Here's what to do next:</p>
        <ol>
          <li>Start with the first lesson</li>
          <li>Complete quizzes to earn points</li>
          <li>Track your progress on the dashboard</li>
        </ol>
        <p style="margin-top: 30px;">
          <a href="${process.env.FRONTEND_URL || "http://localhost:3000"}/courses" 
             style="background-color: #2E6DA4; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
            Start Learning
          </a>
        </p>
      </div>
    `,
  }),

  badgeEarned: (fullName, badgeName, badgeDescription) => ({
    subject: `🏆 You earned the "${badgeName}" badge!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1E3A5F;">Congratulations! 🎉</h1>
        <p>Hi ${fullName},</p>
        <p>You've earned a new badge: <strong>${badgeName}</strong></p>
        <div style="background-color: #E8F4FD; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="color: #2E6DA4; margin-top: 0;">🏅 ${badgeName}</h2>
          <p style="margin-bottom: 0;">${badgeDescription}</p>
        </div>
        <p>Keep up the great work and collect all badges!</p>
        <p style="margin-top: 30px;">
          <a href="${process.env.FRONTEND_URL || "http://localhost:3000"}/dashboard" 
             style="background-color: #1A7A1A; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
            View My Badges
          </a>
        </p>
      </div>
    `,
  }),

  certificate: (fullName, courseTitle, certificateCode) => ({
    subject: `🎓 Certificate Earned: ${courseTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1E3A5F;">Congratulations on Completing the Course! 🎓</h1>
        <p>Hi ${fullName},</p>
        <p>You've successfully completed <strong>${courseTitle}</strong>!</p>
        <div style="background-color: #FFF3CD; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #FFD700;">
          <h3 style="margin-top: 0;">📜 Certificate Details</h3>
          <p><strong>Course:</strong> ${courseTitle}</p>
          <p><strong>Certificate Code:</strong> ${certificateCode}</p>
        </div>
        <p>Download your certificate and share it on LinkedIn!</p>
        <p style="margin-top: 30px;">
          <a href="${process.env.FRONTEND_URL || "http://localhost:3000"}/certificates" 
             style="background-color: #1E3A5F; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin-right: 10px;">
            Download Certificate
          </a>
          <a href="${process.env.FRONTEND_URL || "http://localhost:3000"}/api/certificates/verify/${certificateCode}" 
             style="background-color: #2E6DA4; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
            Verify Certificate
          </a>
        </p>
      </div>
    `,
  }),

  passwordReset: (fullName, resetToken) => ({
    subject: "Reset Your EduQuest Password 🔒",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1E3A5F;">Password Reset Request</h1>
        <p>Hi ${fullName},</p>
        <p>We received a request to reset your password. Click the button below to create a new password:</p>
        <p style="margin-top: 30px;">
          <a href="${process.env.FRONTEND_URL || "http://localhost:3000"}/reset-password?token=${resetToken}" 
             style="background-color: #D32F2F; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
            Reset Password
          </a>
        </p>
        <p style="color: #666; margin-top: 30px;">
          This link will expire in 1 hour for security reasons.
        </p>
        <p style="color: #D32F2F; font-weight: bold;">
          If you didn't request this, please ignore this email and your password will remain unchanged.
        </p>
      </div>
    `,
  }),

  instructorNewEnrollment: (instructorName, studentName, courseTitle) => ({
    subject: `New student enrolled in ${courseTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1E3A5F;">New Enrollment! 🎉</h1>
        <p>Hi ${instructorName},</p>
        <p><strong>${studentName}</strong> just enrolled in your course: <strong>${courseTitle}</strong></p>
        <p>Your course is growing! Keep creating great content.</p>
        <p style="margin-top: 30px;">
          <a href="${process.env.FRONTEND_URL || "http://localhost:3000"}/instructor/dashboard" 
             style="background-color: #2E6DA4; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
            View Dashboard
          </a>
        </p>
      </div>
    `,
  }),
};

// ══════════════════════════════════════════════════════════════
// EMAIL SENDING FUNCTIONS
// ══════════════════════════════════════════════════════════════

const sendEmail = async (to, template) => {
  try {
    // Skip sending in test/development if EMAIL_USER not configured
    if (!process.env.EMAIL_USER) {
      console.log(`📧 [EMAIL SKIPPED - No EMAIL_USER configured]`);
      console.log(`   To: ${to}`);
      console.log(`   Subject: ${template.subject}`);
      return { skipped: true };
    }

    const info = await transporter.sendMail({
      from: `"EduQuest" <${process.env.EMAIL_USER}>`,
      to,
      subject: template.subject,
      html: template.html,
    });

    console.log(`✅ Email sent to ${to}: ${template.subject}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ Email error (${to}):`, error.message);
    return { success: false, error: error.message };
  }
};

// ══════════════════════════════════════════════════════════════
// EXPORTED EMAIL FUNCTIONS
// ══════════════════════════════════════════════════════════════

const sendWelcomeEmail = async (email, fullName) => {
  return sendEmail(email, emailTemplates.welcome(fullName));
};

const sendEnrollmentEmail = async (email, fullName, courseTitle) => {
  return sendEmail(email, emailTemplates.enrollment(fullName, courseTitle));
};

const sendBadgeEmail = async (email, fullName, badgeName, badgeDescription) => {
  return sendEmail(email, emailTemplates.badgeEarned(fullName, badgeName, badgeDescription));
};

const sendCertificateEmail = async (email, fullName, courseTitle, certificateCode) => {
  return sendEmail(email, emailTemplates.certificate(fullName, courseTitle, certificateCode));
};

const sendPasswordResetEmail = async (email, fullName, resetToken) => {
  return sendEmail(email, emailTemplates.passwordReset(fullName, resetToken));
};

const sendInstructorEnrollmentEmail = async (email, instructorName, studentName, courseTitle) => {
  return sendEmail(email, emailTemplates.instructorNewEnrollment(instructorName, studentName, courseTitle));
};

module.exports = {
  sendWelcomeEmail,
  sendEnrollmentEmail,
  sendBadgeEmail,
  sendCertificateEmail,
  sendPasswordResetEmail,
  sendInstructorEnrollmentEmail,
};