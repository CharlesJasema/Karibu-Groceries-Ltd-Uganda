const jwt = require("jsonwebtoken");

/*
   PROTECT ROUTES
   Verifies Access Token
*/
exports.protect = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, token missing",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach decoded user info to request
    req.user = decoded;

    next();
  } catch (error) {
    // Token expired
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired",
      });
    }

    // Invalid token
    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }
};
