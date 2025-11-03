const express = require("express");
const router = express.Router();
const { startChat, sendMessage, getUserChats, getChat } = require("../controllers/chatController");
const authMiddleware = require("../middleware/authMiddleware");

// Start a new chat (requires auth)
router.post("/start", authMiddleware, startChat);

// Send a message in a chat (requires auth)
router.post("/:id/message", authMiddleware, sendMessage);

// Get all chats for a user (requires auth)
router.get("/user/:userId", authMiddleware, getUserChats);

// Get a specific chat by ID (requires auth)
router.get("/:id", authMiddleware, getChat);

module.exports = router;

