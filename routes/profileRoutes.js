const express = require("express");
const { body, validationResult } = require("express-validator");
const User = require("../models/user");
const AuditLog = require("../models/auditLog");
const { protect } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");
const {
  uploadSingle,
  processPhoto,
  handleUploadError,
  deleteOldPhoto,
  getFileUrl,
} = require("../middleware/fileUpload");
const notificationService = require("../services/notificationService");

const router = express.Router();

// Helper
const validate = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array(),
    });
    return true;
  }
  return false;
};

// GET /profile  – Get current user's profile

/**
 * @swagger
 * /profile:
 *   get:
 *     summary: Get current user's profile
 *     description: Get the authenticated user's profile information
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user profile
 *       401:
 *         description: Not authenticated
 */
router.get("/", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Add full photo URL
    const profile = user.toObject();
    profile.photoUrl = getFileUrl(user.photo);

    res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

// GET /profile/me  – Get current user's profile (specific route first)

/**
 * @swagger
 * /profile/me:
 *   get:
 *     summary: Get current user's profile
 *     description: Get the authenticated user's profile information
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user profile
 *       401:
 *         description: Not authenticated
 */
router.get("/me", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Add full photo URL
    const profile = user.toObject();
    profile.photoUrl = getFileUrl(user.photo);

    res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

// GET /profile/:id  – View any user profile

/**
 * @swagger
 * /profile/{id}:
 *   get:
 *     summary: View a user profile
 *     description: Get profile information for any user
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User profile
 *       404:
 *         description: User not found
 */
router.get("/:id", protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Add full photo URL
    const profile = user.toObject();
    profile.photoUrl = getFileUrl(user.photo);

    res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

// PUT /profile/me  – Update own profile

/**
 * @swagger
 * /profile/me:
 *   put:
 *     summary: Update own profile
 *     description: Users can update their own profile information (name, email, contact, location)
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 3
 *               email:
 *                 type: string
 *                 format: email
 *               contact:
 *                 type: string
 *               location:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: Validation error
 */
router.put(
  "/me",
  protect,
  [
    body("name").optional().isLength({ min: 3 }).trim(),
    body("email").optional().isEmail().normalizeEmail(),
    body("contact")
      .optional({ checkFalsy: true })
      .custom((value) => {
        if (!value || value.trim() === '') return true;
        return /^\+?\d[\d\s\-]{7,14}$/.test(value);
      })
      .withMessage("Contact must be a valid phone number"),
    body("location").optional({ checkFalsy: true }).trim(),
  ],
  async (req, res) => {
    if (validate(req, res)) return;

    try {
      const user = await User.findById(req.user._id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Store previous state
      const previousState = {
        name: user.name,
        email: user.email,
        contact: user.contact,
        location: user.location,
      };

      // Update allowed fields only
      const allowedFields = ["name", "email", "contact", "location"];
      allowedFields.forEach((field) => {
        if (req.body[field] !== undefined) {
          user[field] = req.body[field];
        }
      });

      await user.save();

      // Create audit log
      await AuditLog.create({
        user: req.user._id,
        action: "UPDATE_PROFILE",
        entity: "User",
        entityId: user._id,
        details: req.body,
        previousState,
        newState: {
          name: user.name,
          email: user.email,
          contact: user.contact,
          location: user.location,
        },
        ip: req.ip,
      });

      res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        data: user,
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  }
);

// PUT /profile/:id  – Manager updates any user profile

/**
 * @swagger
 * /profile/{id}:
 *   put:
 *     summary: Update any user profile (managers only)
 *     description: Managers can update any user's profile information
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               contact:
 *                 type: string
 *               location:
 *                 type: string
 *               branch:
 *                 type: string
 *                 enum: [Maganjo, Matugga]
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: User not found
 */
router.put(
  "/:id",
  protect,
  requireRole("manager"),
  [
    body("name").optional().isLength({ min: 3 }).trim(),
    body("email").optional().isEmail().normalizeEmail(),
    body("contact")
      .optional({ checkFalsy: true })
      .custom((value) => {
        if (!value || value.trim() === '') return true;
        return /^\+?\d[\d\s\-]{7,14}$/.test(value);
      })
      .withMessage("Contact must be a valid phone number"),
    body("location").optional({ checkFalsy: true }).trim(),
    body("branch").optional().isIn(["Maganjo", "Matugga"]),
  ],
  async (req, res) => {
    if (validate(req, res)) return;

    try {
      const user = await User.findById(req.params.id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Store previous state
      const previousState = {
        name: user.name,
        email: user.email,
        contact: user.contact,
        location: user.location,
        branch: user.branch,
      };

      // Update allowed fields (managers can also update branch)
      const allowedFields = ["name", "email", "contact", "location", "branch"];
      allowedFields.forEach((field) => {
        if (req.body[field] !== undefined) {
          user[field] = req.body[field];
        }
      });

      await user.save();

      // Create audit log
      await AuditLog.create({
        user: req.user._id,
        action: "UPDATE_PROFILE",
        entity: "User",
        entityId: user._id,
        details: {
          ...req.body,
          updatedBy: req.user.name,
          updatedByRole: req.user.role,
        },
        previousState,
        newState: {
          name: user.name,
          email: user.email,
          contact: user.contact,
          location: user.location,
          branch: user.branch,
        },
        ip: req.ip,
      });

      // Send notification to the affected user
      await notificationService.createNotification({
        recipient: user._id,
        actor: req.user._id,
        type: notificationService.NotificationType.PROFILE_UPDATED,
        entity: "User",
        entityId: user._id,
        action: "UPDATED",
        message: `${req.user.name} (${req.user.role}) updated your profile`,
        metadata: req.body,
        branch: user.branch,
      });

      res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        data: user,
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  }
);

// POST /profile/me/photo  – Upload profile photo

/**
 * @swagger
 * /profile/me/photo:
 *   post:
 *     summary: Upload profile photo
 *     description: Upload or update profile photo (max 5MB, JPEG/PNG/GIF only)
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               photo:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Photo uploaded successfully
 *       400:
 *         description: Invalid file or validation error
 */
router.post(
  "/me/photo",
  protect,
  uploadSingle,
  handleUploadError,
  processPhoto,
  async (req, res) => {
    try {
      const user = await User.findById(req.user._id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Delete old photo if exists
      if (user.photo) {
        await deleteOldPhoto(user.photo);
      }

      // Update user with new photo filename
      user.photo = req.uploadedFilename;
      await user.save();

      // Create audit log
      await AuditLog.create({
        user: req.user._id,
        action: "UPLOAD_PHOTO",
        entity: "User",
        entityId: user._id,
        details: { filename: req.uploadedFilename },
        ip: req.ip,
      });

      res.status(200).json({
        success: true,
        message: "Photo uploaded successfully",
        data: {
          photo: user.photo,
          photoUrl: req.photoUrl,
        },
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  }
);

// DELETE /profile/me/photo  – Delete profile photo

/**
 * @swagger
 * /profile/me/photo:
 *   delete:
 *     summary: Delete profile photo
 *     description: Remove profile photo and revert to placeholder
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Photo deleted successfully
 *       404:
 *         description: User not found
 */
router.delete("/me/photo", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.photo) {
      return res.status(400).json({
        success: false,
        message: "No photo to delete",
      });
    }

    // Delete photo file
    await deleteOldPhoto(user.photo);

    // Update user
    const oldPhoto = user.photo;
    user.photo = "";
    await user.save();

    // Create audit log
    await AuditLog.create({
      user: req.user._id,
      action: "DELETE_PHOTO",
      entity: "User",
      entityId: user._id,
      details: { deletedPhoto: oldPhoto },
      ip: req.ip,
    });

    res.status(200).json({
      success: true,
      message: "Photo deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

// PATCH /profile/password  – Change password

/**
 * @swagger
 * /profile/password:
 *   patch:
 *     summary: Change current user's password
 *     description: Change the authenticated user's password
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [currentPassword, newPassword]
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *                 minLength: 6
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Current password incorrect
 */
router.patch(
  "/password",
  protect,
  [
    body("currentPassword")
      .notEmpty()
      .withMessage("Current password is required"),
    body("newPassword")
      .isLength({ min: 6 })
      .withMessage("New password must be at least 6 characters"),
  ],
  async (req, res) => {
    if (validate(req, res)) return;

    try {
      const { currentPassword, newPassword } = req.body;

      const user = await User.findById(req.user._id).select("+password");
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      const match = await user.comparePassword(currentPassword);
      if (!match) {
        return res.status(401).json({
          success: false,
          message: "Current password is incorrect",
        });
      }

      user.password = newPassword;
      await user.save();

      await AuditLog.create({
        user: user._id,
        action: "CHANGE_PASSWORD",
        entity: "User",
        entityId: user._id,
        ip: req.ip,
      });

      res.status(200).json({
        success: true,
        message: "Password changed successfully",
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  }
);

module.exports = router;
