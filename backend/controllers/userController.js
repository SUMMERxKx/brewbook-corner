const User = require("../models/User");
const Post = require("../models/Post");
const Comment = require("../models/Comment");
const Notification = require("../models/Notification");
const { updateBadges } = require("../utils/badges");

// Get user profile by username
const getUserProfile = async (req, res) => {
  try {
    const { username } = req.params;

    // First find the user to check ownership
    const user = await User.findOne({ username }).select("-passwordHash");
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if viewing own profile
    const isOwnProfile = req.user && req.user.id === user._id.toString();
    
    // Remove email if not own profile
    if (!isOwnProfile && user.email) {
      user.email = undefined;
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

    // Check relationship status between current user and profile owner
    let relation = "none"; // none, friends, pending_sent, pending_received
    if (req.user && req.user.id !== user._id.toString()) {
      const currentUserId = req.user.id;
      
      // Check if already friends
      const isFriend = user.friends && user.friends.some(f => f.toString() === currentUserId);
      
      // Check if request was sent (current user sent to profile owner)
      const requestSent = user.friendRequests && user.friendRequests.some(f => f.toString() === currentUserId);
      
      // Check if request was received (profile owner sent to current user)
      const requestReceived = user.sentRequests && user.sentRequests.some(f => f.toString() === currentUserId);
      
      if (isFriend) {
        relation = "friends";
      } else if (requestSent) {
        relation = "pending_received"; // Current user received request from profile owner
      } else if (requestReceived) {
        relation = "pending_sent"; // Current user sent request to profile owner
      }
    }

    // Format user profile
    const profile = {
      _id: user._id.toString(),
      username: user.username,
      email: isOwnProfile ? user.email : undefined, // Only include email for own profile
      side: user.side,
      bio: user.bio || "",
      points: user.points || 0,
      badges: user.badges || ["Novice"],
      postsCount,
      friendsCount: user.friends ? user.friends.length : 0,
      createdAt: user.createdAt.toISOString(),
      isOwnProfile: req.user && req.user.id === user._id.toString(),
      isFriend: relation === "friends",
      relation: relation // none, friends, pending_sent, pending_received
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

// Send friend request
const sendFriendRequest = async (req, res) => {
  try {
    const { id } = req.params; // Target user's ID
    const currentUserId = req.user.id;

    if (currentUserId === id) {
      return res.status(400).json({ message: "You cannot send a friend request to yourself" });
    }

    const sender = await User.findById(currentUserId);
    const recipient = await User.findById(id);

    if (!sender || !recipient) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if already friends
    if (sender.friends && sender.friends.some(f => f.toString() === id)) {
      return res.status(400).json({ message: "Already friends" });
    }

    // Check if request already sent
    if (sender.sentRequests && sender.sentRequests.some(f => f.toString() === id)) {
      return res.status(400).json({ message: "Friend request already sent" });
    }

    // Check if already received a request from this user
    if (sender.friendRequests && sender.friendRequests.some(f => f.toString() === id)) {
      return res.status(400).json({ message: "This user has already sent you a friend request" });
    }

    // Add to sender's sentRequests
    if (!sender.sentRequests) sender.sentRequests = [];
    sender.sentRequests.push(id);

    // Add to recipient's friendRequests
    if (!recipient.friendRequests) recipient.friendRequests = [];
    recipient.friendRequests.push(currentUserId);

    await sender.save();
    await recipient.save();

    // Create notification for recipient
    await Notification.create({
      user: id,
      sender: currentUserId,
      type: "friend_request",
      message: "sent you a friend request"
    });

    res.json({ message: "Friend request sent successfully" });
  } catch (err) {
    console.error("Error sending friend request:", err);
    res.status(500).json({ error: err.message });
  }
};

// Accept friend request
const acceptFriendRequest = async (req, res) => {
  try {
    const { id } = req.params; // Sender's ID (person who sent the request)
    const currentUserId = req.user.id;

    if (currentUserId === id) {
      return res.status(400).json({ message: "Invalid operation" });
    }

    const currentUser = await User.findById(currentUserId);
    const sender = await User.findById(id);

    if (!currentUser || !sender) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if request exists
    const hasIncomingRequest = currentUser.friendRequests && 
      currentUser.friendRequests.some(f => f.toString() === id);
    
    if (!hasIncomingRequest) {
      return res.status(400).json({ message: "Friend request not found" });
    }

    // Check if already friends
    if (currentUser.friends && currentUser.friends.some(f => f.toString() === id)) {
      return res.status(400).json({ message: "Already friends" });
    }

    // Remove from friendRequests and sentRequests
    currentUser.friendRequests = currentUser.friendRequests.filter(f => f.toString() !== id);
    if (!sender.sentRequests) sender.sentRequests = [];
    sender.sentRequests = sender.sentRequests.filter(f => f.toString() !== currentUserId);

    // Add to friends for both users
    if (!currentUser.friends) currentUser.friends = [];
    if (!sender.friends) sender.friends = [];
    currentUser.friends.push(id);
    sender.friends.push(currentUserId);

    await currentUser.save();
    await sender.save();

    // Create notification for sender
    await Notification.create({
      user: id,
      sender: currentUserId,
      type: "friend_accept",
      message: "accepted your friend request"
    });

    res.json({ message: "Friend request accepted successfully" });
  } catch (err) {
    console.error("Error accepting friend request:", err);
    res.status(500).json({ error: err.message });
  }
};

// Reject friend request
const rejectFriendRequest = async (req, res) => {
  try {
    const { id } = req.params; // Sender's ID (person who sent the request)
    const currentUserId = req.user.id;

    if (currentUserId === id) {
      return res.status(400).json({ message: "Invalid operation" });
    }

    const currentUser = await User.findById(currentUserId);
    const sender = await User.findById(id);

    if (!currentUser || !sender) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if request exists
    const hasIncomingRequest = currentUser.friendRequests && 
      currentUser.friendRequests.some(f => f.toString() === id);
    
    if (!hasIncomingRequest) {
      return res.status(400).json({ message: "Friend request not found" });
    }

    // Remove from friendRequests and sentRequests
    currentUser.friendRequests = currentUser.friendRequests.filter(f => f.toString() !== id);
    if (sender.sentRequests) {
      sender.sentRequests = sender.sentRequests.filter(f => f.toString() !== currentUserId);
    }

    await currentUser.save();
    await sender.save();

    res.json({ message: "Friend request rejected successfully" });
  } catch (err) {
    console.error("Error rejecting friend request:", err);
    res.status(500).json({ error: err.message });
  }
};

// Get friend requests
const getFriendRequests = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user.id;

    // Check if user is viewing their own requests
    if (req.user.id !== id) {
      return res.status(403).json({ message: "You can only view your own friend requests" });
    }

    const user = await User.findById(id)
      .populate("friendRequests", "username side badges points")
      .populate("sentRequests", "username side badges points");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const incoming = (user.friendRequests || []).map(friend => ({
      _id: friend._id.toString(),
      username: friend.username,
      side: friend.side,
      badges: friend.badges || ["Novice"],
      points: friend.points || 0
    }));

    const outgoing = (user.sentRequests || []).map(friend => ({
      _id: friend._id.toString(),
      username: friend.username,
      side: friend.side,
      badges: friend.badges || ["Novice"],
      points: friend.points || 0
    }));

    res.json({ incoming, outgoing });
  } catch (err) {
    console.error("Error fetching friend requests:", err);
    res.status(500).json({ error: err.message });
  }
};

// Search users by username
const searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.trim() === "") {
      return res.json([]);
    }

    // Case-insensitive regex search on username
    const users = await User.find({
      username: { $regex: q, $options: "i" }
    })
      .select("username side badges points")
      .limit(10);

    const results = users.map(user => ({
      _id: user._id.toString(),
      username: user.username,
      side: user.side,
      badges: user.badges || ["Novice"],
      points: user.points || 0
    }));

    res.json(results);
  } catch (err) {
    console.error("Error searching users:", err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = { 
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
};

