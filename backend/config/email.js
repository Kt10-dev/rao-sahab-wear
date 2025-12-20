// backend/config/email.js
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false, // Brevo के लिए 587 + false सबसे बेस्ट है
  auth: {
    user: process.env.EMAIL_SERVICE_USER,
    pass: process.env.EMAIL_SERVICE_PASS,
  },
});

// Verification check
transporter.verify((error) => {
  if (error) {
    console.log("❌ Brevo Connection Error:", error.message);
  } else {
    console.log("✅ SYSTEM READY: Emails are flying via Brevo, Rao Sahab!");
  }
});

module.exports = transporter;
