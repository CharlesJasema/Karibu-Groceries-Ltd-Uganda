/*
   ROLE AUTHORIZATION MIDDLEWARE
   Restricts access based on user role
*/

exports.authorize = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      // Ensure user exists (protect middleware must run first)
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Not authorized. No user data found.",
        });
      }

      // Check if user's role is allowed
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: "Access denied. Insufficient permissions.",
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Authorization error",
      });
    }
  };
};
