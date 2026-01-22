const mongoose = require("mongoose");

const leadSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    phone: String,
    message: String,
    source: String
  },
  { timestamps: true }
);

// ? indexes (for fast duplicate check)
leadSchema.index({ email: 1 });
leadSchema.index({ phone: 1 });

module.exports = mongoose.model("leadflc", leadSchema);
