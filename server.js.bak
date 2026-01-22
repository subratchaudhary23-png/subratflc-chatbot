const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const path = require("path");

dotenv.config();

const Lead = require("./models/Lead");

const app = express();
app.use(cors());
app.use(express.json());

// ? serve widget.js + admin.html
app.use(express.static(path.join(__dirname, "public")));

// ? connect MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("? MongoDB Connected"))
  .catch((err) => console.log("? MongoDB Error:", err.message));

app.get("/", (req, res) => {
  res.send("? Freelancer Chatbot Widget Running");
});

/* ------------------------------------------
   ? Lead Create API (from widget)
------------------------------------------ */
app.post("/api/leads", async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    // basic validation
    if (!name || !message) {
      return res.status(400).json({ error: "Name and Message are required" });
    }

    const lead = await Lead.create({
      name: name.trim(),
      email: (email || "").trim(),
      phone: (phone || "").trim(),
      message: message.trim(),
      source: "Freelancer Website Chatbot"
    });

    res.json({ success: true, lead });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ------------------------------------------
   ? Admin Leads API (secure with ADMIN_KEY)
------------------------------------------ */
app.get("/api/admin/leads", async (req, res) => {
  try {
    const key = req.headers["x-admin-key"];

    if (!key || key !== process.env.ADMIN_KEY) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const leads = await Lead.find().sort({ createdAt: -1 });
    res.json({ success: true, leads });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log("? Server running on port", PORT));
