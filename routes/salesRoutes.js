const express = require("express");
const { body, validationResult } = require("express-validator");
const mongoose = require("mongoose");
const Sale = require("../models/sale");
const CreditSale = require("../models/creditSale");
const Inventory = require("../models/inventory");
const AuditLog = require("../models/auditLog");
const { protect } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");

const router = express.Router();

// Helper
const validate = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res
      .status(400)
      .json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    return true;
  }
  return false;
};

// Shared validation
const agentNameRule = body("salesAgent")
  .isAlphanumeric("en-US", { ignore: " ." })
  .withMessage("Sales agent name must be alpha-numeric")
  .isLength({ min: 2 })
  .withMessage("Sales agent name must be at least 2 characters")
  .trim();

const buyerNameRule = body("buyerName")
  .isAlphanumeric("en-US", { ignore: " .&" })
  .withMessage("Buyer name must be alpha-numeric")
  .isLength({ min: 2 })
  .withMessage("Buyer name must be at least 2 characters")
  .trim();

// POST /sales/cash  – Record a cash sale (Manager or Agent)

/**
 * @swagger
 * /sales/cash:
 *   post:
 *     summary: Record a cash (immediate payment) sale
 *     description: >
 *       Records a cash sale and decrements the corresponding inventory stock.
 *       **Managers and Sales Agents** can record cash sales.
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CashSaleBody'
 *     responses:
 *       201:
 *         description: Cash sale recorded successfully
 *       400:
 *         description: Validation error or insufficient stock
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Access denied
 */
router.post(
  "/cash",
  protect,
  requireRole("manager", "agent"),
  [
    body("produceName")
      .isAlphanumeric("en-US", { ignore: " " })
      .trim()
      .withMessage("Produce name must be alpha-numeric"),
    body("tonnage")
      .isFloat({ min: 0.1 })
      .withMessage("Tonnage must be a positive number"),
    body("amountPaid")
      .isFloat({ min: 10000 })
      .withMessage("Amount paid must be at least 10,000 UgX (5 digits)"),
    buyerNameRule,
    agentNameRule,
    body("date")
      .notEmpty()
      .isISO8601()
      .withMessage("Valid date required (YYYY-MM-DD)"),
    body("time")
      .notEmpty()
      .matches(/^([01]\d|2[0-3]):[0-5]\d$/)
      .withMessage("Time must be HH:MM"),
    body("procurementId")
      .optional()
      .isMongoId()
      .withMessage("Invalid procurement ID"),
  ],
  async (req, res) => {
    if (validate(req, res)) return;

    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const {
        produceName,
        procurementId,
        tonnage,
        amountPaid,
        buyerName,
        salesAgent,
        date,
        time,
      } = req.body;

      // Deduct from inventory
      let inventory;
      if (procurementId) {
        inventory = await Inventory.findOne({
          procurement: procurementId,
          active: true,
        }).session(session);
      } else {
        inventory = await Inventory.findOne({
          produceName: new RegExp(`^${produceName}$`, "i"),
          active: true,
        })
          .sort({ remainingQty: -1 })
          .session(session);
      }

      if (!inventory) {
        await session.abortTransaction();
        return res
          .status(400)
          .json({
            success: false,
            message: "No available stock found for this produce",
          });
      }
      if (inventory.remainingQty < tonnage) {
        await session.abortTransaction();
        return res.status(400).json({
          success: false,
          message: `Insufficient stock. Only ${inventory.remainingQty} kg available.`,
        });
      }

      inventory.remainingQty -= tonnage;
      await inventory.save({ session });

      const sale = await Sale.create(
        [
          {
            produceName,
            procurement: inventory.procurement,
            tonnage,
            amountPaid,
            buyerName,
            salesAgent,
            date: new Date(date),
            time,
            branch: inventory.branch,
            recordedBy: req.user._id,
          },
        ],
        { session },
      );

      await AuditLog.create(
        [
          {
            user: req.user._id,
            action: "CREATE_CASH_SALE",
            entity: "Sale",
            entityId: sale[0]._id,
            details: { produceName, tonnage, amountPaid },
            ip: req.ip,
          },
        ],
        { session },
      );

      await session.commitTransaction();
      res.status(201).json({ success: true, data: sale[0] });
    } catch (err) {
      await session.abortTransaction();
      res.status(500).json({ success: false, message: err.message });
    } finally {
      session.endSession();
    }
  },
);

