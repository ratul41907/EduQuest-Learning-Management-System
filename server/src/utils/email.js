// Path: E:\EduQuest\server\src\utils\email.js

const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Core send — never crashes the app
 */
async function sendEmail({ to, subject, html }) {
  try {
    await transporter.sendMail({
      from: `"EduQuest" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`[Email] Sent: "${subject}" → ${to}`);
  } catch (err) {
    console.error(`[Email] Failed to send to ${to}:`, err.message);
  }
}

// ─────────────────────────────────────────────────────────
// Welcome email — sent on register
// ─────────────────────────────────────────────────────────
async function sendWelcomeEmail({ fullName, email }) {
  await sendEmail({
    to: email,
    subject: "Welcome to EduQuest! 🎓",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:32px">
        <h1 style="color:#1A56DB;margin-bottom:8px">Welcome, ${fullName}!</h1>
        <p style="color:#374151;font-size:16px;line-height:1.6">
          Your EduQuest account is ready. Start exploring courses, earn badges, and level up your skills.
        </p>
        <div style="margin:32px 0">
          <a href="http://localhost:5000/api/courses"
             style="background:#1A56DB;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:15px">
            Browse Courses →
          </a>
        </div>
        <p style="color:#9CA3AF;font-size:13px">EduQuest — Learn. Grow. Achieve.</p>
      </div>
    `,
  });
}

// ─────────────────────────────────────────────────────────
// Enrollment confirmation — sent on enroll
// ─────────────────────────────────────────────────────────
async function sendEnrollmentEmail({ fullName, email, courseTitle }) {
  await sendEmail({
    to: email,
    subject: `You're enrolled in "${courseTitle}" 📚`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:32px">
        <h1 style="color:#1A56DB">Enrollment Confirmed!</h1>
        <p style="color:#374151;font-size:16px;line-height:1.6">
          Hi <strong>${fullName}</strong>, you're now enrolled in:
        </p>
        <div style="background:#F3F4F6;border-left:4px solid #1A56DB;padding:16px 20px;margin:24px 0;border-radius:4px">
          <p style="margin:0;font-size:18px;font-weight:bold;color:#111827">${courseTitle}</p>
        </div>
        <p style="color:#374151;font-size:15px">Head over and start your first lesson. Good luck! 🚀</p>
        <p style="color:#9CA3AF;font-size:13px;margin-top:32px">EduQuest — Learn. Grow. Achieve.</p>
      </div>
    `,
  });
}

// ─────────────────────────────────────────────────────────
// Certificate email — sent on course completion
// ─────────────────────────────────────────────────────────
async function sendCertificateEmail({ fullName, email, courseTitle, certCode }) {
  await sendEmail({
    to: email,
    subject: `You completed "${courseTitle}" — Certificate Ready! 🏆`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:32px">
        <h1 style="color:#1A56DB">Congratulations, ${fullName}! 🎉</h1>
        <p style="color:#374151;font-size:16px;line-height:1.6">
          You've successfully completed <strong>${courseTitle}</strong>. Your certificate has been issued!
        </p>
        <div style="background:#F0FDF4;border:1px solid #86EFAC;padding:20px;border-radius:8px;margin:24px 0">
          <p style="margin:0 0 8px 0;color:#166534;font-size:13px;font-weight:bold">CERTIFICATE CODE</p>
          <p style="margin:0;font-size:20px;font-weight:bold;color:#111827;letter-spacing:2px">${certCode}</p>
        </div>
        <p style="color:#374151;font-size:15px">
          Verify your certificate at:<br/>
          <code style="background:#F3F4F6;padding:4px 8px;border-radius:4px;font-size:13px">
            GET /api/certificates/verify/${certCode}
          </code>
        </p>
        <p style="color:#9CA3AF;font-size:13px;margin-top:32px">EduQuest — Learn. Grow. Achieve.</p>
      </div>
    `,
  });
}

// ─────────────────────────────────────────────────────────
// Badge email — sent when any badge is earned
// ─────────────────────────────────────────────────────────
async function sendBadgeEmail({ fullName, email, badgeName, pointsBonus }) {
  await sendEmail({
    to: email,
    subject: `Badge Earned: ${badgeName} 🎖️`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:32px">
        <h1 style="color:#1A56DB">New Badge Unlocked!</h1>
        <p style="color:#374151;font-size:16px;line-height:1.6">
          Great work, <strong>${fullName}</strong>! You just earned:
        </p>
        <div style="background:#FFF7ED;border:1px solid #FED7AA;padding:20px;border-radius:8px;margin:24px 0;text-align:center">
          <p style="margin:0 0 8px 0;font-size:32px">🎖️</p>
          <p style="margin:0;font-size:22px;font-weight:bold;color:#111827">${badgeName}</p>
          ${pointsBonus > 0
            ? `<p style="margin:8px 0 0 0;color:#92400E;font-size:14px">+${pointsBonus} bonus points awarded!</p>`
            : ""}
        </div>
        <p style="color:#374151;font-size:15px">Keep learning to unlock more badges. You're on a roll! 🚀</p>
        <p style="color:#9CA3AF;font-size:13px;margin-top:32px">EduQuest — Learn. Grow. Achieve.</p>
      </div>
    `,
  });
}

// ─────────────────────────────────────────────────────────
// Password reset email — used in Day 12
// ─────────────────────────────────────────────────────────
async function sendPasswordResetEmail({ email, token }) {
  await sendEmail({
    to: email,
    subject: "EduQuest — Reset Your Password 🔑",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:32px">
        <h1 style="color:#1A56DB">Password Reset Request</h1>
        <p style="color:#374151;font-size:16px;line-height:1.6">
          We received a request to reset your password. Use the token below:
        </p>
        <div style="background:#F3F4F6;padding:20px;border-radius:8px;margin:24px 0;text-align:center">
          <p style="margin:0 0 8px 0;color:#6B7280;font-size:13px;font-weight:bold">RESET TOKEN</p>
          <p style="margin:0;font-size:14px;font-weight:bold;color:#111827;word-break:break-all;letter-spacing:1px">${token}</p>
        </div>
        <p style="color:#374151;font-size:15px">
          Send a POST request to <code style="background:#F3F4F6;padding:2px 6px;border-radius:4px">/api/auth/reset-password</code>
          with this token and your new password.
        </p>
        <p style="color:#EF4444;font-size:14px">⚠️ This token expires in <strong>1 hour</strong>.</p>
        <p style="color:#9CA3AF;font-size:13px">If you didn't request this, ignore this email. Your password won't change.</p>
        <p style="color:#9CA3AF;font-size:13px;margin-top:32px">EduQuest — Learn. Grow. Achieve.</p>
      </div>
    `,
  });
}

module.exports = {
  sendWelcomeEmail,
  sendEnrollmentEmail,
  sendCertificateEmail,
  sendBadgeEmail,
  sendPasswordResetEmail,
};