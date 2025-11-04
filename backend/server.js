require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const path = require("path");
const connectDB = require("./config/db");

// Import routes
const authRoutes = require("./routes/authRoutes");
const postRoutes = require("./routes/postRoutes");
const commentRoutes = require("./routes/commentRoutes");
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const aiRoutes = require("./routes/aiRoutes");

// Initialize Express app
const app = express();

// Security middleware
app.use(helmet());

// CORS configuration - allow all origins for development, restrict in production
app.use(cors({ 
  origin: process.env.FRONTEND_URL || "*",
  credentials: true 
}));

// Body parsing middleware
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Connect to MongoDB
connectDB();

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/users", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/ai", aiRoutes);

// Health check endpoint (before static serving)
app.get("/api/health", (req, res) => {
  res.json({ message: "BrewBook API is running", status: "ok" });
});

// Serve static files from frontend dist folder (for combined deployment)
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));
  
  // Catch all handler: send back React's index.html file for any non-API routes
  app.get("*", (req, res) => {
    if (!req.path.startsWith("/api")) {
      res.sendFile(path.resolve(__dirname, "../frontend/dist/index.html"));
    }
  });
} else {
  // Development: health check at root
  app.get("/", (req, res) => {
    res.json({ message: "BrewBook API is running", status: "ok" });
  });
}

// Socket.IO setup
const http = require("http");
const { Server } = require("socket.io");
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "*",
    credentials: true
  }
});

// Socket.IO connection handling
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) {
    return next(new Error("Authentication error"));
  }
  
  // Verify JWT token
  const jwt = require("jsonwebtoken");
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id;
    next();
  } catch (err) {
    next(new Error("Authentication error"));
  }
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.userId);

  socket.on("joinChat", (chatId) => {
    socket.join(`chat:${chatId}`);
    console.log(`User ${socket.userId} joined chat ${chatId}`);
  });

  socket.on("sendMessage", ({ chatId, message }) => {
    // Broadcast message to all users in the chat room
    io.to(`chat:${chatId}`).emit("newMessage", {
      ...message,
      chatId
    });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.userId);
  });
});

// Start server
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Socket.IO server ready`);
});

