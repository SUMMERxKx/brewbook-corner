const express = require("express");
const multer = require("multer");
const { v2: cloudinary } = require("cloudinary");
const streamifier = require("streamifier");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Multer to use memory storage (we'll upload to Cloudinary from memory)
const storage = multer.memoryStorage();

const fileFilter = (_req, file, cb) => {
  const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/jpg"];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed (jpeg, png, webp, gif)"));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Helper function to upload buffer to Cloudinary
const uploadToCloudinary = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "brewbook", // Organize uploads in a 'brewbook' folder
        resource_type: "image",
        transformation: [
          {
            width: 1200,
            height: 1200,
            crop: "limit", // Limit dimensions while maintaining aspect ratio
            quality: "auto", // Optimize quality automatically
            fetch_format: "auto" // Auto-optimize format (WebP when supported)
          }
        ],
        ...options
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

// Upload image endpoint
router.post("/", authMiddleware, upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image file uploaded" });
    }

    // Upload to Cloudinary
    const result = await uploadToCloudinary(req.file.buffer);

    return res.status(201).json({
      message: "Image uploaded successfully",
      url: result.secure_url, // Use secure_url for HTTPS
      publicId: result.public_id // Cloudinary public ID for potential future deletion
    });
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    return res.status(500).json({
      message: error.message || "Failed to upload image"
    });
  }
});

// Error handler for Multer and Cloudinary errors
router.use((err, _req, res, _next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ message: "Image is too large. Max size is 5MB" });
    }
    return res.status(400).json({ message: err.message });
  }

  if (err) {
    return res.status(400).json({ message: err.message || "Failed to upload image" });
  }

  res.status(500).json({ message: "Unexpected upload error" });
});

module.exports = router;
