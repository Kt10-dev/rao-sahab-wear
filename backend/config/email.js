// backend/config/email.js
const SibApiV3Sdk = require("@getbrevo/brevo");

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

// API Key कॉन्फ़िगर करें
const apiKey = SibApiV3Sdk.ApiClient.instance.authentications["api-key"];
apiKey.apiKey = process.env.EMAIL_SERVICE_PASS; // यहाँ अपनी Brevo API Key डालना

const sendEmail = async ({ to, subject, htmlContent }) => {
  const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

  sendSmtpEmail.subject = subject;
  sendSmtpEmail.htmlContent = htmlContent;
  sendSmtpEmail.sender = {
    name: "Rao Sahab Wear",
    email: process.env.EMAIL_SERVICE_USER,
  };
  sendSmtpEmail.to = [{ email: to }];

  try {
    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log(
      "✅ API Success: Email sent via Brevo API. ID:",
      data.messageId
    );
    return data;
  } catch (error) {
    console.error(
      "❌ Brevo API Error:",
      error.response ? error.response.body : error.message
    );
    throw new Error("Email sending failed");
  }
};

module.exports = sendEmail;
