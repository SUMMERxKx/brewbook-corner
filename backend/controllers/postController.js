const Post = require("../models/Post");
const Comment = require("../models/Comment");
const User = require("../models/User");

// Get all posts (optionally filtered by side)
const getPosts = async (req, res) => {
  try {
    const side = req.query.side;
    const query = side ? { side } : {};
    
    // Find posts and populate user info
    const posts = await Post.find(query)
      .populate("userId", "username side")
      .sort({ createdAt: -1 });

    // Transform posts to match frontend format
    const formattedPosts = await Promise.all(
      posts.map(async (post) => {
        // Get comments for this post
        const comments = await Comment.find({ postId: post._id })
          .populate("userId", "username side")
          .sort({ createdAt: 1 });

        return {
          _id: post._id.toString(),
          title: post.title,
          description: post.description,
          imageUrl: post.imageUrl,
          side: post.side,
          user: {
            username: post.userId.username,
            side: post.userId.side
          },
          likes: post.likes.length,
          likedBy: post.likes.map(id => id.toString()),
          comments: comments.map(comment => ({
            _id: comment._id.toString(),
            user: {
              username: comment.userId.username,
              side: comment.userId.side
            },
            text: comment.text,
            createdAt: comment.createdAt.toISOString()
          })),
          createdAt: post.createdAt.toISOString()
        };
      })
    );

    res.json(formattedPosts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get a single post by ID
const getPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate("userId", "username side");
    
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Get comments for this post
    const comments = await Comment.find({ postId: post._id })
      .populate("userId", "username side")
      .sort({ createdAt: 1 });

    const formattedPost = {
      _id: post._id.toString(),
      title: post.title,
      description: post.description,
      imageUrl: post.imageUrl,
      side: post.side,
      user: {
        username: post.userId.username,
        side: post.userId.side
      },
      likes: post.likes.length,
      likedBy: post.likes.map(id => id.toString()),
      comments: comments.map(comment => ({
        _id: comment._id.toString(),
        user: {
          username: comment.userId.username,
          side: comment.userId.side
        },
        text: comment.text,
        createdAt: comment.createdAt.toISOString()
      })),
      createdAt: post.createdAt.toISOString()
    };

    res.json(formattedPost);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create a new post
const createPost = async (req, res) => {
  try {
    const { title, description, imageUrl } = req.body;

    // Debug logging
    console.log("Creating post with data:", { title, description, imageUrl });

    // Validate imageUrl is provided
    if (!imageUrl || imageUrl.trim() === "") {
      return res.status(400).json({ message: "Image URL is required" });
    }

    // Get user to determine their side
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Create post
    const post = await Post.create({
      userId: req.user.id,
      title,
      description,
      imageUrl: imageUrl.trim(), // Trim whitespace
      side: user.side
    });

    // Debug: Log saved post
    console.log("Post created successfully:", {
      id: post._id,
      title: post.title,
      imageUrl: post.imageUrl
    });

    // Populate user info and format response
    await post.populate("userId", "username side");

    const formattedPost = {
      _id: post._id.toString(),
      title: post.title,
      description: post.description,
      imageUrl: post.imageUrl, // Ensure imageUrl is included
      side: post.side,
      user: {
        username: post.userId.username,
        side: post.userId.side
      },
      likes: 0,
      likedBy: [],
      comments: [],
      createdAt: post.createdAt.toISOString()
    };

    // Debug: Log response
    console.log("Sending formatted post:", {
      _id: formattedPost._id,
      imageUrl: formattedPost.imageUrl
    });

    res.status(201).json(formattedPost);
  } catch (err) {
    console.error("Error creating post:", err);
    res.status(500).json({ error: err.message });
  }
};

// Like/unlike a post
const likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const userId = req.user.id;
    const likedIndex = post.likes.findIndex(
      (id) => id.toString() === userId
    );

    // Toggle like
    if (likedIndex > -1) {
      post.likes.splice(likedIndex, 1);
    } else {
      post.likes.push(userId);
    }

    await post.save();
    await post.populate("userId", "username side");

    // Get comments for formatted response
    const comments = await Comment.find({ postId: post._id })
      .populate("userId", "username side")
      .sort({ createdAt: 1 });

    const formattedPost = {
      _id: post._id.toString(),
      title: post.title,
      description: post.description,
      imageUrl: post.imageUrl,
      side: post.side,
      user: {
        username: post.userId.username,
        side: post.userId.side
      },
      likes: post.likes.length,
      likedBy: post.likes.map(id => id.toString()),
      comments: comments.map(comment => ({
        _id: comment._id.toString(),
        user: {
          username: comment.userId.username,
          side: comment.userId.side
        },
        text: comment.text,
        createdAt: comment.createdAt.toISOString()
      })),
      createdAt: post.createdAt.toISOString()
    };

    res.json(formattedPost);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getPosts, getPost, createPost, likePost };

