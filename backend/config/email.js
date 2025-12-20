// backend/config/email.js

const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // 587 के लिए इसे false ही रखना है
  auth: {
    user: process.env.EMAIL_SERVICE_USER,
    pass: process.env.EMAIL_SERVICE_PASS,
  },
  tls: {
    // यह लाइन क्लाउड सर्वर पर 'Connection Timeout' एरर को रोकने में मदद करती है
    rejectUnauthorized: false,
  },
});

// कनेक्शन चेक करने के लिए (लॉग्स में दिखेगा कि ईमेल तैयार है या नहीं)
transporter.verify((error, success) => {
  if (error) {
    console.log("Email Transporter Error: ", error);
  } else {
    console.log("Server is ready to send emails ✅");
  }
});

module.exports = transporter;
