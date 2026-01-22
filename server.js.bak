// In-memory sessions
const userSessions = {};
const greetings = ["hi", "hello", "hey", "hii", "hai"];

// POST /chat
app.post("/chat", async (req, res) => {
  try {
    const { message, sessionId } = req.body;
    const userId = sessionId || req.ip;

    if (!message) return res.json({ reply: "Please type a message." });

    if (!userSessions[userId]) {
      userSessions[userId] = { step: 0, lead: {} };
    }

    const session = userSessions[userId];
    const text = message.trim();

    // ? STEP 0: Greeting -> Ask Name
    if (session.step === 0) {
      if (greetings.includes(text.toLowerCase())) {
        return res.json({ reply: "May I know your name?" });
      }

      session.lead.name = text;
      session.step = 1;
      return res.json({ reply: "Thanks! Please share your email (or type skip)." });
    }

    // ? STEP 1: Email
    if (session.step === 1) {
      if (text.toLowerCase() !== "skip") session.lead.email = text;
      session.step = 2;
      return res.json({ reply: "Please share your phone number (or type skip)." });
    }

    // ? STEP 2: Phone
    if (session.step === 2) {
      if (text.toLowerCase() !== "skip") session.lead.phone = text;
      session.step = 3;
      return res.json({ reply: "Now tell me your requirement (example: I need website / admin panel)." });
    }

    // ? STEP 3: Requirement -> Save Lead
    if (session.step === 3) {
      session.lead.message = text;
      session.step = 4;

      // ? Save in MongoDB (leadflc collection)
      await Lead.create({
        name: session.lead.name || "",
        email: session.lead.email || "",
        phone: session.lead.phone || "",
        message: session.lead.message || "",
        source: "Subrat Freelancer Chatbot"
      });

      return res.json({
        reply:
          "Thank you! Your details are saved.\nNow you can type: services / pricing / contact"
      });
    }

    // ? STEP 4: Rule-based chatbot
    const msgLower = text.toLowerCase();

    if (msgLower.includes("service")) {
      return res.json({
        reply:
          "My Services:\n1) Website Development\n2) Admin Panels\n3) APIs / Backend\n4) Chatbots (Rule-based + AI)"
      });
    }

    if (msgLower.includes("price") || msgLower.includes("pricing") || msgLower.includes("cost")) {
      return res.json({
        reply:
          "Pricing (Approx):\n• Basic Website: INR 5k - 15k\n• Admin Panel: INR 20k+\n• Chatbot: INR 10k+"
      });
    }

    if (msgLower.includes("contact") || msgLower.includes("email") || msgLower.includes("whatsapp")) {
      return res.json({
        reply:
          "Contact:\nEmail: yourmail@gmail.com\nWhatsApp: +91 XXXXX XXXXX"
      });
    }

    return res.json({ reply: 'Try: "services", "pricing", "contact"' });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ reply: "Server error. Please try again." });
  }
});
