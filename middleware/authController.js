const User = require("../models/user");
const jwt = require("jsonwebtoken");

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

exports.register = async (req, res) => {
  try {
    const user = await User.create(req.body);

    res.status(201).json({
      success: true,
      user,
      token: generateToken(user._id),
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.login = async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username });

  if (!user || !(await user.comparePassword(password)))
    return res
      .status(401)
      .json({ success: false, message: "Invalid credentials" });

  res.json({
    success: true,
    user,
    token: generateToken(user._id),
  });
};

exports.getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};
