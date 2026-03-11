const express = require("express");
const { body, query, validationResult } = require("express-validator");
const Procurement = require("../models/procurement");
const Inventory = require("../models/inventory");
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

// Validation rules
const procurementValidation = [
  body("produceName")
    .isAlphanumeric("en-US", { ignore: " " })
    .withMessage("Produce name must be alpha-numeric")
    .isLength({ min: 2 })
    .withMessage("Produce name must be at least 2 characters")
    .trim(),

  body("produceType")
    .matches(/^[A-Za-z ]+$/)
    .withMessage("Produce type must contain alphabetic characters only")
    .isLength({ min: 2 })
    .withMessage("Produce type must be at least 2 characters")
    .notEmpty()
    .withMessage("Produce type is required")
    .trim(),

  body("date")
    .notEmpty()
    .withMessage("Date is required")
    .isISO8601()
    .withMessage("Date must be a valid date (YYYY-MM-DD)"),

  body("time")
    .notEmpty()
    .withMessage("Time is required")
    .matches(/^([01]\d|2[0-3]):[0-5]\d$/)
    .withMessage("Time must be in HH:MM format"),

  body("tonnage")
    .isFloat({ min: 100 })
    .withMessage(
      "Tonnage must be a numeric value of at least 100 kg (3 digits minimum)",
    )
    .notEmpty()
    .withMessage("Tonnage is required"),

  body("cost")
    .isFloat({ min: 10000 })
    .withMessage("Cost must be at least 10,000 UgX (5 digits minimum)")
    .notEmpty()
    .withMessage("Cost is required"),

  body("dealerName")
    .isAlphanumeric("en-US", { ignore: " ." })
    .withMessage("Dealer name must be alpha-numeric")
    .isLength({ min: 2 })
    .withMessage("Dealer name must be at least 2 characters")
    .notEmpty()
    .withMessage("Dealer name is required")
    .trim(),

  body("branch")
    .isIn(["Maganjo", "Matugga"])
    .withMessage("Branch must be Maganjo or Matugga")
    .notEmpty()
    .withMessage("Branch is required"),

  body("contact")
    .matches(/^\+?\d[\d\s\-]{7,14}$/)
    .withMessage("Contact must be a valid phone number")
    .notEmpty()
    .withMessage("Contact is required"),

  body("sellingPrice")
    .isFloat({ min: 0 })
    .withMessage("Selling price must be a non-negative number")
    .notEmpty()
    .withMessage("Selling price is required"),
];

// POST /procurement   – Record new procurement (Manager only)

/**
 * @swagger
 * /procurement:
 *   post:
 *     summary: Record new produce procurement
 *     description: >
 *       Records produce bought by KGL from a dealer or company farm.
 *       **Managers only.**
 *       Also creates/updates an Inventory entry for stock tracking.
 *     tags: [Procurement]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProcurementBody'
 *     responses:
 *       201:
 *         description: Procurement recorded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   $ref: '#/components/schemas/ProcurementBody'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Access denied – Managers only
 */
