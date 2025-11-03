const express = require("express");
const router = express.Router();
const { getPosts, getPost, createPost, likePost, deletePost } = require("../controllers/postController");
const { addComment } = require("../controllers/commentController");
const authMiddleware = require("../middleware/authMiddleware");

// Get all posts (optional side filter via query param)
router.get("/", getPosts);

// Get a single post by ID
router.get("/:id", getPost);

// Create a new post (requires authentication)
router.post("/", authMiddleware, createPost);

// Like/unlike a post (requires authentication)
router.post("/:id/like", authMiddleware, likePost);

// Add a comment to a post (requires authentication)
router.post("/:id/comments", authMiddleware, addComment);

// Delete a post (requires authentication)
router.delete("/:id", authMiddleware, deletePost);

module.exports = router;