// GET /sales/cash  – List all cash sales

/**
 * @swagger
 * /sales/cash:
 *   get:
 *     summary: List all cash sales
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: branch
 *         schema:
 *           type: string
 *           enum: [Maganjo, Matugga]
 *       - in: query
 *         name: salesAgent
 *         schema:
 *           type: string
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
 *         description: List of cash sales
 */
router.get(
  "/cash",
  protect,
  requireRole("manager", "agent"),
  async (req, res) => {
    try {
      const { branch, salesAgent, page = 1, limit = 20 } = req.query;
      const filter = {};
      if (branch) filter.branch = branch;
      if (salesAgent) filter.salesAgent = new RegExp(salesAgent, "i");

      const skip = (parseInt(page) - 1) * parseInt(limit);
      const total = await Sale.countDocuments(filter);
      const data = await Sale.find(filter)
        .populate("recordedBy", "name role")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      res
        .status(200)
        .json({
          success: true,
          total,
          page: parseInt(page),
          count: data.length,
          data,
        });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },
);

// POST /sales/credit  – Record a credit/deferred sale (Manager or Agent)

/**
 * @swagger
 * /sales/credit:
 *   post:
 *     summary: Record a credit / deferred-payment sale
 *     description: >
 *       Records a sale where payment is deferred for a trusted buyer.
 *       Decrements inventory immediately on dispatch.
 *       **Managers and Sales Agents** can record credit sales.
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreditSaleBody'
 *     responses:
 *       201:
 *         description: Credit sale recorded successfully
 *       400:
 *         description: Validation error or insufficient stock
 *       401:
 *         description: Not authenticated
 */
router.post(
  "/credit",
  protect,
  requireRole("manager", "agent"),
  [
    buyerNameRule,
    body("nin")
      .notEmpty()
      .withMessage("NIN is required")
      .isLength({ min: 14 })
      .withMessage("NIN must be at least 14 characters")
      .trim(),
    body("location")
      .isAlphanumeric("en-US", { ignore: " ,-" })
      .withMessage("Location must be alpha-numeric")
      .isLength({ min: 2 })
      .withMessage("Location must be at least 2 characters")
      .trim(),
    body("contact")
      .matches(/^\+?\d[\d\s\-]{7,14}$/)
      .withMessage("Contact must be a valid phone number"),
    body("amountDue")
      .isFloat({ min: 10000 })
      .withMessage("Amount due must be at least 10,000 UgX (5 digits)"),
    agentNameRule,
    body("dueDate")
      .notEmpty()
      .isISO8601()
      .withMessage("Valid due date required"),
    body("produceName")
      .isAlphanumeric("en-US", { ignore: " " })
      .trim()
      .withMessage("Produce name must be alpha-numeric"),
    body("produceType")
      .matches(/^[A-Za-z ]+$/)
      .withMessage("Produce type must be alphabetic")
      .isLength({ min: 2 })
      .withMessage("Produce type must be at least 2 characters"),
    body("tonnage")
      .isFloat({ min: 0.1 })
      .withMessage("Tonnage must be a positive number"),
    body("dispatchDate")
      .notEmpty()
      .isISO8601()
      .withMessage("Valid dispatch date required"),
    body("procurementId").optional().isMongoId(),
  ],
  async (req, res) => {
    if (validate(req, res)) return;

    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const {
        buyerName,
        nin,
        location,
        contact,
        amountDue,
        salesAgent,
        dueDate,
        produceName,
        produceType,
        tonnage,
        dispatchDate,
        procurementId,
      } = req.body;

      // Locate inventory
      let inventory;
      if (procurementId) {
        inventory = await Inventory.findOne({
          procurement: procurementId,
          active: true,
        }).session(session);
      } else {
        inventory = await Inventory.findOne({
          produceName: new RegExp(`^${produceName}$`, "i"),
          active: true,
        })
          .sort({ remainingQty: -1 })
          .session(session);
      }

      if (!inventory) {
        await session.abortTransaction();
        return res
          .status(400)
          .json({
            success: false,
            message: "No available stock found for this produce",
          });
      }
      if (inventory.remainingQty < tonnage) {
        await session.abortTransaction();
        return res.status(400).json({
          success: false,
          message: `Insufficient stock. Only ${inventory.remainingQty} kg available.`,
        });
      }

      inventory.remainingQty -= tonnage;
      await inventory.save({ session });

      const credit = await CreditSale.create(
        [
          {
            buyerName,
            nin,
            location,
            contact,
            amountDue,
            salesAgent,
            dueDate: new Date(dueDate),
            produceName,
            produceType,
            tonnage,
            dispatchDate: new Date(dispatchDate),
            branch: inventory.branch,
            procurement: inventory.procurement,
            recordedBy: req.user._id,
          },
        ],
        { session },
      );

      await AuditLog.create(
        [
          {
            user: req.user._id,
            action: "CREATE_CREDIT_SALE",
            entity: "CreditSale",
            entityId: credit[0]._id,
            details: { buyerName, produceName, amountDue },
            ip: req.ip,
          },
        ],
        { session },
      );

      await session.commitTransaction();
      res.status(201).json({ success: true, data: credit[0] });
    } catch (err) {
      await session.abortTransaction();
      res.status(500).json({ success: false, message: err.message });
    } finally {
      session.endSession();
    }
  },
);

