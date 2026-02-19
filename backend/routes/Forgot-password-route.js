/**
 * @route POST /users/forgot-password
 */
router.post("../../public/auth/forgot-password", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.resetOtp = otp;
    user.resetOtpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    // In production, send email here
    console.log("OTP:", otp);

    res.json({ message: "OTP sent successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});
