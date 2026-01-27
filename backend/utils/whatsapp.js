const twilio = require("twilio");

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = new twilio(accountSid, authToken);

const sendWhatsAppMessage = async (to, body) => {
  try {
    await client.messages.create({
      from: "whatsapp:+12173874611", // Twilio Sandbox Number
      to: `whatsapp:${to}`,
      body: body,
    });
    console.log("WhatsApp Sent!");
  } catch (error) {
    console.error("WhatsApp Error:", error);
  }
};

module.exports = sendWhatsAppMessage;
