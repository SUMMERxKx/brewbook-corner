const express = require("express");
const router = express.Router();
const { getComments } = require("../controllers/commentController");

// Get all comments for a post
router.get("/:postId", getComments);

module.exports = router;

