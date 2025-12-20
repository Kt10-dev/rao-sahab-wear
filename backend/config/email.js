// backend/config/email.js
const SibApiV3Sdk = require("@getbrevo/brevo");

// API Instance बनाना
const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

// 🟢 NEW WAY: API Key सेट करने का सही तरीका
apiInstance.setApiKey(
  SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey,
  process.env.EMAIL_SERVICE_PASS // रेंडर में आपकी Brevo API Key
);

const sendEmail = async ({ to, subject, htmlContent }) => {
  const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

  sendSmtpEmail.subject = subject;
  sendSmtpEmail.htmlContent = htmlContent;
  sendSmtpEmail.sender = {
    name: "Rao Sahab Wear",
    email: process.env.EMAIL_SERVICE_USER, // आपकी Brevo वाली ईमेल
  };
  sendSmtpEmail.to = [{ email: to }];

  try {
    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log("✅ API Success: OTP Sent via Brevo!");
    return data;
  } catch (error) {
    console.error("❌ Brevo API Error:", error.message);
    throw new Error("Email delivery failed via API");
  }
};

module.exports = sendEmail;
