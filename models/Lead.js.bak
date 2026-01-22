const mongoose = require("mongoose");

const leadSchema = new mongoose.Schema(
  {
    name: { type: String, default: "" },
    email: { type: String, default: "" },
    phone: { type: String, default: "" },
    message: { type: String, default: "" },
    source: { type: String, default: "Freelancer Website Chatbot" }
  },
  { timestamps: true }
);

// ? This will create collection name exactly: leadflc
module.exports = mongoose.model("leadflc", leadSchema);
