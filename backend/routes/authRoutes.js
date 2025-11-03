const express = require("express");
const router = express.Router();
const { register, login, requestPasswordReset, resetPassword } = require("../controllers/authController");

// Register new user
router.post("/register", register);

// Login user
router.post("/login", login);

// Request password reset
router.post("/request-reset", requestPasswordReset);

// Reset password
router.post("/reset-password", resetPassword);

module.exports = router;

