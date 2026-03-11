const express = require("express");
const { query, validationResult } = require("express-validator");
const AuditLog = require("../models/auditLog");
const { protect } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");

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

// GET /audit-logs - Get audit logs with filtering
/**
 * @swagger
 * /audit-logs:
 *   get:
 *     summary: Get system audit logs
 *     description: Retrieve audit logs with optional filtering (managers and directors only)
 *     tags: [Audit]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *         description: Filter by action type
 *       - in: query
 *         name: entity
 *         schema:
 *           type: string
 *         description: Filter by entity type
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: Filter by user ID
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *     responses:
 *       200:
 *         description: List of audit logs
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Access denied
 */
router.get(
  "/",
  protect,
  requireRole("manager", "director"),
  [
    query("action").optional().isString(),
    query("entity").optional().isString(),
    query("userId").optional().isMongoId(),
    query("startDate").optional().isISO8601(),
    query("endDate").optional().isISO8601(),
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 100 }),
  ],
  async (req, res) => {
    if (validate(req, res)) return;

    try {
      const {
        action,
        entity,
        userId,
        startDate,
        endDate,
        page = 1,
        limit = 50,
      } = req.query;

      // Build filter
      const filter = {};
      if (action) filter.action = action;
      if (entity) filter.entity = entity;
      if (userId) filter.user = userId;
      if (startDate || endDate) {
        filter.createdAt = {};
        if (startDate) filter.createdAt.$gte = new Date(startDate);
        if (endDate) filter.createdAt.$lte = new Date(endDate);
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);
      const total = await AuditLog.countDocuments(filter);

      const logs = await AuditLog.find(filter)
        .populate("user", "name username role branch")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      res.status(200).json({
        success: true,
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        count: logs.length,
        data: logs,
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  }
);

// GET /audit-logs/stats - Get audit log statistics
/**
 * @swagger
 * /audit-logs/stats:
 *   get:
 *     summary: Get audit log statistics
 *     description: Get statistics about system activities
 *     tags: [Audit]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Audit statistics
 */
router.get(
  "/stats",
  protect,
  requireRole("manager", "director"),
  async (req, res) => {
    try {
      const byAction = await AuditLog.aggregate([
        {
          $group: {
            _id: "$action",
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
      ]);

      const byEntity = await AuditLog.aggregate([
        {
          $group: {
            _id: "$entity",
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
      ]);

      const recentActivity = await AuditLog.find()
        .populate("user", "name role")
        .sort({ createdAt: -1 })
        .limit(10);

      res.status(200).json({
        success: true,
        byAction,
        byEntity,
        recentActivity,
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  }
);

module.exports = router;
