const User = require("../models/User");
const Post = require("../models/Post");
const Comment = require("../models/Comment");
const { updateBadges } = require("../utils/badges");

// Get user profile by username
const getUserProfile = async (req, res) => {
  try {
    const { username } = req.params;

    const user = await User.findOne({ username }).select("-passwordHash");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get user's posts count
    const postsCount = await Post.countDocuments({ userId: user._id });

    // Get user's posts
    const posts = await Post.find({ userId: user._id })
      .populate("userId", "username side")
      .sort({ createdAt: -1 })
      .limit(20);

    // Format posts with comments
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

    // Check if current user is a friend of the profile owner
    let isFriend = false;
    if (req.user && req.user.id !== user._id.toString()) {
      // Check if current user is in profile owner's friends list
      isFriend = user.friends && user.friends.some(f => f.toString() === req.user.id);
    }

    // Format user profile
    const profile = {
      _id: user._id.toString(),
      username: user.username,
      email: user.email,
      side: user.side,
      bio: user.bio || "",
      points: user.points || 0,
      badges: user.badges || ["Novice"],
      postsCount,
      friendsCount: user.friends ? user.friends.length : 0,
      createdAt: user.createdAt.toISOString(),
      isOwnProfile: req.user && req.user.id === user._id.toString(),
      isFriend: isFriend
    };

    res.json({ profile, posts: formattedPosts });
  } catch (err) {
    console.error("Error fetching user profile:", err);
    res.status(500).json({ error: err.message });
  }
};

// Update user bio
const updateBio = async (req, res) => {
  try {
    const { id } = req.params;
    const { bio } = req.body;

    // Check if user is updating their own profile
    if (req.user.id !== id) {
      return res.status(403).json({ message: "You can only update your own profile" });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.bio = bio || "";
    await user.save();

    res.json({
      message: "Bio updated successfully",
      user: {
        _id: user._id.toString(),
        username: user.username,
        email: user.email,
        side: user.side,
        bio: user.bio,
        points: user.points,
        badges: user.badges
      }
    });
  } catch (err) {
    console.error("Error updating bio:", err);
    res.status(500).json({ error: err.message });
  }
};

// Switch user side (coffee ↔ tea)
const switchSide = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user is switching their own side
    if (req.user.id !== id) {
      return res.status(403).json({ message: "You can only switch your own side" });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Toggle side
    user.side = user.side === "coffee" ? "tea" : "coffee";
    
    // Reset points when switching sides
    user.points = 0;
    
    // Reset badge to Novice
    user.badges = ["Novice"];
    
    await user.save();

    res.json({
      message: `Switched to ${user.side} side. Points reset.`,
      user: {
        _id: user._id.toString(),
        username: user.username,
        email: user.email,
        side: user.side,
        bio: user.bio,
        points: user.points,
        badges: user.badges
      }
    });
  } catch (err) {
    console.error("Error switching side:", err);
    res.status(500).json({ error: err.message });
  }
};

// Get user's friends list
const getFriends = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user is viewing their own friends
    if (req.user.id !== id) {
      return res.status(403).json({ message: "You can only view your own friends" });
    }

    const user = await User.findById(id).populate("friends", "username email side points badges");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const friends = user.friends.map(friend => ({
      _id: friend._id.toString(),
      username: friend.username,
      email: friend.email,
      side: friend.side,
      points: friend.points || 0,
      badges: friend.badges || ["Novice"]
    }));

    res.json({ friends });
  } catch (err) {
    console.error("Error fetching friends:", err);
    res.status(500).json({ error: err.message });
  }
};

// Add friend
const addFriend = async (req, res) => {
  try {
    const { id } = req.params; // Friend's ID
    const currentUserId = req.user.id;

    if (currentUserId === id) {
      return res.status(400).json({ message: "You cannot add yourself as a friend" });
    }

    const user = await User.findById(currentUserId);
    const friend = await User.findById(id);

    if (!user || !friend) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if already friends
    if (user.friends.some(f => f.toString() === id)) {
      return res.status(400).json({ message: "Already friends" });
    }

    // Add friend to both users
    user.friends.push(id);
    friend.friends.push(currentUserId);

    await user.save();
    await friend.save();

    res.json({ message: "Friend added successfully" });
  } catch (err) {
    console.error("Error adding friend:", err);
    res.status(500).json({ error: err.message });
  }
};

// Remove friend
const removeFriend = async (req, res) => {
  try {
    const { id } = req.params; // Friend's ID
    const currentUserId = req.user.id;

    if (currentUserId === id) {
      return res.status(400).json({ message: "You cannot remove yourself" });
    }

    const user = await User.findById(currentUserId);
    const friend = await User.findById(id);

    if (!user || !friend) {
      return res.status(404).json({ message: "User not found" });
    }

    // Remove friend from both users
    user.friends = user.friends.filter(f => f.toString() !== id);
    friend.friends = friend.friends.filter(f => f.toString() !== currentUserId);

    await user.save();
    await friend.save();

    res.json({ message: "Friend removed successfully" });
  } catch (err) {
    console.error("Error removing friend:", err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getUserProfile, updateBio, switchSide, getFriends, addFriend, removeFriend };

