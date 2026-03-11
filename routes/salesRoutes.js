const express = require("express");
const { body, validationResult } = require("express-validator");
const mongoose = require("mongoose");
const Sale = require("../models/sale");
const CreditSale = require("../models/creditSale");
const Inventory = require("../models/inventory");
const Payment = require("../models/payment");
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
  requireRole("agent"),
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
    body("paymentMethod")
      .optional()
      .isIn(["cash", "momo", "bank"])
      .withMessage("Payment method must be cash, momo, or bank"),
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

    try {
      const {
        produceName,
        procurementId,
        tonnage,
        amountPaid,
        paymentMethod = "cash",
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
        });
      } else {
        inventory = await Inventory.findOne({
          produceName: new RegExp(`^${produceName}$`, "i"),
          active: true,
        })
          .sort({ remainingQty: -1 });
      }

      if (!inventory) {
        return res
          .status(400)
          .json({
            success: false,
            message: "No available stock found for this produce",
          });
      }
      if (inventory.remainingQty < tonnage) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock. Only ${inventory.remainingQty} kg available.`,
        });
      }

      inventory.remainingQty -= tonnage;
      await inventory.save();

      const sale = await Sale.create({
        produceName,
        procurement: inventory.procurement,
        tonnage,
        amountPaid,
        paymentMethod,
        buyerName,
        salesAgent,
        date: new Date(date),
        time,
        branch: inventory.branch,
        recordedBy: req.user._id,
      });

      // Automatically create payment record for cash sale
      await Payment.create({
        saleType: "cash",
        saleId: sale._id,
        saleModel: "Sale",
        paymentMethod,
        amount: amountPaid,
        buyerName,
        branch: inventory.branch,
        recordedBy: req.user._id,
        status: "completed",
        notes: "Auto-generated payment record for cash sale",
      });

      await AuditLog.create({
        user: req.user._id,
        action: "CREATE_CASH_SALE",
        entity: "Sale",
        entityId: sale._id,
        details: { produceName, tonnage, amountPaid },
        ip: req.ip,
      });

      res.status(201).json({ success: true, data: sale });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
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
      const { branch, salesAgent, page = 1, limit = 20, showDeleted } = req.query;
      
      // Build filter - by default exclude deleted records
      const filter = {};
      if (showDeleted !== "true") {
        filter.deleted = { $ne: true };
      }
      
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
  }
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
  requireRole("agent"),
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
        });
      } else {
        inventory = await Inventory.findOne({
          produceName: new RegExp(`^${produceName}$`, "i"),
          active: true,
        })
          .sort({ remainingQty: -1 })
          ;
      }

      if (!inventory) {
        return res
          .status(400)
          .json({
            success: false,
            message: "No available stock found for this produce",
          });
      }
      if (inventory.remainingQty < tonnage) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock. Only ${inventory.remainingQty} kg available.`,
        });
      }

      inventory.remainingQty -= tonnage;
      await inventory.save();

      const credit = await CreditSale.create({
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
      });

      await AuditLog.create({
        user: req.user._id,
        action: "CREATE_CREDIT_SALE",
        entity: "CreditSale",
        entityId: credit._id,
        details: { buyerName, produceName, tonnage, amountDue },
        ip: req.ip
      });

      res.status(201).json({ success: true, data: credit });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
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
      const { paid, branch, page = 1, limit = 20, showDeleted } = req.query;
      
      // Build filter - by default exclude deleted records
      const filter = {};
      if (showDeleted !== "true") {
        filter.deleted = { $ne: true };
      }
      
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
  }
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
      const credit = await CreditSale.findOne({
        _id: req.params.id,
        deleted: { $ne: true }
      });
      
      if (!credit)
        return res
          .status(404)
          .json({ success: false, message: "Credit sale not found" });

      // Check if already paid
      if (credit.paid) {
        return res
          .status(400)
          .json({ success: false, message: "Credit sale already marked as paid" });
      }

      // Mark as paid
      credit.paid = true;
      credit.paidAt = new Date();
      await credit.save();

      // Create payment record
      await Payment.create({
        saleType: "credit",
        saleId: credit._id,
        saleModel: "CreditSale",
        paymentMethod: "cash", // Default to cash, can be updated later
        amount: credit.amountDue,
        buyerName: credit.buyerName,
        branch: credit.branch,
        recordedBy: req.user._id,
        status: "completed",
        notes: "Auto-generated payment record when credit marked as paid",
      });

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
  }
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
  }
      );

