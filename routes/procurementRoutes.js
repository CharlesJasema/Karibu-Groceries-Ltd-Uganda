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
  },
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
    const { branch, produceName, page = 1, limit = 20 } = req.query;
    const filter = {};
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
        "name role",
      );
      if (!doc)
        return res
          .status(404)
          .json({ success: false, message: "Procurement record not found" });
      res.status(200).json({ success: true, data: doc });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },
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
        { new: true },
      );
      if (!proc)
        return res
          .status(404)
          .json({ success: false, message: "Procurement record not found" });

      // Sync inventory price
      await Inventory.updateMany(
        { procurement: proc._id },
        { sellingPrice: req.body.sellingPrice },
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
  },
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
        (i) => i.remainingQty <= 0 || i.remainingQty / i.initialQty < 0.15,
      );
      res
        .status(200)
        .json({ success: true, count: alerts.length, data: alerts });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },
);

module.exports = router;
