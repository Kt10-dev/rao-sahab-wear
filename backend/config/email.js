// backend/config/email.js
const SibApiV3Sdk = require("@getbrevo/brevo");

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

apiInstance.setApiKey(
  SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey,
  process.env.EMAIL_SERVICE_PASS
);

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

    return data;
  } catch (error) {
    throw new Error("Email delivery failed via API");
  }
};

module.exports = sendEmail;
