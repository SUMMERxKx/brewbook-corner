const jwt = require("jsonwebtoken");

// Middleware to verify JWT token and authenticate user
const authMiddleware = (req, res, next) => {
  // Extract token from Authorization header
  const token = req.header("Authorization")?.replace("Bearer ", "");
  
  if (!token) {
    return res.status(401).json({ message: "No token, auth denied" });
  }

  try {
    // Verify token and decode user ID
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = authMiddleware;

