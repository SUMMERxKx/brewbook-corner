const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // receiver
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // who triggered it
  type: { type: String, enum: ["like", "comment", "friend_request", "friend_accept"], required: true },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  postId: { type: mongoose.Schema.Types.ObjectId, ref: "Post" }, // For like/comment notifications
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Notification", NotificationSchema);

