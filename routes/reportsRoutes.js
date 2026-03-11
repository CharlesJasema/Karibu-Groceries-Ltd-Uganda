const express = require("express");
const Sale = require("../models/sale");
const CreditSale = require("../models/creditSale");
const Inventory = require("../models/inventory");
const Procurement = require("../models/procurement");
const { protect } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");

const router = express.Router();

// GET /reports/summary  – Aggregated totals (Director or Manager)

/**
 * @swagger
 * /reports/summary:
 *   get:
 *     summary: Aggregated sales summary (Director view)
 *     description: >
 *       Returns total revenue, quantity sold, pending credit,
 *       and a breakdown by branch and by produce.
 *       Available to **Directors and Managers**.
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sales summary object
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:         { type: boolean }
 *                 totalRevenue:    { type: number }
 *                 totalQtySold:    { type: number }
 *                 pendingCredit:   { type: number }
 *                 salesByBranch:   { type: array }
 *                 topProduce:      { type: array }
 *                 recentSales:     { type: array }
 *       403:
 *         description: Access denied
 */
router.get(
  "/summary",
  protect,
  requireRole("director"),
  async (req, res) => {
    try {
      // Filter to exclude deleted records
      const deletedFilter = { deleted: { $ne: true } };
      
      const [salesAgg, creditAgg, topProduce, recentSales] = await Promise.all([
        // Revenue + qty by branch
        Sale.aggregate([
          { $match: deletedFilter },
          {
            $group: {
              _id: "$branch",
              totalRevenue: { $sum: "$amountPaid" },
              totalQty: { $sum: "$tonnage" },
              count: { $sum: 1 },
            },
          },
          { $sort: { totalRevenue: -1 } },
        ]),

        // Outstanding credit by paid status
        CreditSale.aggregate([
          { $match: deletedFilter },
          {
            $group: {
              _id: "$paid",
              totalAmount: { $sum: "$amountDue" },
              count: { $sum: 1 },
            },
          },
        ]),

        // Top 5 produce by revenue
        Sale.aggregate([
          { $match: deletedFilter },
          {
            $group: {
              _id: "$produceName",
              revenue: { $sum: "$amountPaid" },
              qty: { $sum: "$tonnage" },
            },
          },
          { $sort: { revenue: -1 } },
          { $limit: 5 },
        ]),

        Sale.find(deletedFilter)
          .populate('recordedBy', 'name role')
          .sort({ createdAt: -1 })
          .limit(10)
          .lean(),
      ]);

      // Totals
      const totalRevenue = salesAgg.reduce((s, b) => s + b.totalRevenue, 0);
      const totalQtySold = salesAgg.reduce((s, b) => s + b.totalQty, 0);
      const pendingCredit =
        creditAgg.find((c) => c._id === false)?.totalAmount || 0;

      res.status(200).json({
        success: true,
        totalRevenue,
        totalQtySold,
        pendingCredit,
        salesByBranch: salesAgg,
        creditSummary: creditAgg,
        topProduce,
        recentSales,
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },
);

// GET /reports/branch/:branch  – Branch-level report (Manager)

/**
 * @swagger
 * /reports/branch/{branch}:
 *   get:
 *     summary: Sales report for a specific branch
 *     description: Returns sales breakdown for the given branch. **Managers only.**
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: branch
 *         required: true
 *         schema:
 *           type: string
 *           enum: [Maganjo, Matugga]
 *     responses:
 *       200:
 *         description: Branch sales report
 *       403:
 *         description: Access denied
 */
router.get(
  "/branch/:branch",
  protect,
  requireRole("manager", "agent", "director"),
  async (req, res) => {
    try {
      const { branch } = req.params;
      
      // By default, exclude deleted records
      const filter = { branch, deleted: { $ne: true } };
      
      const [cashSales, creditSales, stock] = await Promise.all([
        Sale.find(filter)
          .populate('recordedBy', 'name role')
          .sort({ createdAt: -1 }),
        CreditSale.find(filter)
          .populate('recordedBy', 'name role')
          .sort({ dueDate: 1 }),
        Inventory.find({ branch, active: true }),
      ]);

      const totalRevenue = cashSales.reduce((s, x) => s + x.amountPaid, 0);
      const totalQtySold = cashSales.reduce((s, x) => s + x.tonnage, 0);
      const pendingCredit = creditSales
        .filter((c) => !c.paid)
        .reduce((s, x) => s + x.amountDue, 0);

      res.status(200).json({
        success: true,
        branch,
        totalRevenue,
        totalQtySold,
        pendingCredit,
        cashSalesCount: cashSales.length,
        creditSalesCount: creditSales.length,
        cashSales,
        creditSales,
        inventory: stock,
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },
);

// GET /reports/stock  – Full stock report

/**
 * @swagger
 * /reports/stock:
 *   get:
 *     summary: Full stock / inventory report
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Stock levels grouped by status
 */
router.get(
  "/stock",
  protect,
  requireRole("manager", "director"),
  async (req, res) => {
    try {
      const items = await Inventory.find({ active: true })
        .populate("procurement", "dealerName cost date")
        .sort({ remainingQty: 1 });

      const grouped = {
        outOfStock: items.filter((i) => i.remainingQty <= 0),
        lowStock: items.filter(
          (i) => i.remainingQty > 0 && i.remainingQty / i.initialQty < 0.15,
        ),
        inStock: items.filter((i) => i.remainingQty / i.initialQty >= 0.15),
      };

      res.status(200).json({
        success: true,
        total: items.length,
        alerts: grouped.outOfStock.length + grouped.lowStock.length,
        ...grouped,
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },
);

module.exports = router;
