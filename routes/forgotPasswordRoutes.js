const express = require("express");
const { body, validationResult } = require("express-validator");
const User = require("../models/user");

const router = express.Router();

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

/**
 * @route POST /users/forgot-password
 * @summary Request password reset (OTP via console for now)
 */
router.post(
  "/",
  [body("email").isEmail().withMessage("Valid email is required").normalizeEmail()],
  async (req, res) => {
    if (validate(req, res)) return;
  const { email } = req.body;

    try {
      const user = await User.findOne({ email });

      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      // Generate 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      user.resetOtp = otp;
      user.resetOtpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes
      await user.save();

      // In production, send email/SMS here
      console.log("KGL password reset OTP for", email, "is", otp);

      res.json({
        success: true,
        message: "OTP generated successfully. Check console or configured mailer.",
      });
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: "Server error", error: error.message });
    }
  },
);

module.exports = router;