module.exports = router;

// ============================================================================
// CRUD OPERATIONS - UPDATE, DELETE, RESTORE
// ============================================================================

const notificationService = require("../services/notificationService");

// PUT /sales/cash/:id  – Update a cash sale

/**
 * @swagger
 * /sales/cash/{id}:
 *   put:
 *     summary: Update a cash sale record
 *     description: >
 *       Updates an existing cash sale. Adjusts inventory if tonnage changes.
 *       Creates audit log and sends notifications to managers.
 *     tags: [Sales]
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
 *             $ref: '#/components/schemas/CashSaleBody'
 *     responses:
 *       200:
 *         description: Cash sale updated successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Sale not found
 */
router.put(
  "/cash/:id",
  protect,
  requireRole("manager", "agent"),
  [
    body("produceName")
      .optional()
      .isAlphanumeric("en-US", { ignore: " " })
      .trim(),
    body("tonnage").optional().isFloat({ min: 0.1 }),
    body("amountPaid").optional().isFloat({ min: 10000 }),
    body("paymentMethod").optional().isIn(["cash", "momo", "bank"]),
    body("buyerName")
      .optional()
      .isAlphanumeric("en-US", { ignore: " .&" })
      .isLength({ min: 2 })
      .trim(),
    body("salesAgent")
      .optional()
      .isAlphanumeric("en-US", { ignore: " ." })
      .isLength({ min: 2 })
      .trim(),
    body("date").optional().isISO8601(),
    body("time").optional().matches(/^([01]\d|2[0-3]):[0-5]\d$/),
  ],
  async (req, res) => {
    if (validate(req, res)) return;

    
    try {
      const sale = await Sale.findOne({
        _id: req.params.id,
        deleted: { $ne: true },
      });

      if (!sale) {
        return res.status(404).json({
          success: false,
          message: "Sale not found or has been deleted",
        });
      }

      // Store previous version for undo
      const previousVersion = sale.toObject();
      delete previousVersion._id;
      delete previousVersion.__v;

      // Check if tonnage changed - adjust inventory
      if (req.body.tonnage && req.body.tonnage !== sale.tonnage) {
        const inventory = await Inventory.findOne({
          procurement: sale.procurement,
          active: true,
        });

        if (!inventory) {
          return res.status(400).json({
            success: false,
            message: "Inventory not found",
          });
        }

        const tonnageDiff = req.body.tonnage - sale.tonnage;

        // If increasing tonnage, check if enough stock
        if (tonnageDiff > 0 && inventory.remainingQty < tonnageDiff) {
          return res.status(400).json({
            success: false,
            message: `Insufficient stock. Only ${inventory.remainingQty} kg available.`,
          });
        }

        // Adjust inventory
        inventory.remainingQty -= tonnageDiff;
        await inventory.save();
      }

      // Update sale fields
      Object.keys(req.body).forEach((key) => {
        if (req.body[key] !== undefined) {
          sale[key] = req.body[key];
        }
      });

      sale.previousVersion = previousVersion;
      await sale.save();

      // Create audit log
      await AuditLog.create({
            user: req.user._id,
            action: "UPDATE_CASH_SALE",
            entity: "Sale",
            entityId: sale._id,
            details: req.body,
            previousState: previousVersion,
            newState: sale.toObject(),
            ip: req.ip,
      });

      // Send notifications to managers (non-blocking)
      notificationService.notifyManagers({
        actor: req.user._id,
        type: notificationService.NotificationType.RECORD_UPDATED,
        entity: "Sale",
        entityId: sale._id,
        action: "UPDATED",
        message: `${req.user.name} updated a cash sale for ${sale.produceName}`,
        metadata: { produceName: sale.produceName, tonnage: sale.tonnage },
        branch: sale.branch,
      });

      res.status(200).json({ success: true, data: sale });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

// DELETE /sales/cash/:id  – Soft delete a cash sale

/**
 * @swagger
 * /sales/cash/{id}:
 *   delete:
 *     summary: Delete a cash sale record (soft delete)
 *     description: >
 *       Marks a cash sale as deleted and restores inventory.
 *       Creates audit log and sends notifications to managers.
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
 *         description: Cash sale deleted successfully
 *       404:
 *         description: Sale not found
 */
router.delete(
  "/cash/:id",
  protect,
  requireRole("manager", "agent"),
  async (req, res) => {
    
    try {
      const sale = await Sale.findOne({
        _id: req.params.id,
        deleted: { $ne: true },
      });

      if (!sale) {
        return res.status(404).json({
          success: false,
          message: "Sale not found or already deleted",
        });
      }

      // Restore inventory
      const inventory = await Inventory.findOne({
        procurement: sale.procurement,
        active: true,
      });

      if (inventory) {
        inventory.remainingQty += sale.tonnage;
        await inventory.save();
      }

      // Soft delete
      sale.deleted = true;
      sale.deletedAt = new Date();
      sale.deletedBy = req.user._id;
      await sale.save();

      // Create audit log
      await AuditLog.create({
            user: req.user._id,
            action: "DELETE_CASH_SALE",
            entity: "Sale",
            entityId: sale._id,
            details: { produceName: sale.produceName, tonnage: sale.tonnage },
            previousState: sale.toObject(),
            ip: req.ip,
      });

      // Send notifications to managers (non-blocking)
      notificationService.notifyManagers({
        actor: req.user._id,
        type: notificationService.NotificationType.RECORD_DELETED,
        entity: "Sale",
        entityId: sale._id,
        action: "DELETED",
        message: `${req.user.name} deleted a cash sale for ${sale.produceName}`,
        metadata: { produceName: sale.produceName, tonnage: sale.tonnage },
        branch: sale.branch,
      });

      res.status(200).json({
        success: true,
        message: "Sale deleted successfully",
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

// POST /sales/cash/:id/restore  – Restore a deleted cash sale

/**
 * @swagger
 * /sales/cash/{id}/restore:
 *   post:
 *     summary: Restore a deleted cash sale
 *     description: >
 *       Restores a soft-deleted cash sale and adjusts inventory.
 *       Creates audit log and sends notifications to managers.
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
 *         description: Cash sale restored successfully
 *       404:
 *         description: Sale not found
 */
router.post(
  "/cash/:id/restore",
  protect,
  requireRole("manager", "agent"),
  async (req, res) => {
    
    try {
      const sale = await Sale.findOne({
        _id: req.params.id,
        deleted: true,
      });

      if (!sale) {
        return res.status(404).json({
          success: false,
          message: "Deleted sale not found",
        });
      }

      // Check inventory availability
      const inventory = await Inventory.findOne({
        procurement: sale.procurement,
        active: true,
      });

      if (!inventory) {
        return res.status(400).json({
          success: false,
          message: "Inventory not found",
        });
      }

      if (inventory.remainingQty < sale.tonnage) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock to restore. Only ${inventory.remainingQty} kg available.`,
        });
      }

      // Deduct from inventory again
      inventory.remainingQty -= sale.tonnage;
      await inventory.save();

      // Restore sale
      sale.deleted = false;
      sale.deletedAt = undefined;
      sale.deletedBy = undefined;
      await sale.save();

      // Create audit log
      await AuditLog.create({
            user: req.user._id,
            action: "RESTORE_CASH_SALE",
            entity: "Sale",
            entityId: sale._id,
            details: { produceName: sale.produceName, tonnage: sale.tonnage },
            newState: sale.toObject(),
            ip: req.ip,
      });

      // Send notifications to managers (non-blocking)
      notificationService.notifyManagers({
        actor: req.user._id,
        type: notificationService.NotificationType.RECORD_RESTORED,
        entity: "Sale",
        entityId: sale._id,
        action: "RESTORED",
        message: `${req.user.name} restored a cash sale for ${sale.produceName}`,
        metadata: { produceName: sale.produceName, tonnage: sale.tonnage },
        branch: sale.branch,
      });

      res.status(200).json({
        success: true,
        message: "Sale restored successfully",
        data: sale,
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

// PUT /sales/credit/:id  – Update a credit sale

/**
 * @swagger
 * /sales/credit/{id}:
 *   put:
 *     summary: Update a credit sale record
 *     description: >
 *       Updates an existing credit sale. Adjusts inventory if tonnage changes.
 *       Creates audit log and sends notifications to managers.
 *     tags: [Sales]
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
 *             $ref: '#/components/schemas/CreditSaleBody'
 *     responses:
 *       200:
 *         description: Credit sale updated successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Sale not found
 */
router.put(
  "/credit/:id",
  protect,
  requireRole("manager", "agent"),
  [
    body("buyerName")
      .optional()
      .isAlphanumeric("en-US", { ignore: " .&" })
      .isLength({ min: 2 })
      .trim(),
    body("nin").optional().isLength({ min: 14 }).trim(),
    body("location")
      .optional()
      .isAlphanumeric("en-US", { ignore: " ,-" })
      .isLength({ min: 2 })
      .trim(),
    body("contact").optional().matches(/^\+?\d[\d\s\-]{7,14}$/),
    body("amountDue").optional().isFloat({ min: 10000 }),
    body("salesAgent")
      .optional()
      .isAlphanumeric("en-US", { ignore: " ." })
      .isLength({ min: 2 })
      .trim(),
    body("dueDate").optional().isISO8601(),
    body("produceName")
      .optional()
      .isAlphanumeric("en-US", { ignore: " " })
      .trim(),
    body("produceType").optional().matches(/^[A-Za-z ]+$/).isLength({ min: 2 }),
    body("tonnage").optional().isFloat({ min: 0.1 }),
    body("dispatchDate").optional().isISO8601(),
  ],
  async (req, res) => {
    if (validate(req, res)) return;

    
    try {
      const sale = await CreditSale.findOne({
        _id: req.params.id,
        deleted: { $ne: true },
      });

      if (!sale) {
        return res.status(404).json({
          success: false,
          message: "Credit sale not found or has been deleted",
        });
      }

      // Store previous version
      const previousVersion = sale.toObject();
      delete previousVersion._id;
      delete previousVersion.__v;

      // Check if tonnage changed - adjust inventory
      if (req.body.tonnage && req.body.tonnage !== sale.tonnage) {
        const inventory = await Inventory.findOne({
          procurement: sale.procurement,
          active: true,
        });

        if (!inventory) {
          return res.status(400).json({
            success: false,
            message: "Inventory not found",
          });
        }

        const tonnageDiff = req.body.tonnage - sale.tonnage;

        if (tonnageDiff > 0 && inventory.remainingQty < tonnageDiff) {
          return res.status(400).json({
            success: false,
            message: `Insufficient stock. Only ${inventory.remainingQty} kg available.`,
          });
        }

        inventory.remainingQty -= tonnageDiff;
        await inventory.save();
      }

      // Update sale fields
      Object.keys(req.body).forEach((key) => {
        if (req.body[key] !== undefined) {
          sale[key] = req.body[key];
        }
      });

      sale.previousVersion = previousVersion;
      await sale.save();

      // Create audit log
      await AuditLog.create({
            user: req.user._id,
            action: "UPDATE_CREDIT_SALE",
            entity: "CreditSale",
            entityId: sale._id,
            details: req.body,
            previousState: previousVersion,
            newState: sale.toObject(),
            ip: req.ip,
      });

      // Send notifications to managers (non-blocking)
      notificationService.notifyManagers({
        actor: req.user._id,
        type: notificationService.NotificationType.RECORD_UPDATED,
        entity: "CreditSale",
        entityId: sale._id,
        action: "UPDATED",
        message: `${req.user.name} updated a credit sale for ${sale.buyerName}`,
        metadata: { buyerName: sale.buyerName, amountDue: sale.amountDue },
        branch: sale.branch,
      });

      res.status(200).json({ success: true, data: sale });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

// DELETE /sales/credit/:id  – Soft delete a credit sale

/**
 * @swagger
 * /sales/credit/{id}:
 *   delete:
 *     summary: Delete a credit sale record (soft delete)
 *     description: >
 *       Marks a credit sale as deleted and restores inventory.
 *       Creates audit log and sends notifications to managers.
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
 *         description: Credit sale deleted successfully
 *       404:
 *         description: Sale not found
 */
router.delete(
  "/credit/:id",
  protect,
  requireRole("manager", "agent"),
  async (req, res) => {
    
    try {
      const sale = await CreditSale.findOne({
        _id: req.params.id,
        deleted: { $ne: true },
      });

      if (!sale) {
        return res.status(404).json({
          success: false,
          message: "Credit sale not found or already deleted",
        });
      }

      // Restore inventory
      const inventory = await Inventory.findOne({
        procurement: sale.procurement,
        active: true,
      });

      if (inventory) {
        inventory.remainingQty += sale.tonnage;
        await inventory.save();
      }

      // Soft delete
      sale.deleted = true;
      sale.deletedAt = new Date();
      sale.deletedBy = req.user._id;
      await sale.save();

      // Create audit log
      await AuditLog.create({
            user: req.user._id,
            action: "DELETE_CREDIT_SALE",
            entity: "CreditSale",
            entityId: sale._id,
            details: { buyerName: sale.buyerName, amountDue: sale.amountDue },
            previousState: sale.toObject(),
            ip: req.ip,
      });

      // Send notifications to managers (non-blocking)
      notificationService.notifyManagers({
        actor: req.user._id,
        type: notificationService.NotificationType.RECORD_DELETED,
        entity: "CreditSale",
        entityId: sale._id,
        action: "DELETED",
        message: `${req.user.name} deleted a credit sale for ${sale.buyerName}`,
        metadata: { buyerName: sale.buyerName, amountDue: sale.amountDue },
        branch: sale.branch,
      });

      res.status(200).json({
        success: true,
        message: "Credit sale deleted successfully",
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

// POST /sales/credit/:id/restore  – Restore a deleted credit sale

/**
 * @swagger
 * /sales/credit/{id}/restore:
 *   post:
 *     summary: Restore a deleted credit sale
 *     description: >
 *       Restores a soft-deleted credit sale and adjusts inventory.
 *       Creates audit log and sends notifications to managers.
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
 *         description: Credit sale restored successfully
 *       404:
 *         description: Sale not found
 */
router.post(
  "/credit/:id/restore",
  protect,
  requireRole("manager", "agent"),
  async (req, res) => {
    
    try {
      const sale = await CreditSale.findOne({
        _id: req.params.id,
        deleted: true,
      });

      if (!sale) {
        return res.status(404).json({
          success: false,
          message: "Deleted credit sale not found",
        });
      }

      // Check inventory availability
      const inventory = await Inventory.findOne({
        procurement: sale.procurement,
        active: true,
      });

      if (!inventory) {
        return res.status(400).json({
          success: false,
          message: "Inventory not found",
        });
      }

      if (inventory.remainingQty < sale.tonnage) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock to restore. Only ${inventory.remainingQty} kg available.`,
        });
      }

      // Deduct from inventory again
      inventory.remainingQty -= sale.tonnage;
      await inventory.save();

      // Restore sale
      sale.deleted = false;
      sale.deletedAt = undefined;
      sale.deletedBy = undefined;
      await sale.save();

      // Create audit log
      await AuditLog.create({
            user: req.user._id,
            action: "RESTORE_CREDIT_SALE",
            entity: "CreditSale",
            entityId: sale._id,
            details: { buyerName: sale.buyerName, amountDue: sale.amountDue },
            newState: sale.toObject(),
            ip: req.ip,
      });

      // Send notifications to managers (non-blocking)
      notificationService.notifyManagers({
        actor: req.user._id,
        type: notificationService.NotificationType.RECORD_RESTORED,
        entity: "CreditSale",
        entityId: sale._id,
        action: "RESTORED",
        message: `${req.user.name} restored a credit sale for ${sale.buyerName}`,
        metadata: { buyerName: sale.buyerName, amountDue: sale.amountDue },
        branch: sale.branch,
      });

      res.status(200).json({
        success: true,
        message: "Credit sale restored successfully",
        data: sale,
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

