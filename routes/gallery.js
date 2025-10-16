const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Gallery = require("../models/Gallery");

const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"));
    }
  },
});

// Get all gallery images
router.get("/", async (req, res) => {
  try {
    const { category } = req.query;
    let query = {};

    if (category && category !== "All") {
      query.category = category;
    }

    const images = await Gallery.find(query).sort({ uploadedAt: -1 });
    res.json(images);
  } catch (error) {
    console.error("Error fetching gallery images:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Upload image
router.post("/upload", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const { title, category } = req.body;

    if (!title || !category) {
      return res
        .status(400)
        .json({ message: "Title and category are required" });
    }

    const imageUrl = `/uploads/${req.file.filename}`;

    const newImage = new Gallery({
      title,
      category,
      imageUrl,
      filename: req.file.filename,
    });

    await newImage.save();

    res.status(201).json({
      message: "Image uploaded successfully",
      image: newImage,
    });
  } catch (error) {
    console.error("Error uploading image:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete image
router.delete("/:id", async (req, res) => {
  try {
    const image = await Gallery.findById(req.params.id);

    if (!image) {
      return res.status(404).json({ message: "Image not found" });
    }

    // Delete file from filesystem
    const filePath = path.join(uploadsDir, image.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await Gallery.findByIdAndDelete(req.params.id);

    res.json({ message: "Image deleted successfully" });
  } catch (error) {
    console.error("Error deleting image:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
