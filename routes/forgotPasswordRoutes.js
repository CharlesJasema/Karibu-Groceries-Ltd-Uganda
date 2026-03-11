const express = require("express");
const { body, validationResult } = require("express-validator");
const User = require("../models/user");
const emailService = require("../services/emailService");
const smsService = require("../services/smsService");

const router = express.Router();

/**
 * @route POST /users/forgot-password
 * @summary Request password reset (OTP via email or SMS)
 * @description Accepts either email or contact (phone) to send OTP
 */
router.post(
  "/",
  [
    body("email")
      .optional()
      .isEmail()
      .withMessage("Valid email is required")
      .normalizeEmail(),
    body("contact")
      .optional()
      .trim()
      .matches(/^\+?\d[\d\s\-]{7,14}$/)
      .withMessage("Valid phone number is required"),
  ],
  async (req, res) => {
    // Custom validation: at least one of email or contact must be provided
    const { email, contact } = req.body;
    
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
        // Clean contact for comparison
        const cleanContact = contact.replace(/\s+/g, '');
        user = await User.findOne({ 
          $or: [
            { contact: cleanContact },
            { contact: contact }
          ]
        });
      }

      if (!user) {
        // Don't reveal if user exists or not for security
        return res.json({
          success: true,
          message: "If the account exists, an OTP has been sent.",
        });
      }

      // Generate 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      user.resetOtp = otp;
      user.resetOtpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes
      await user.save();

      // Send OTP via email or SMS
      let sendResult;
      if (email) {
        sendResult = await emailService.sendOTP(email, otp, user.name);
      } else if (contact) {
        sendResult = await smsService.sendOTP(contact, otp, user.name);
      }

      // Log for debugging (without sensitive data)
      console.log('\n=== PASSWORD RESET OTP SENT ===');
      console.log('User:', user.name);
      console.log('Method:', email ? 'Email' : 'SMS');
      console.log('To:', email || contact);
      console.log('===================================\n');
      console.log('Send Status:', sendResult.success ? 'Success' : 'Failed (logged to console)');
      console.log('Expires in: 10 minutes');
      console.log('================================\n');

      res.json({
        success: true,
        message: email 
          ? "OTP sent to your email address."
          : "OTP sent to your phone number.",
      });
    } catch (error) {
      console.error('Forgot password error:', error);
      res
        .status(500)
        .json({ success: false, message: "Server error", error: error.message });
    }
  },
);

module.exports = router;