// GET /sales/credit  – List credit sales

/**
 * @swagger
 * /sales/credit:
 *   get:
 *     summary: List all credit / deferred sales
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: paid
 *         schema:
 *           type: boolean
 *         description: Filter by payment status
 *       - in: query
 *         name: branch
 *         schema:
 *           type: string
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
 *         description: List of credit sales
 */
router.get(
  "/credit",
  protect,
  requireRole("manager", "agent"),
  async (req, res) => {
    try {
      const { paid, branch, page = 1, limit = 20 } = req.query;
      const filter = {};
      if (paid !== undefined) filter.paid = paid === "true";
      if (branch) filter.branch = branch;

      const skip = (parseInt(page) - 1) * parseInt(limit);
      const total = await CreditSale.countDocuments(filter);
      const data = await CreditSale.find(filter)
        .populate("recordedBy", "name role")
        .sort({ dueDate: 1 })
        .skip(skip)
        .limit(parseInt(limit));

      res
        .status(200)
        .json({
          success: true,
          total,
          page: parseInt(page),
          count: data.length,
          data,
        });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },
);

// PATCH /sales/credit/:id/paid  – Mark credit as paid

/**
 * @swagger
 * /sales/credit/{id}/paid:
 *   patch:
 *     summary: Mark a credit sale as paid
 *     tags: [Sales]
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
 *         description: Credit sale marked as paid
 *       404:
 *         description: Credit sale not found
 */
router.patch(
  "/credit/:id/paid",
  protect,
  requireRole("manager", "agent"),
  async (req, res) => {
    try {
      const credit = await CreditSale.findByIdAndUpdate(
        req.params.id,
        { paid: true, paidAt: new Date() },
        { new: true },
      );
      if (!credit)
        return res
          .status(404)
          .json({ success: false, message: "Credit sale not found" });

      await AuditLog.create({
        user: req.user._id,
        action: "MARK_CREDIT_PAID",
        entity: "CreditSale",
        entityId: credit._id,
        ip: req.ip,
      });

      res.status(200).json({ success: true, data: credit });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },
);

// GET /sales/inventory  – All inventory / stock levels

/**
 * @swagger
 * /sales/inventory:
 *   get:
 *     summary: Get all current stock levels
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Inventory levels with status (in-stock / low-stock / out-of-stock)
 */
router.get(
  "/inventory",
  protect,
  requireRole("manager", "agent"),
  async (req, res) => {
    try {
      const items = await Inventory.find({ active: true })
        .populate("procurement", "dealerName contact")
        .sort({ remainingQty: 1 });
      res.status(200).json({ success: true, count: items.length, data: items });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },
);

module.exports = router;
