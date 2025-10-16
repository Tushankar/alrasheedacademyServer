const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    role: { type: String, required: true, default: "user" },
    passwordHash: { type: String, required: true },
    resetCode: { type: String },
    resetCodeExpiry: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);

// CMS Model
const cmsSchema = new mongoose.Schema(
  {
    page: { type: String, required: true, unique: true }, // e.g., 'contact'
    content: { type: mongoose.Schema.Types.Mixed, required: true }, // flexible object
  },
  { timestamps: true }
);

module.exports.CMS = mongoose.model("CMS", cmsSchema);
