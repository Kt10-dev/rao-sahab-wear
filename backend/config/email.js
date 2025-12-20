const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // 465 के लिए इसे true करना जरूरी है
  auth: {
    user: process.env.EMAIL_SERVICE_USER,
    pass: process.env.EMAIL_SERVICE_PASS,
  },
  // कनेक्शन को थोड़ा और समय दें
  connectionTimeout: 10000,
  socketTimeout: 10000,
});

transporter.verify((error, success) => {
  if (error) {
    console.log("❌ Email Error: ", error.message);
  } else {
    console.log("✅ Server is ready to send emails");
  }
});

module.exports = transporter;
