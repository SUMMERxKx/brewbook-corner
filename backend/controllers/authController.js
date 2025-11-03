const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Register a new user
const register = async (req, res) => {
  try {
    const { username, email, password, side } = req.body;
    
    // Validate required fields
    if (!username || !email || !password || !side) {
      return res.status(400).json({ message: "All fields required" });
    }

    // Check if user already exists
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "User exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({ username, email, passwordHash, side });

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "2d" });

    res.status(201).json({
      token,
      user: {
        _id: user._id.toString(),
        username: user.username,
        email: user.email,
        side: user.side
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Verify password
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "2d" });

    res.json({
      token,
      user: {
        _id: user._id.toString(),
        username: user.username,
        email: user.email,
        side: user.side
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Request password reset
const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    // Validate email
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      // For security, don't reveal if user exists or not
      // Return success message even if user doesn't exist
      return res.json({ message: "If that email exists, a reset link has been sent" });
    }

    // Generate reset token (expires in 15 minutes)
    const resetToken = jwt.sign(
      { id: user._id, type: "password-reset" },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    // Build reset link
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;

    // For development: log the reset link
    if (process.env.NODE_ENV === "development") {
      console.log("Password reset link:", resetLink);
      console.log("Token expires in 15 minutes");
    }

    // In production, send email using nodemailer
    // For now, just log it (can be enhanced with nodemailer later)
    // TODO: Integrate with nodemailer or SendGrid for production

    res.json({ message: "If that email exists, a reset link has been sent" });
  } catch (err) {
    console.error("Error requesting password reset:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Reset password
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    // Validate inputs
    if (!token || !newPassword) {
      return res.status(400).json({ message: "Token and new password are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Check if token is for password reset
      if (decoded.type !== "password-reset") {
        return res.status(401).json({ message: "Invalid token type" });
      }
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({ message: "Reset token has expired. Please request a new one." });
      }
      if (err.name === "JsonWebTokenError") {
        return res.status(401).json({ message: "Invalid reset token" });
      }
      throw err;
    }

    // Find user
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    // Update user password
    user.passwordHash = passwordHash;
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("Error resetting password:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { register, login, requestPasswordReset, resetPassword };

