router.post("/webhook", async (req, res) => {
  const incomingMsg = req.body.Body.toLowerCase();
  const from = req.body.From;

  if (incomingMsg.includes("track order")) {
    // यहाँ डेटाबेस से आर्डर स्टेटस उठा
    const response =
      "राव साहब, आपका कुर्ता अभी 'Sanganer' में है और कल शाम तक आपके पास पहुँच जाएगा! 🚚";

    // Twilio को रिस्पॉन्स भेज
    const twiml = new twilio.twiml.MessagingResponse();
    twiml.message(response);
    res.type("text/xml").send(twiml.toString());
  }
});
