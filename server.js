const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const path = require("path");

dotenv.config();

const Lead = require("./models/Lead");

const app = express();

// ? CORS (allow all)
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "x-admin-key"],
  })
);

app.use(express.json());

// ? Serve widget.js + chat-widget.html + admin.html
app.use(express.static(path.join(__dirname, "public")));

// ? MongoDB connect
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("? MongoDB Connected"))
  .catch((err) => console.log("? MongoDB Error:", err.message));

// ? Home
app.get("/", (req, res) => {
  res.send("? Subrat Freelancer Chatbot Running");
});

/* ==================================================
   ? In-memory sessions for Lead flow
================================================== */
const userSessions = {};
const greetings = ["hi", "hello", "hey", "hii", "hai"];

/* ==================================================
   ? CHAT API  (Lead First + Rule Based)
================================================== */
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
      return res.json({
        reply: "Thanks! Please share your email (or type skip).",
      });
    }

    // ? STEP 1: Email
    if (session.step === 1) {
      if (text.toLowerCase() !== "skip") session.lead.email = text;
      session.step = 2;
      return res.json({
        reply: "Please share your phone number (or type skip).",
      });
    }

    // ? STEP 2: Phone
    if (session.step === 2) {
      if (text.toLowerCase() !== "skip") session.lead.phone = text;
      session.step = 3;
      return res.json({
        reply:
          "Now tell me your requirement (example: I need website / admin panel etc.).",
      });
    }

    // ? STEP 3: Requirement -> Save Lead
    if (session.step === 3) {
      session.lead.message = text;
      session.step = 4;

		 const email = (session.lead.email || "").trim();
	const phone = (session.lead.phone || "").trim();

	const existingLead = await Lead.findOne({
	  $or: [
		...(email ? [{ email }] : []),
		...(phone ? [{ phone }] : [])
	  ]
	});

	if (!existingLead) {
	  await Lead.create({
		name: session.lead.name || "",
		email,
		phone,
		message: session.lead.message || "",
		source: "Subrat Freelancer Chatbot",
	  });

	  return res.json({
		reply:
		  "Thank you! Your details are saved.\nNow you can type: services / pricing / contact",
	  });
	} else {
	  return res.json({
		reply:
		  "Your details are already saved.\nNow you can type: services / pricing / contact",
	  });
	}

    }

    // ? STEP 4: Rule-based replies
    const msgLower = text.toLowerCase();

    if (msgLower.includes("service")) {
      return res.json({
        reply:
          "My Services:\n1) Website Development\n2) Admin Panels\n3) APIs / Backend\n4) Chatbots (Rule-based + AI)",
      });
    }

    if (
      msgLower.includes("price") ||
      msgLower.includes("pricing") ||
      msgLower.includes("cost")
    ) {
      return res.json({
        reply:
          "Pricing (Approx):\n• Basic Website: INR 5k - 15k\n• Admin Panel: INR 20k+\n• Chatbot: INR 10k+",
      });
    }

    if (
      msgLower.includes("contact") ||
      msgLower.includes("email") ||
      msgLower.includes("whatsapp")
    ) {
      return res.json({
        reply: "Contact:\nEmail: yourmail@gmail.com\nWhatsApp: +91 XXXXX XXXXX",
      });
    }

    return res.json({ reply: 'Try: "services", "pricing", "contact"' });
  } catch (err) {
    console.log("? /chat Error:", err.message);
    res.status(500).json({ reply: "Server error. Please try again." });
  }
});

/* ==================================================
   ? Lead API (Optional direct lead saving)
================================================== */
app.post("/api/leads", async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    if (!name || !message) {
      return res.status(400).json({ error: "Name and message required" });
    }

    const lead = await Lead.create({
      name,
      email,
      phone,
      message,
      source: "Subrat Freelancer Chatbot",
    });

    res.json({ success: true, lead });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ==================================================
   ? Admin Leads API
================================================== */
app.get("/api/admin/leads", async (req, res) => {
  try {
    const key = req.headers["x-admin-key"];

    if (!key || key !== process.env.ADMIN_KEY) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const leads = await Lead.find().sort({ createdAt: -1 });
    res.json({ success: true, total: leads.length, leads });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


const { Parser } = require("json2csv");

// ? EXPORT CSV
  app.get("/api/admin/leads/export", async (req, res) => {
  try {
    const key = req.headers["x-admin-key"];

    if (!key || key !== process.env.ADMIN_KEY) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const leads = await Lead.find().sort({ createdAt: -1 });

    const parser = new Parser({
      fields: ["name", "email", "phone", "message", "source", "createdAt"],
    });

    const csv = parser.parse(leads);

    res.header("Content-Type", "text/csv");
    res.attachment("leadflc-leads.csv");
    res.send(csv);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ==================================================
   ? Start server
================================================== */
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log("? Server running on port", PORT));
