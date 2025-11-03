const express = require("express");
const router = express.Router();
const { getNotifications, markAsRead, markAllAsRead } = require("../controllers/notificationController");
const authMiddleware = require("../middleware/authMiddleware");

// Get all notifications (requires auth)
router.get("/", authMiddleware, getNotifications);

// Mark notification as read (requires auth)
router.post("/:id/read", authMiddleware, markAsRead);

// Mark all notifications as read (requires auth)
router.post("/read-all", authMiddleware, markAllAsRead);

module.exports = router;

