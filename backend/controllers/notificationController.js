const Notification = require("../models/Notification");
const User = require("../models/User");

// Get all notifications for current user
const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;

    const notifications = await Notification.find({ user: userId })
      .populate("sender", "username side")
      .populate("postId", "title")
      .sort({ createdAt: -1 })
      .limit(50);

    const formattedNotifications = notifications.map(notif => ({
      _id: notif._id.toString(),
      sender: {
        _id: notif.sender._id.toString(),
        username: notif.sender.username,
        side: notif.sender.side
      },
      type: notif.type,
      message: notif.message,
      read: notif.read,
      postId: notif.postId ? notif.postId._id.toString() : null,
      postTitle: notif.postId ? notif.postId.title : null,
      createdAt: notif.createdAt.toISOString()
    }));

    // Count unread notifications
    const unreadCount = await Notification.countDocuments({ 
      user: userId, 
      read: false 
    });

    res.json({ 
      notifications: formattedNotifications,
      unreadCount 
    });
  } catch (err) {
    console.error("Error fetching notifications:", err);
    res.status(500).json({ error: err.message });
  }
};

// Mark notification as read
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const notification = await Notification.findById(id);
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    if (notification.user.toString() !== userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    notification.read = true;
    await notification.save();

    res.json({ message: "Notification marked as read" });
  } catch (err) {
    console.error("Error marking notification as read:", err);
    res.status(500).json({ error: err.message });
  }
};

// Mark all notifications as read
const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    await Notification.updateMany(
      { user: userId, read: false },
      { read: true }
    );

    res.json({ message: "All notifications marked as read" });
  } catch (err) {
    console.error("Error marking all notifications as read:", err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getNotifications, markAsRead, markAllAsRead };

