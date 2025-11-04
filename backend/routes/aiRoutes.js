const express = require("express");
const router = express.Router();
const { getAIBaristaResponse } = require("../controllers/aiController");
const authMiddleware = require("../middleware/authMiddleware");

// AI Barista endpoint (requires authentication)
router.post("/barista", authMiddleware, getAIBaristaResponse);

module.exports = router;

