const express = require("express");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const User = require("../models/user");
const AuditLog = require("../models/auditLog");
const { protect } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");
const { authLimiter } = require("../middleware/rateLimiter");

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

const signToken = (user) =>
  jwt.sign(
    { id: user._id, role: user.role, branch: user.branch },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "8h" },
  );

// POST /users/login

/**
 * @swagger
 * /users/login:
 *   post:
 *     summary: Staff login
 *     description: >
 *       Accepts a username (or email) and password.
 *       Returns **200** with a JWT token when credentials match,
 *       or **401** when the user does not exist or the password is wrong.
 *     tags: [Authentication]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginBody'
 *     responses:
 *       200:
 *         description: Login successful – returns JWT and user object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       401:
 *         description: User does not exist or password is incorrect
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       400:
 *         description: Validation error (missing fields)
 */
router.post(
  "/login",
  authLimiter,
  [
    body("username").notEmpty().withMessage("Username is required").trim(),
    body("password").notEmpty().withMessage("Password is required"),
    body("branch").optional().trim(),
    body("role").optional().trim(),
  ],
  async (req, res) => {
    if (validate(req, res)) return;

    try {
      const { username, password, branch, role } = req.body;

      // Support login via username OR email
      const user = await User.findOne({
        $or: [
          { username: username.toLowerCase() },
          { email: username.toLowerCase() },
        ],
      }).select("+password");

      // Status 401 if user does not exist
      if (!user) {
        return res
          .status(401)
          .json({ success: false, message: "User does not exist" });
      }

      // Status 401 if password is wrong
      const passwordMatch = await user.comparePassword(password);
      if (!passwordMatch) {
        return res
          .status(401)
          .json({ success: false, message: "Incorrect password" });
      }

      if (!user.active) {
        return res
          .status(401)
          .json({ success: false, message: "Account is deactivated" });
      }

      // Optional client-side role selection must match stored role
      if (role && user.role !== role) {
        return res.status(401).json({
          success: false,
          message: "Role mismatch for this user",
        });
      }

      // Managers and sales agents must explicitly choose branch at login
      if (["manager", "agent"].includes(user.role)) {
        if (!branch) {
          return res.status(400).json({
            success: false,
            message: "Branch is required for managers and sales agents",
          });
        }
        if (branch !== user.branch) {
          return res.status(401).json({
            success: false,
            message: `User is registered for ${user.branch} branch, not ${branch}`,
          });
        }
      }

      const token = signToken(user);

      // Audit log
      await AuditLog.create({
        user: user._id,
        action: "LOGIN",
        entity: "User",
        entityId: user._id,
        ip: req.ip,
      });

      // Status 200
      return res.status(200).json({
        success: true,
        token,
        user: {
          id: user._id,
          name: user.name,
          username: user.username,
          role: user.role,
          branch: user.branch,
        },
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },
);

// GET /users   (Manager only)

/**
 * @swagger
 * /users:
 *   get:
 *     summary: List all users with filtering
 *     description: Returns all system users with optional filtering by role, branch, and search. **Manager only.**
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [manager, agent, director]
 *         description: Filter by role
 *       - in: query
 *         name: branch
 *         schema:
 *           type: string
 *           enum: [Maganjo, Matugga]
 *         description: Filter by branch
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name, username, or email
 *       - in: query
 *         name: active
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Array of user objects with pagination
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Access denied
 */
router.get("/", protect, requireRole("manager"), async (req, res) => {
  try {
    const { role, branch, search, active, page = 1, limit = 20 } = req.query;
    
    // Build filter
    const filter = {};
    if (role) filter.role = role;
    if (branch) filter.branch = branch;
    if (active !== undefined) filter.active = active === "true";
    
    // Search across name, username, and email
    if (search) {
      filter.$or = [
        { name: new RegExp(search, "i") },
        { username: new RegExp(search, "i") },
        { email: new RegExp(search, "i") },
      ];
    }
    
    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    res.status(200).json({
      success: true,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      count: users.length,
      data: users,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /users/stats  – User statistics (Manager only)

/**
 * @swagger
 * /users/stats:
 *   get:
 *     summary: Get user statistics
 *     description: Returns counts of users by role, branch, and active status. **Manager only.**
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     byRole:
 *                       type: object
 *                     byBranch:
 *                       type: object
 *                     active:
 *                       type: integer
 *                     inactive:
 *                       type: integer
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Access denied
 */
router.get("/stats", protect, requireRole("manager"), async (req, res) => {
  try {
    const [total, byRole, byBranch, active, inactive] = await Promise.all([
      User.countDocuments(),
      User.aggregate([
        { $group: { _id: "$role", count: { $sum: 1 } } },
      ]),
      User.aggregate([
        { $group: { _id: "$branch", count: { $sum: 1 } } },
      ]),
      User.countDocuments({ active: true }),
      User.countDocuments({ active: false }),
    ]);
    
    // Format role and branch counts
    const roleStats = {};
    byRole.forEach((item) => {
      roleStats[item._id] = item.count;
    });
    
    const branchStats = {};
    byBranch.forEach((item) => {
      branchStats[item._id] = item.count;
    });
    
    res.status(200).json({
      success: true,
      data: {
        total,
        byRole: roleStats,
        byBranch: branchStats,
        active,
        inactive,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /users   (Manager only – create a new staff member, or public for first user)

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create a new user
 *     description: Creates a Manager or Sales Agent account. **Manager only.** First user creation is public.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, username, password, role, branch, contact]
 *             properties:
 *               name:     { type: string, example: "Grace Atim" }
 *               username: { type: string, example: "grace.atim" }
 *               email:    { type: string, example: "grace@kgl.co.ug" }
 *               password: { type: string, minLength: 6, example: "Password123" }
 *               role:     { type: string, enum: [manager, agent, director] }
 *               branch:   { type: string, enum: [Maganjo, Matugga] }
 *               contact:  { type: string, example: "+256701234567" }
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Validation error or duplicate username
 *       403:
 *         description: Access denied
 */
router.post(
  "/",
  [
    body("name")
      .isLength({ min: 3 })
      .withMessage("Name must be at least 3 characters")
      .trim(),
    body("username")
      .isLength({ min: 3 })
      .withMessage("Username must be at least 3 characters")
      .trim(),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
    body("role")
      .isIn(["manager", "agent", "director"])
      .withMessage("Role must be manager, agent, or director"),
    body("branch")
      .isIn(["Maganjo", "Matugga"])
      .withMessage("Branch must be Maganjo or Matugga"),
    body("contact")
      .matches(/^\+?\d[\d\s\-]{7,14}$/)
      .withMessage("Invalid phone number"),
    body("email")
      .optional()
      .isEmail()
      .withMessage("Invalid email")
      .normalizeEmail(),
  ],
  async (req, res) => {
    if (validate(req, res)) return;
    try {
      const { name, username, email, password, role, branch, contact } =
        req.body;
      
      // Check if username already exists
      if (await User.findOne({ username: username.toLowerCase() })) {
        return res
          .status(400)
          .json({ success: false, message: "Username already exists" });
      }
      
      // Check if any users exist - if yes, require authentication
      const userCount = await User.countDocuments();
      if (userCount > 0) {
        // Require authentication for subsequent user creation
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
          return res.status(401).json({ 
            success: false, 
            message: "Authentication required to create users" 
          });
        }
        
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          const authUser = await User.findById(decoded.id);
          
          if (!authUser || authUser.role !== "manager") {
            return res.status(403).json({ 
              success: false, 
              message: "Only managers can create users" 
            });
          }
          
          // Create user
          const user = await User.create({
            name,
            username,
            email,
            password,
            role,
            branch,
            contact,
          });
          
          await AuditLog.create({
            user: authUser._id,
            action: "CREATE_USER",
            entity: "User",
            entityId: user._id,
            ip: req.ip,
          });
          
          return res.status(201).json({ success: true, data: user });
        } catch (err) {
          return res.status(401).json({ 
            success: false, 
            message: "Invalid or expired token" 
          });
        }
      }
      
      // First user creation (no authentication required)
      const user = await User.create({
        name,
        username,
        email,
        password,
        role,
        branch,
        contact,
      });
      
      await AuditLog.create({
        user: user._id,
        action: "FIRST_USER_CREATED",
        entity: "User",
        entityId: user._id,
        ip: req.ip,
      });
      
      res.status(201).json({ success: true, data: user });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },
);

// PATCH /users/:id/deactivate   (Manager only)

/**
 * @swagger
 * /users/{id}/deactivate:
 *   patch:
 *     summary: Deactivate a user account
 *     tags: [Users]
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
 *         description: User deactivated
 *       404:
 *         description: User not found
 */
router.patch(
  "/:id/deactivate",
  protect,
  requireRole("manager"),
  async (req, res) => {
    try {
      const user = await User.findByIdAndUpdate(
        req.params.id,
        { active: false },
        { new: true },
      );
      if (!user)
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      
      await AuditLog.create({
        user: req.user._id,
        action: "DEACTIVATE_USER",
        entity: "User",
        entityId: user._id,
        ip: req.ip,
      });
      
      res
        .status(200)
        .json({ success: true, message: "User deactivated", data: user });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },
);

// PATCH /users/:id/activate   (Manager only)

/**
 * @swagger
 * /users/{id}/activate:
 *   patch:
 *     summary: Reactivate a deactivated user account
 *     tags: [Users]
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
 *         description: User activated
 *       404:
 *         description: User not found
 */
router.patch(
  "/:id/activate",
  protect,
  requireRole("manager"),
  async (req, res) => {
    try {
      const user = await User.findByIdAndUpdate(
        req.params.id,
        { active: true },
        { new: true },
      );
      if (!user)
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      
      await AuditLog.create({
        user: req.user._id,
        action: "ACTIVATE_USER",
        entity: "User",
        entityId: user._id,
        ip: req.ip,
      });
      
      res
        .status(200)
        .json({ success: true, message: "User activated", data: user });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },
);

// DELETE /users/:id   (Manager only - permanent delete)

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Permanently delete a user account
 *     description: Permanently removes a user from the system. This action cannot be undone.
 *     tags: [Users]
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
 *         description: User deleted permanently
 *       404:
 *         description: User not found
 *       403:
 *         description: Cannot delete yourself or other managers
 */
router.delete(
  "/:id",
  protect,
  requireRole("manager"),
  async (req, res) => {
    try {
      const user = await User.findById(req.params.id);
      
      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }
      
      // Prevent deleting yourself
      if (user._id.toString() === req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: "Cannot delete your own account",
        });
      }
      
      // Prevent deleting other managers (optional security measure)
      if (user.role === "manager") {
        return res.status(403).json({
          success: false,
          message: "Cannot delete other manager accounts",
        });
      }
      
      await AuditLog.create({
        user: req.user._id,
        action: "DELETE_USER",
        entity: "User",
        entityId: user._id,
        details: { 
          deletedUser: user.name, 
          username: user.username,
          role: user.role 
        },
        ip: req.ip,
      });
      
      await User.findByIdAndDelete(req.params.id);
      
      res.status(200).json({
        success: true,
        message: "User deleted permanently",
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },
);

// GET /users/me  – Current user profile

/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user data
 */
router.get("/me", protect, (req, res) => {
  res.status(200).json({ success: true, data: req.user });
});

// PATCH /users/me/password – Change password (logged-in user)

/**
 * @swagger
 * /users/me/password:
 *   patch:
 *     summary: Change current user's password
 *     description: >
 *       Allows any authenticated user (manager, agent, director) to change their own password.
 *       Requires the current password for verification.
 *     tags: [Users]
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
 *                 example: OldPassword123
 *               newPassword:
 *                 type: string
 *                 minLength: 6
 *                 example: NewStrongPassword123
 *     responses:
 *       200:
 *         description: Password updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Current password incorrect
 */
router.patch(
  "/me/password",
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
        return res
          .status(401)
          .json({ success: false, message: "User not found" });
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

      res
        .status(200)
        .json({ success: true, message: "Password updated successfully" });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },
);

module.exports = router;
