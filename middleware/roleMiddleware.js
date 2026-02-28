/**
 * Role-based access control middleware.
 * Usage: requireRole('manager')  or  requireRole('manager', 'agent')
 */
const requireRole =
  (...roles) =>
  (req, res, next) => {
    if (!req.user) {
      return res
        .status(401)
        .json({ success: false, message: "Not authenticated" });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role(s): ${roles.join(", ")}`,
      });
    }
    next();
  };

module.exports = { requireRole };
