const Chat = require("../models/Chat");
const User = require("../models/User");

// Start a new chat between two users
const startChat = async (req, res) => {
  try {
    const { friendId } = req.body;
    const currentUserId = req.user.id;

    if (!friendId) {
      return res.status(400).json({ message: "Friend ID is required" });
    }

    if (currentUserId === friendId) {
      return res.status(400).json({ message: "Cannot start chat with yourself" });
    }

    // Check if chat already exists
    let chat = await Chat.findOne({
      members: { $all: [currentUserId, friendId] }
    }).populate("members", "username email side");

    if (!chat) {
      // Create new chat
      chat = await Chat.create({
        members: [currentUserId, friendId],
        messages: []
      });
      await chat.populate("members", "username email side");
    }

    res.json({
      chat: {
        _id: chat._id.toString(),
        members: chat.members.map(member => ({
          _id: member._id.toString(),
          username: member.username,
          email: member.email,
          side: member.side
        })),
        messages: chat.messages.map(msg => ({
          _id: msg._id?.toString(),
          sender: msg.sender.toString(),
          text: msg.text,
          createdAt: msg.createdAt.toISOString()
        })),
        createdAt: chat.createdAt.toISOString()
      }
    });
  } catch (err) {
    console.error("Error starting chat:", err);
    res.status(500).json({ error: err.message });
  }
};

// Send a message in a chat
const sendMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    const senderId = req.user.id;

    if (!text || text.trim() === "") {
      return res.status(400).json({ message: "Message text is required" });
    }

    const chat = await Chat.findById(id);
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    // Verify user is a member of the chat
    if (!chat.members.includes(senderId)) {
      return res.status(403).json({ message: "You are not a member of this chat" });
    }

    // Add message
    chat.messages.push({
      sender: senderId,
      text: text.trim(),
      createdAt: Date.now()
    });

    chat.updatedAt = Date.now();
    await chat.save();

    // Populate sender info
    await chat.populate("messages.sender", "username");

    const newMessage = chat.messages[chat.messages.length - 1];

    res.json({
      message: {
        _id: newMessage._id.toString(),
        sender: newMessage.sender._id.toString(),
        senderName: newMessage.sender.username,
        text: newMessage.text,
        createdAt: newMessage.createdAt.toISOString()
      }
    });
  } catch (err) {
    console.error("Error sending message:", err);
    res.status(500).json({ error: err.message });
  }
};

// Get all chats for a user
const getUserChats = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    // Verify user is viewing their own chats
    if (currentUserId !== userId) {
      return res.status(403).json({ message: "You can only view your own chats" });
    }

    const chats = await Chat.find({
      members: userId
    })
      .populate("members", "username email side")
      .sort({ updatedAt: -1 });

    const formattedChats = chats.map(chat => {
      // Get the other member (not the current user)
      const otherMember = chat.members.find(
        member => member._id.toString() !== userId
      );

      const lastMessage = chat.messages.length > 0 
        ? chat.messages[chat.messages.length - 1]
        : null;

      return {
        _id: chat._id.toString(),
        otherMember: otherMember ? {
          _id: otherMember._id.toString(),
          username: otherMember.username,
          email: otherMember.email,
          side: otherMember.side
        } : null,
        lastMessage: lastMessage ? {
          text: lastMessage.text,
          createdAt: lastMessage.createdAt.toISOString()
        } : null,
        createdAt: chat.createdAt.toISOString(),
        updatedAt: chat.updatedAt.toISOString()
      };
    });

    res.json({ chats: formattedChats });
  } catch (err) {
    console.error("Error fetching chats:", err);
    res.status(500).json({ error: err.message });
  }
};

// Get a specific chat by ID
const getChat = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const chat = await Chat.findById(id).populate("members", "username email side").populate("messages.sender", "username");
    
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    // Verify user is a member
    if (!chat.members.some(member => member._id.toString() === userId)) {
      return res.status(403).json({ message: "You are not a member of this chat" });
    }

    res.json({
      chat: {
        _id: chat._id.toString(),
        members: chat.members.map(member => ({
          _id: member._id.toString(),
          username: member.username,
          email: member.email,
          side: member.side
        })),
        messages: chat.messages.map(msg => ({
          _id: msg._id?.toString(),
          sender: msg.sender._id.toString(),
          senderName: msg.sender.username,
          text: msg.text,
          createdAt: msg.createdAt.toISOString()
        })),
        createdAt: chat.createdAt.toISOString()
      }
    });
  } catch (err) {
    console.error("Error fetching chat:", err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = { startChat, sendMessage, getUserChats, getChat };

