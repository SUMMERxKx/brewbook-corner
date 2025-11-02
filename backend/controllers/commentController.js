const Comment = require("../models/Comment");
const Post = require("../models/Post");
const User = require("../models/User");

// Add a comment to a post
const addComment = async (req, res) => {
  try {
    const { text } = req.body;
    const postId = req.params.id;

    // Validate required fields
    if (!text) {
      return res.status(400).json({ message: "Comment text is required" });
    }

    // Verify post exists
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Create comment
    const comment = await Comment.create({
      postId,
      userId: req.user.id,
      text
    });

    // Populate user info
    await comment.populate("userId", "username side");

    // Get updated post with all comments
    const updatedPost = await Post.findById(postId).populate("userId", "username side");
    const comments = await Comment.find({ postId })
      .populate("userId", "username side")
      .sort({ createdAt: 1 });

    const formattedPost = {
      _id: updatedPost._id.toString(),
      title: updatedPost.title,
      description: updatedPost.description,
      imageUrl: updatedPost.imageUrl,
      side: updatedPost.side,
      user: {
        username: updatedPost.userId.username,
        side: updatedPost.userId.side
      },
      likes: updatedPost.likes.length,
      likedBy: updatedPost.likes.map(id => id.toString()),
      comments: comments.map(c => ({
        _id: c._id.toString(),
        user: {
          username: c.userId.username,
          side: c.userId.side
        },
        text: c.text,
        createdAt: c.createdAt.toISOString()
      })),
      createdAt: updatedPost.createdAt.toISOString()
    };

    res.status(201).json(formattedPost);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all comments for a post
const getComments = async (req, res) => {
  try {
    const postId = req.params.postId;

    // Find all comments for the post
    const comments = await Comment.find({ postId })
      .populate("userId", "username side")
      .sort({ createdAt: 1 });

    // Format comments to match frontend structure
    const formattedComments = comments.map(comment => ({
      _id: comment._id.toString(),
      user: {
        username: comment.userId.username,
        side: comment.userId.side
      },
      text: comment.text,
      createdAt: comment.createdAt.toISOString()
    }));

    res.json(formattedComments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { addComment, getComments };

