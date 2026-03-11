const express = require("express");
const { body, validationResult } = require("express-validator");
const Payment = require("../models/payment");
const Sale = require("../models/sale");
const CreditSale = require("../models/creditSale");
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

// POST /payments - Record a payment
/**
 * @swagger
 * /payments:
 *   post:
 *     summary: Record a payment for a sale
 *     description: Record payment with various methods (cash, MoMo, bank, credit)
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [saleId, saleType, paymentMethod, amount, buyerName]
 *             properties:
 *               saleId: { type: string }
 *               saleType: { type: string, enum: [cash, credit] }
 *               paymentMethod: { type: string, enum: [cash, momo, bank, credit] }
 *               amount: { type: number, minimum: 0 }
 *               buyerName: { type: string }
 *               momoDetails: 
 *                 type: object
 *                 properties:
 *                   provider: { type: string, enum: [MTN, Airtel] }
 *                   phoneNumber: { type: string }
 *                   transactionId: { type: string }
 *               bankDetails:
 *                 type: object
 *                 properties:
 *                   bankName: { type: string }
 *                   accountNumber: { type: string }
 *                   transactionRef: { type: string }
 *               notes: { type: string }
 *     responses:
 *       201:
 *         description: Payment recorded successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Sale not found
 */
router.post(
  "/",
  protect,
  requireRole("manager", "agent"),
  [
    body("saleId").isMongoId().withMessage("Valid sale ID required"),
    body("saleType")
      .isIn(["cash", "credit"])
      .withMessage("Sale type must be cash or credit"),
    body("paymentMethod")
      .isIn(["cash", "momo", "bank", "credit"])
      .withMessage("Payment method must be cash, momo, bank, or credit"),
    body("amount")
      .isFloat({ min: 0 })
      .withMessage("Amount must be a positive number"),
    body("buyerName").notEmpty().withMessage("Buyer name is required").trim(),
    body("momoDetails.provider")
      .optional()
      .isIn(["MTN", "Airtel"])
      .withMessage("MoMo provider must be MTN or Airtel"),
    body("momoDetails.phoneNumber")
      .optional()
      .matches(/^\+?\d[\d\s\-]{7,14}$/)
      .withMessage("Invalid phone number"),
    body("notes").optional().trim(),
  ],
  async (req, res) => {
    if (validate(req, res)) return;

    try {
      const {
        saleId,
        saleType,
        paymentMethod,
        amount,
        buyerName,
        momoDetails,
        bankDetails,
        notes,
      } = req.body;

      // Verify sale exists
      let sale;
      let saleModel;
      if (saleType === "cash") {
        sale = await Sale.findById(saleId);
        saleModel = "Sale";
      } else {
        sale = await CreditSale.findById(saleId);
        saleModel = "CreditSale";
      }

      if (!sale) {
        return res.status(404).json({
          success: false,
          message: `${saleType === "cash" ? "Cash" : "Credit"} sale not found`,
        });
      }

      // Create payment record
      const payment = await Payment.create({
        saleType,
        saleId,
        saleModel,
        paymentMethod,
        amount,
        buyerName,
        branch: sale.branch,
        momoDetails: paymentMethod === "momo" ? momoDetails : undefined,
        bankDetails: paymentMethod === "bank" ? bankDetails : undefined,
        recordedBy: req.user._id,
        notes,
        status: "completed",
      });

      // If credit sale, mark as paid
      if (saleType === "credit" && !sale.paid) {
        sale.paid = true;
        sale.paidAt = new Date();
        await sale.save();
      }

      // Audit log
      await AuditLog.create({
        user: req.user._id,
        action: "RECORD_PAYMENT",
        entity: "Payment",
        entityId: payment._id,
        details: {
          saleType,
          paymentMethod,
          amount,
          buyerName,
        },
        ip: req.ip,
      });

      res.status(201).json({ success: true, data: payment });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

// GET /payments - List all payments
/**
 * @swagger
 * /payments:
 *   get:
 *     summary: List all payments
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: paymentMethod
 *         schema:
 *           type: string
 *           enum: [cash, momo, bank, credit]
 *       - in: query
 *         name: branch
 *         schema:
 *           type: string
 *           enum: [Maganjo, Matugga]
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, completed, failed, cancelled]
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
 *         description: List of payments
 */
router.get("/", protect, requireRole("manager", "agent"), async (req, res) => {
  try {
    const {
      paymentMethod,
      branch,
      status,
      page = 1,
      limit = 20,
    } = req.query;

    const filter = {};
    if (paymentMethod) filter.paymentMethod = paymentMethod;
    if (branch) filter.branch = branch;
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Payment.countDocuments(filter);
    const data = await Payment.find(filter)
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

// GET /payments/:id - Get single payment
/**
 * @swagger
 * /payments/{id}:
 *   get:
 *     summary: Get a single payment record
 *     tags: [Payments]
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
 *         description: Payment record
 *       404:
 *         description: Payment not found
 */
router.get(
  "/:id",
  protect,
  requireRole("manager", "agent"),
  async (req, res) => {
    try {
      const payment = await Payment.findById(req.params.id)
        .populate("recordedBy", "name role")
        .populate("saleId");

      if (!payment) {
        return res.status(404).json({
          success: false,
          message: "Payment not found",
        });
      }

      res.status(200).json({ success: true, data: payment });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

// GET /payments/summary/stats - Payment statistics
/**
 * @swagger
 * /payments/summary/stats:
 *   get:
 *     summary: Get payment statistics
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Payment statistics
 */
router.get(
  "/summary/stats",
  protect,
  requireRole("manager", "director"),
  async (req, res) => {
    try {
      const stats = await Payment.aggregate([
        {
          $group: {
            _id: "$paymentMethod",
            totalAmount: { $sum: "$amount" },
            count: { $sum: 1 },
          },
        },
        { $sort: { totalAmount: -1 } },
      ]);

      const byBranch = await Payment.aggregate([
        {
          $group: {
            _id: "$branch",
            totalAmount: { $sum: "$amount" },
            count: { $sum: 1 },
          },
        },
      ]);

      res.status(200).json({
        success: true,
        byMethod: stats,
        byBranch,
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

module.exports = router;
