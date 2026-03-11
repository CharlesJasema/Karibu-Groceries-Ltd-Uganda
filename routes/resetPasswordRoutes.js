const express = require("express");
const { body, validationResult } = require("express-validator");
const User = require("../models/user");

const router = express.Router();

/**
 * @route POST /users/reset-password
 * @description Reset password using OTP. Accepts either email or contact (phone).
 */
router.post(
  "/",
  [
    body("email")
      .optional()
      .isEmail()
      .withMessage("Valid email is required"),
    body("contact")
      .optional()
      .trim()
      .matches(/^\+?\d[\d\s\-]{7,14}$/)
      .withMessage("Valid phone number is required"),
    body("otp").notEmpty().withMessage("OTP code is required"),
    body("newPassword")
      .isLength({ min: 6 })
      .withMessage("New password must be at least 6 characters"),
  ],
  async (req, res) => {
    const { email, contact, otp, newPassword } = req.body;

    // Custom validation: at least one of email or contact must be provided
    if (!email && !contact) {
      return res.status(400).json({
        success: false,
        message: "Either email or phone number is required",
      });
    }

    try {
      // Find user by email or contact
      let user;
      if (email) {
        user = await User.findOne({ email });
      } else if (contact) {
        const cleanContact = contact.replace(/\s+/g, '');
        user = await User.findOne({ 
          $or: [
            { contact: cleanContact },
            { contact: contact }
          ]
        });
      }

      if (!user || user.resetOtp !== otp || user.resetOtpExpiry < Date.now()) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid or expired OTP" });
      }

      // Password will be hashed by the pre-save hook in User model
      user.password = newPassword;
      user.resetOtp = undefined;
      user.resetOtpExpiry = undefined;

      await user.save();

      console.log("\n=== PASSWORD RESET SUCCESSFUL ===");
      console.log("User:", user.name);
      console.log("Username:", user.username);
      console.log("Method:", email ? "Email" : "SMS");
      console.log("=================================\n");

      res.json({ success: true, message: "Password reset successful" });
    } catch (error) {
      console.error('Reset password error:', error);
      res
        .status(500)
        .json({ success: false, message: "Server error", error: error.message });
    }
  },
);

module.exports = router;