router.post(
  "/",
  protect,
  requireRole("manager"),
  procurementValidation,
  async (req, res) => {
    if (validate(req, res)) return;

    try {
      const {
        produceName,
        produceType,
        date,
        time,
        tonnage,
        cost,
        dealerName,
        branch,
        contact,
        sellingPrice,
      } = req.body;

      const procurement = await Procurement.create({
        produceName,
        produceType,
        date: new Date(date),
        time,
        tonnage,
        cost,
        dealerName,
        branch,
        contact,
        sellingPrice,
        recordedBy: req.user._id,
      });

      // Create matching inventory entry
      await Inventory.create({
        procurement: procurement._id,
        produceName,
        produceType,
        branch,
        initialQty: tonnage,
        remainingQty: tonnage,
        sellingPrice,
      });

      await AuditLog.create({
        user: req.user._id,
        action: "CREATE_PROCUREMENT",
        entity: "Procurement",
        entityId: procurement._id,
        details: { produceName, tonnage, branch },
        ip: req.ip,
      });

      res.status(201).json({ success: true, data: procurement });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
      );

// GET /procurement   – List procurement records

/**
 * @swagger
 * /procurement:
 *   get:
 *     summary: List all procurement records
 *     description: Returns procurement records. Optional query params for filtering.
 *     tags: [Procurement]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: branch
 *         schema:
 *           type: string
 *           enum: [Maganjo, Matugga]
 *         description: Filter by branch
 *       - in: query
 *         name: produceName
 *         schema:
 *           type: string
 *         description: Filter by produce name (case-insensitive)
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
 *         description: List of procurement records
 *       401:
 *         description: Not authenticated
 */
router.get("/", protect, requireRole("manager", "agent"), async (req, res) => {
  try {
    const { branch, produceName, page = 1, limit = 20, showDeleted } = req.query;
    
    // Build filter - by default exclude deleted records
    const filter = {};
    if (showDeleted !== "true") {
      filter.deleted = { $ne: true };
    }
    
    if (branch) filter.branch = branch;
    if (produceName) filter.produceName = new RegExp(produceName, "i");

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Procurement.countDocuments(filter);
    const data = await Procurement.find(filter)
      .populate("recordedBy", "name role")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      count: data.length,
      data,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /procurement/stats  – Procurement statistics

/**
 * @swagger
 * /procurement/stats:
 *   get:
 *     summary: Get procurement statistics
 *     description: Returns procurement statistics including totals by branch, produce type, etc.
 *     tags: [Procurement]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Procurement statistics
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Access denied
 */
router.get("/stats", protect, requireRole("manager", "director"), async (req, res) => {
  try {
    const [totalRecords, byBranch, byProduce, totalValue, recentProcurements] = await Promise.all([
      Procurement.countDocuments({ deleted: { $ne: true } }),
      Procurement.aggregate([
        { $match: { deleted: { $ne: true } } },
        { $group: { _id: "$branch", count: { $sum: 1 }, totalCost: { $sum: "$cost" }, totalTonnage: { $sum: "$tonnage" } } },
        { $sort: { totalCost: -1 } }
      ]),
      Procurement.aggregate([
        { $match: { deleted: { $ne: true } } },
        { $group: { _id: "$produceName", count: { $sum: 1 }, totalCost: { $sum: "$cost" }, totalTonnage: { $sum: "$tonnage" } } },
        { $sort: { totalCost: -1 } },
        { $limit: 10 }
      ]),
      Procurement.aggregate([
        { $match: { deleted: { $ne: true } } },
        { $group: { _id: null, totalCost: { $sum: "$cost" }, totalTonnage: { $sum: "$tonnage" } } }
      ]),
      Procurement.find({ deleted: { $ne: true } })
        .populate("recordedBy", "name role")
        .sort({ createdAt: -1 })
        .limit(5)
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalRecords,
        totalValue: totalValue[0] || { totalCost: 0, totalTonnage: 0 },
        byBranch,
        topProduce: byProduce,
        recentProcurements
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /procurement/:id

/**
 * @swagger
 * /procurement/{id}:
 *   get:
 *     summary: Get a single procurement record
 *     tags: [Procurement]
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
 *         description: Procurement record
 *       404:
 *         description: Not found
 */
router.get(
  "/:id",
  protect,
  requireRole("manager", "agent"),
  async (req, res) => {
    try {
      const doc = await Procurement.findById(req.params.id).populate(
        "recordedBy",
        "name role"
      );
      if (!doc)
        return res
          .status(404)
          .json({ success: false, message: "Procurement record not found" });
      res.status(200).json({ success: true, data: doc });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
      );

// PATCH /procurement/:id/price  – Update selling price (Manager only)

/**
 * @swagger
 * /procurement/{id}/price:
 *   patch:
 *     summary: Update selling price for a procurement batch
 *     tags: [Procurement]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [sellingPrice]
 *             properties:
 *               sellingPrice:
 *                 type: number
 *                 example: 1100
 *     responses:
 *       200:
 *         description: Price updated
 *       400:
 *         description: Validation error
 *       404:
 *         description: Not found
 */
router.patch(
  "/:id/price",
  protect,
  requireRole("manager"),
  [
    body("sellingPrice")
      .isFloat({ min: 0 })
      .withMessage("Selling price must be a non-negative number"),
  ],
  async (req, res) => {
    if (validate(req, res)) return;
    try {
      const proc = await Procurement.findByIdAndUpdate(
        req.params.id,
        { sellingPrice: req.body.sellingPrice },
        { new: true }
      );
      if (!proc)
        return res
          .status(404)
          .json({ success: false, message: "Procurement record not found" });

      // Sync inventory price
      await Inventory.updateMany(
        { procurement: proc._id },
        { sellingPrice: req.body.sellingPrice }
      );

      await AuditLog.create({
        user: req.user._id,
        action: "UPDATE_PRICE",
        entity: "Procurement",
        entityId: proc._id,
        details: { newPrice: req.body.sellingPrice },
        ip: req.ip,
      });

      res.status(200).json({ success: true, data: proc });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
      );

// GET /procurement/stock/alerts  – Low/out-of-stock alerts

/**
 * @swagger
 * /procurement/stock/alerts:
 *   get:
 *     summary: Get low-stock and out-of-stock alerts
 *     tags: [Procurement]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Array of inventory items with low or zero stock
 */
router.get(
  "/stock/alerts",
  protect,
  requireRole("manager", "agent"),
  async (req, res) => {
    try {
      const items = await Inventory.find({ active: true });
      const alerts = items.filter(
        (i) => i.remainingQty <= 0 || i.remainingQty / i.initialQty < 0.15
      );
      res
        .status(200)
        .json({ success: true, count: alerts.length, data: alerts });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
      );

module.exports = router;

// ============================================================================
// CRUD OPERATIONS - UPDATE, DELETE, RESTORE
// ============================================================================

const mongoose = require("mongoose");
const notificationService = require("../services/notificationService");

// PUT /procurement/:id  – Update a procurement record

/**
 * @swagger
 * /procurement/{id}:
 *   put:
 *     summary: Update a procurement record
 *     description: >
 *       Updates an existing procurement record. Adjusts inventory if tonnage changes.
 *       Creates audit log and sends notifications to managers.
 *       **Managers only.**
 *     tags: [Procurement]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProcurementBody'
 *     responses:
 *       200:
 *         description: Procurement updated successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Procurement not found
 */
router.put(
  "/:id",
  protect,
  requireRole("manager"),
  [
    body("produceName")
      .optional()
      .isAlphanumeric("en-US", { ignore: " " })
      .isLength({ min: 2 })
      .trim(),
    body("produceType")
      .optional()
      .matches(/^[A-Za-z ]+$/)
      .isLength({ min: 2 })
      .trim(),
    body("date").optional().isISO8601(),
    body("time").optional().matches(/^([01]\d|2[0-3]):[0-5]\d$/),
    body("tonnage").optional().isFloat({ min: 100 }),
    body("cost").optional().isFloat({ min: 10000 }),
    body("dealerName")
      .optional()
      .isAlphanumeric("en-US", { ignore: " ." })
      .isLength({ min: 2 })
      .trim(),
    body("branch").optional().isIn(["Maganjo", "Matugga"]),
    body("contact").optional().matches(/^\+?\d[\d\s\-]{7,14}$/),
    body("sellingPrice").optional().isFloat({ min: 0 }),
  ],
  async (req, res) => {
    if (validate(req, res)) return;

    
    try {
      const procurement = await Procurement.findOne({
        _id: req.params.id,
        deleted: { $ne: true }, // Allow records without deleted field or deleted: false
      });

      if (!procurement) {
        return res.status(404).json({
          success: false,
          message: "Procurement not found or has been deleted",
        });
      }

      // Store previous version for undo
      const previousVersion = procurement.toObject();
      delete previousVersion._id;
      delete previousVersion.__v;

      // Check if tonnage changed - adjust inventory
      if (req.body.tonnage && req.body.tonnage !== procurement.tonnage) {
        const inventory = await Inventory.findOne({
          procurement: procurement._id,
          active: true,
        });

        if (!inventory) {
          return res.status(400).json({
            success: false,
            message: "Inventory not found",
          });
        }

        const tonnageDiff = req.body.tonnage - procurement.tonnage;
        const soldQty = inventory.initialQty - inventory.remainingQty;

        // If decreasing tonnage, check if it would go below sold quantity
        if (tonnageDiff < 0 && req.body.tonnage < soldQty) {
          return res.status(400).json({
            success: false,
            message: `Cannot reduce tonnage below ${soldQty} kg (already sold quantity)`,
          });
        }

        // Update inventory
        inventory.initialQty = req.body.tonnage;
        inventory.remainingQty += tonnageDiff;
        await inventory.save();
      }

      // Update procurement fields
      Object.keys(req.body).forEach((key) => {
        if (req.body[key] !== undefined) {
          procurement[key] = req.body[key];
        }
      });

      procurement.previousVersion = previousVersion;
      await procurement.save();

      // Update inventory if other fields changed
      if (req.body.produceName || req.body.produceType || req.body.sellingPrice) {
        await Inventory.updateOne(
          { procurement: procurement._id },
          {
            $set: {
              produceName: procurement.produceName,
              produceType: procurement.produceType,
              sellingPrice: procurement.sellingPrice,
            },
          }
      );
      }

      // Create audit log
      await AuditLog.create({
            user: req.user._id,
            action: "UPDATE_PROCUREMENT",
            entity: "Procurement",
            entityId: procurement._id,
            details: req.body,
            previousState: previousVersion,
            newState: procurement.toObject(),
            ip: req.ip
      });

      // Send notifications to managers (non-blocking)
      notificationService.notifyManagers({
        actor: req.user._id,
        type: notificationService.NotificationType.RECORD_UPDATED,
        entity: "Procurement",
        entityId: procurement._id,
        action: "UPDATED",
        message: `${req.user.name} updated procurement for ${procurement.produceName}`,
        metadata: {
          produceName: procurement.produceName,
          tonnage: procurement.tonnage,
        },
        branch: procurement.branch,
      });

      res.status(200).json({ success: true, data: procurement });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

// DELETE /procurement/:id  – Soft delete a procurement record

/**
 * @swagger
 * /procurement/{id}:
 *   delete:
 *     summary: Delete a procurement record (soft delete)
 *     description: >
 *       Marks a procurement as deleted. Prevents deletion if inventory has been sold.
 *       Creates audit log and sends notifications to managers.
 *       **Managers only.**
 *     tags: [Procurement]
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
 *         description: Procurement deleted successfully
 *       400:
 *         description: Cannot delete - inventory has been sold
 *       404:
 *         description: Procurement not found
 */
router.delete(
  "/:id",
  protect,
  requireRole("manager"),
  async (req, res) => {
    
    try {
      const procurement = await Procurement.findOne({
        _id: req.params.id,
        deleted: { $ne: true }, // Allow records without deleted field or deleted: false
      });

      if (!procurement) {
        return res.status(404).json({
          success: false,
          message: "Procurement not found or already deleted",
        });
      }

      // Check if any inventory has been sold
      const inventory = await Inventory.findOne({
        procurement: procurement._id,
        active: true,
      });

      if (inventory) {
        const soldQty = inventory.initialQty - inventory.remainingQty;
        if (soldQty > 0) {
          return res.status(400).json({
            success: false,
            message: `Cannot delete procurement. ${soldQty} kg has already been sold.`,
          });
        }

        // Deactivate inventory
        inventory.active = false;
        await inventory.save();
      }

      // Soft delete
      procurement.deleted = true;
      procurement.deletedAt = new Date();
      procurement.deletedBy = req.user._id;
      await procurement.save();

      // Create audit log
      await AuditLog.create({
            user: req.user._id,
            action: "DELETE_PROCUREMENT",
            entity: "Procurement",
            entityId: procurement._id,
            details: {
              produceName: procurement.produceName,
              tonnage: procurement.tonnage,
            },
            previousState: procurement.toObject(),
            ip: req.ip,
      });

      // Send notifications to managers (non-blocking)
      notificationService.notifyManagers({
        actor: req.user._id,
        type: notificationService.NotificationType.RECORD_DELETED,
        entity: "Procurement",
        entityId: procurement._id,
        action: "DELETED",
        message: `${req.user.name} deleted procurement for ${procurement.produceName}`,
        metadata: {
          produceName: procurement.produceName,
          tonnage: procurement.tonnage,
        },
        branch: procurement.branch,
      });

      res.status(200).json({
        success: true,
        message: "Procurement deleted successfully",
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

// POST /procurement/:id/restore  – Restore a deleted procurement

/**
 * @swagger
 * /procurement/{id}/restore:
 *   post:
 *     summary: Restore a deleted procurement record
 *     description: >
 *       Restores a soft-deleted procurement and reactivates inventory.
 *       Creates audit log and sends notifications to managers.
 *       **Managers only.**
 *     tags: [Procurement]
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
 *         description: Procurement restored successfully
 *       404:
 *         description: Procurement not found
 */
router.post(
  "/:id/restore",
  protect,
  requireRole("manager"),
  async (req, res) => {
    
    try {
      const procurement = await Procurement.findOne({
        _id: req.params.id,
        deleted: true,
      });

      if (!procurement) {
        return res.status(404).json({
          success: false,
          message: "Deleted procurement not found",
        });
      }

      // Reactivate inventory
      const inventory = await Inventory.findOne({
        procurement: procurement._id,
      });

      if (inventory) {
        inventory.active = true;
        await inventory.save();
      }

      // Restore procurement
      procurement.deleted = false;
      procurement.deletedAt = undefined;
      procurement.deletedBy = undefined;
      await procurement.save();

      // Create audit log
      await AuditLog.create({
            user: req.user._id,
            action: "RESTORE_PROCUREMENT",
            entity: "Procurement",
            entityId: procurement._id,
            details: {
              produceName: procurement.produceName,
              tonnage: procurement.tonnage,
            },
            newState: procurement.toObject(),
            ip: req.ip,
      });

      // Send notifications to managers (non-blocking)
      notificationService.notifyManagers({
        actor: req.user._id,
        type: notificationService.NotificationType.RECORD_RESTORED,
        entity: "Procurement",
        entityId: procurement._id,
        action: "RESTORED",
        message: `${req.user.name} restored procurement for ${procurement.produceName}`,
        metadata: {
          produceName: procurement.produceName,
          tonnage: procurement.tonnage,
        },
        branch: procurement.branch,
      });

      res.status(200).json({
        success: true,
        message: "Procurement restored successfully",
        data: procurement,
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);
