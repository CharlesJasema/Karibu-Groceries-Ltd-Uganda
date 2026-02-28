const express = require("express");
const bcrypt = require("bcryptjs");
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
 * @route POST /users/reset-password
 */
router.post(
  "/",
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("otp").notEmpty().withMessage("OTP code is required"),
    body("newPassword")
      .isLength({ min: 6 })
      .withMessage("New password must be at least 6 characters"),
  ],
  async (req, res) => {
    if (validate(req, res)) return;

    const { email, otp, newPassword } = req.body;

    try {
      const user = await User.findOne({ email });

      if (!user || user.resetOtp !== otp || user.resetOtpExpiry < Date.now()) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid or expired OTP" });
      }

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);

      user.resetOtp = undefined;
      user.resetOtpExpiry = undefined;

      await user.save();

      res.json({ success: true, message: "Password reset successful" });
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: "Server error", error: error.message });
    }
  },
);

module.exports = router;
