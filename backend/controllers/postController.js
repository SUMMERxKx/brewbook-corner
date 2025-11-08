const Post = require("../models/Post");
const Comment = require("../models/Comment");
const User = require("../models/User");
const { updateBadges } = require("../utils/badges");

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

        // Log each post's imageUrl for debugging
        if (posts.indexOf(post) === 0) {
          console.log("First post in getPosts - imageUrl:", post.imageUrl);
        }
        
        return {
          _id: post._id.toString(),
          title: post.title,
          description: post.description,
          imageUrl: post.imageUrl, // Ensure imageUrl is included
          side: post.side,
          userId: post.userId._id.toString(), // Include userId for ownership check
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
      userId: post.userId._id.toString(), // Include userId for ownership check
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
    // Debug: Log entire request body
    console.log("Full req.body:", JSON.stringify(req.body, null, 2));
    console.log("req.user.id:", req.user.id);
    
    const { title, description, imageUrl } = req.body;

    const normalizedImageUrl = typeof imageUrl === "string" ? imageUrl.trim() : "";

    if (!normalizedImageUrl) {
      return res.status(400).json({ message: "An image is required. Please upload an image for your recipe." });
    }
 
    // Get user to determine their side
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
 
    // Create post with uploaded image URL/path
    const post = await Post.create({
      userId: req.user.id,
      title,
      description,
      imageUrl: normalizedImageUrl,
      side: user.side
    });
    
    // Award points for creating a post (+10 points)
    let pointsToAdd = 10;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastPostDate = user.lastPostDate ? new Date(user.lastPostDate) : null;
    
    // Check for daily streak bonus (+20 points)
    if (lastPostDate) {
      lastPostDate.setHours(0, 0, 0, 0);
      const diffDays = Math.floor((today - lastPostDate) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        // Posted yesterday, so today is day 2 of streak (bonus!)
        pointsToAdd += 20;
      } else if (diffDays > 1) {
        // Streak broken, just award base points
      }
    } else {
      // First post ever, award base points
    }

    user.points = (user.points || 0) + pointsToAdd;
    user.lastPostDate = today;
    user.badges = updateBadges(user.points);
    await user.save();

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

    // Get post owner
    const postOwner = await User.findById(post.userId);
    
    // Get current user for notifications
    const currentUser = await User.findById(userId);
    
    // Toggle like
    if (likedIndex > -1) {
      post.likes.splice(likedIndex, 1);
      
      // Remove points if unliking (don't remove more than 2)
      if (postOwner && postOwner.points > 0) {
        postOwner.points = Math.max(0, postOwner.points - 2);
        postOwner.badges = updateBadges(postOwner.points);
        await postOwner.save();
      }
    } else {
      post.likes.push(userId);
      
      // Award points to post owner (+2 points per like)
      if (postOwner && userId !== post.userId.toString()) {
        postOwner.points = (postOwner.points || 0) + 2;
        postOwner.badges = updateBadges(postOwner.points);
        await postOwner.save();
        
        // Create like notification
        const Notification = require("../models/Notification");
        await Notification.create({
          user: postOwner._id,
          sender: userId,
          type: "like",
          message: `${currentUser.username} liked your post`,
          postId: post._id
        });
      }
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

// Delete a post
const deletePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user.id;

    // Find the post
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Check if user owns the post
    if (post.userId.toString() !== userId) {
      return res.status(403).json({ message: "You can only delete your own posts" });
    }

    // Delete all comments for this post
    await Comment.deleteMany({ postId: post._id });

    // Delete the post
    await Post.findByIdAndDelete(postId);

    res.json({ message: "Post deleted successfully" });
  } catch (err) {
    console.error("Error deleting post:", err);
    res.status(500).json({ error: err.message });
  }
};

// Get discover feed - all public posts
const getDiscoverFeed = async (req, res) => {
  try {
    const posts = await Post.find({})
      .populate("userId", "username side avatar")
      .sort({ createdAt: -1 })
      .limit(50);

    const formattedPosts = await Promise.all(
      posts.map(async (post) => {
        const comments = await Comment.find({ postId: post._id })
          .populate("userId", "username side")
          .sort({ createdAt: 1 })
          .limit(10);

        return {
          _id: post._id.toString(),
          title: post.title,
          description: post.description,
          imageUrl: post.imageUrl,
          side: post.side,
          userId: post.userId._id.toString(),
          user: {
            username: post.userId.username,
            side: post.userId.side,
            avatar: post.userId.avatar
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
    console.error("Error getting discover feed:", err);
    res.status(500).json({ error: err.message });
  }
};

// Get friends feed - only posts from user's friends
const getFriendsFeed = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).populate("friends");

    if (!user || !user.friends || user.friends.length === 0) {
      return res.json([]);
    }

    const friendIds = user.friends.map(friend => friend._id);
    
    const posts = await Post.find({ userId: { $in: friendIds } })
      .populate("userId", "username side avatar")
      .sort({ createdAt: -1 })
      .limit(50);

    const formattedPosts = await Promise.all(
      posts.map(async (post) => {
        const comments = await Comment.find({ postId: post._id })
          .populate("userId", "username side")
          .sort({ createdAt: 1 })
          .limit(10);

        return {
          _id: post._id.toString(),
          title: post.title,
          description: post.description,
          imageUrl: post.imageUrl,
          side: post.side,
          userId: post.userId._id.toString(),
          user: {
            username: post.userId.username,
            side: post.userId.side,
            avatar: post.userId.avatar
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
    console.error("Error getting friends feed:", err);
    res.status(500).json({ error: err.message });
  }
};

// Get side feed - only posts from users on the same side
const getSideFeed = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user || !user.side) {
      return res.status(400).json({ message: "User side not found" });
    }

    const posts = await Post.find({ side: user.side })
      .populate("userId", "username side avatar")
      .sort({ createdAt: -1 })
      .limit(50);

    const formattedPosts = await Promise.all(
      posts.map(async (post) => {
        const comments = await Comment.find({ postId: post._id })
          .populate("userId", "username side")
          .sort({ createdAt: 1 })
          .limit(10);

        return {
          _id: post._id.toString(),
          title: post.title,
          description: post.description,
          imageUrl: post.imageUrl,
          side: post.side,
          userId: post.userId._id.toString(),
          user: {
            username: post.userId.username,
            side: post.userId.side,
            avatar: post.userId.avatar
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
    console.error("Error getting side feed:", err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = { 
  getPosts, 
  getPost, 
  createPost, 
  likePost, 
  deletePost,
  getDiscoverFeed,
  getFriendsFeed,
  getSideFeed
};

