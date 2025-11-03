const express = require("express");
const router = express.Router();
const { 
  getUserProfile, 
  updateBio, 
  switchSide, 
  getFriends, 
  addFriend, 
  removeFriend,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  getFriendRequests,
  searchUsers
} = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");

// Search users (requires auth)
router.get("/search", authMiddleware, searchUsers);

// Get user profile by username (public route, but auth optional for own profile)
router.get("/:username", authMiddleware, getUserProfile);

// Update bio (requires auth, must be own profile)
router.patch("/:id/bio", authMiddleware, updateBio);

// Switch side (requires auth, must be own profile)
router.patch("/:id/switch-side", authMiddleware, switchSide);

// Get friends list (requires auth, must be own profile)
router.get("/:id/friends", authMiddleware, getFriends);

// Add friend (requires auth) - DEPRECATED: use sendFriendRequest instead
router.post("/:id/add-friend", authMiddleware, addFriend);

// Remove friend (requires auth)
router.delete("/:id/remove-friend", authMiddleware, removeFriend);

// Friend request routes
router.post("/:id/send-request", authMiddleware, sendFriendRequest);
router.post("/:id/accept-request", authMiddleware, acceptFriendRequest);
router.post("/:id/reject-request", authMiddleware, rejectFriendRequest);
router.get("/:id/requests", authMiddleware, getFriendRequests);

module.exports = router;

