const multer = require("multer");
const sharp = require("sharp");
const path = require("path");
const fs = require("fs").promises;
const mime = require("mime-types");
const logger = require("../config/logger");

/**
 * File Upload Middleware
 * Handles secure file uploads with validation and image processing
 */

// Allowed MIME types for profile photos
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/gif"];

// Maximum file size (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Upload directory
const UPLOAD_DIR = path.join(__dirname, "../public/uploads/profiles");

/**
 * Configure multer for memory storage
 * We use memory storage to process images before saving
 */
const storage = multer.memoryStorage();

/**
 * File filter to validate file types
 */
const fileFilter = (req, file, cb) => {
  // Check MIME type
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Invalid file type. Only JPEG, PNG, and GIF images are allowed."
      ),
      false
    );
  }
};

/**
 * Multer upload configuration
 */
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
});

/**
 * Generate unique filename
 * @param {string} originalName - Original filename
 * @returns {string} Unique filename
 */
function generateUniqueFilename(originalName) {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const ext = path.extname(originalName);
  return `profile-${timestamp}-${randomString}${ext}`;
}

/**
 * Process and save uploaded image
 * @param {Buffer} buffer - Image buffer from multer
 * @param {string} originalName - Original filename
 * @returns {Promise<string>} Saved filename
 */
async function processAndSaveImage(buffer, originalName) {
  try {
    // Generate unique filename
    const filename = generateUniqueFilename(originalName);
    const filepath = path.join(UPLOAD_DIR, filename);

    // Process image with sharp
    // - Resize to max 800x800px (maintain aspect ratio)
    // - Compress to reduce file size
    // - Convert to JPEG for consistency
    await sharp(buffer)
      .resize(800, 800, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .jpeg({
        quality: 85,
        progressive: true,
      })
      .toFile(filepath);

    logger.info(`Image processed and saved: ${filename}`);
    return filename;
  } catch (error) {
    logger.error(`Failed to process image: ${error.message}`);
    throw new Error("Failed to process uploaded image");
  }
}

/**
 * Delete old profile photo
 * @param {string} filename - Filename to delete
 * @returns {Promise<void>}
 */
async function deleteOldPhoto(filename) {
  if (!filename) return;

  try {
    const filepath = path.join(UPLOAD_DIR, filename);
    await fs.unlink(filepath);
    logger.info(`Old photo deleted: ${filename}`);
  } catch (error) {
    // Don't throw error if file doesn't exist
    if (error.code !== "ENOENT") {
      logger.error(`Failed to delete old photo: ${error.message}`);
    }
  }
}

/**
 * Middleware to handle single file upload
 */
const uploadSingle = upload.single("photo");

/**
 * Middleware to validate and process uploaded photo
 */
async function processPhoto(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    // Process and save the image
    const filename = await processAndSaveImage(
      req.file.buffer,
      req.file.originalname
    );

    // Add filename to request for use in route handler
    req.uploadedFilename = filename;
    req.photoUrl = `/uploads/profiles/${filename}`;

    next();
  } catch (error) {
    logger.error(`Photo processing error: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to process uploaded photo",
    });
  }
}

/**
 * Error handler for multer errors
 */
function handleUploadError(err, req, res, next) {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "File size exceeds 5MB limit",
      });
    }
    return res.status(400).json({
      success: false,
      message: `Upload error: ${err.message}`,
    });
  }

  if (err) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  next();
}

/**
 * Get file URL from filename
 * @param {string} filename - Filename
 * @returns {string} Full URL
 */
function getFileUrl(filename) {
  if (!filename) return "";
  return `/uploads/profiles/${filename}`;
}

/**
 * Validate file exists
 * @param {string} filename - Filename to check
 * @returns {Promise<boolean>} True if file exists
 */
async function fileExists(filename) {
  if (!filename) return false;

  try {
    const filepath = path.join(UPLOAD_DIR, filename);
    await fs.access(filepath);
    return true;
  } catch {
    return false;
  }
}

module.exports = {
  uploadSingle,
  processPhoto,
  handleUploadError,
  deleteOldPhoto,
  getFileUrl,
  fileExists,
  UPLOAD_DIR,
};
