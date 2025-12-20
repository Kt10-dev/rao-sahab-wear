// backend/config/email.js
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465, // SSL पोर्ट यूज़ करेंगे (Render पर यह 587 से ज्यादा स्टेबल है)
  secure: true,
  service: "gmail", // यह Nodemailer को Gmail की स्पेसिफिक सेटिंग्स लोड करने में मदद करता है
  auth: {
    user: process.env.EMAIL_SERVICE_USER,
    pass: process.env.EMAIL_SERVICE_PASS,
  },
  // 🟢 महत्वपूर्ण सेटिंग्स: Timeout और रिबूट लॉजिक
  connectionTimeout: 20000, // 20 सेकंड तक वेट करो (Render स्लो हो सकता है)
  greetingTimeout: 20000,
  socketTimeout: 30000,
  pool: true, // कनेक्शन को खुला रखो (बार-बार नया कनेक्शन बनाने में टाइमआउट नहीं होगा)
  maxConnections: 1, // एक बार में एक ही काम करो ताकि स्पैम न लगे
  tls: {
    rejectUnauthorized: false, // सर्वर सर्टिफिकेट एरर को बायपास करने के लिए
  },
});

// इसे चेक करने का असली तरीका
transporter.verify((error, success) => {
  if (error) {
    console.log("❌ Rao Sahab, Error abhi bhi hai: ", error.message);
  } else {
    console.log("✅ SYSTEM READY: Nodemailer is connected to Gmail!");
  }
});

module.exports = transporter;
