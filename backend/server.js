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

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

