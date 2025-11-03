const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  side: { type: String, enum: ["coffee", "tea"], required: true },
  bio: { type: String, default: "" },
  points: { type: Number, default: 0 },
  badges: [{ type: String }],
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  lastPostDate: { type: Date }, // For tracking daily streak
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("User", userSchema);

