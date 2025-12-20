// backend/config/email.js

const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail", // या 'SendGrid', 'Mailgun', आदि
  auth: {
    user: process.env.EMAIL_SERVICE_USER,
    pass: process.env.EMAIL_SERVICE_PASS,
  },
});

module.exports = transporter;
