const express = require("express");
const Sale = require("../models/Sale");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

const router = express.Router();

/* 
   CREATE CASH SALE (SalesAgent Only)
 */
router.post("/cash", protect, authorize("SalesAgent"), async (req, res) => {
  try {
    const { produceName, tonnage, amountPaid, buyerName, date, time } =
      req.body;

    if (
      !produceName ||
      !tonnage ||
      !amountPaid ||
      !buyerName ||
      !date ||
      !time
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (!/^[A-Za-z0-9 ]{2,}$/.test(buyerName)) {
      return res.status(400).json({
        success: false,
        message: "Invalid buyer name",
      });
    }

    if (!/^\d{5,}$/.test(String(amountPaid))) {
      return res.status(400).json({
        success: false,
        message: "Amount must be at least 5 digits",
      });
    }

    const sale = await Sale.create({
      produceName,
      tonnage,
      amountPaid,
      buyerName,
      salesAgentName: req.user.role === "SalesAgent" ? req.user.id : null,
      date,
      time,
      type: "cash",
      recordedBy: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: "Cash sale recorded successfully",
      data: sale,
    });
  } catch (error) {
    console.error("Cash Sale Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

/* 
   CREATE CREDIT SALE (SalesAgent Only)
 */
router.post("/credit", protect, authorize("SalesAgent"), async (req, res) => {
  try {
    const {
      buyerName,
      amountDue,
      dueDate,
      produceName,
      tonnage,
      dispatchDate,
    } = req.body;

    if (
      !buyerName ||
      !amountDue ||
      !dueDate ||
      !produceName ||
      !tonnage ||
      !dispatchDate
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (!/^[A-Za-z0-9 ]{2,}$/.test(buyerName)) {
      return res.status(400).json({
        success: false,
        message: "Invalid buyer name",
      });
    }

    if (!/^\d{5,}$/.test(String(amountDue))) {
      return res.status(400).json({
        success: false,
        message: "Amount must be at least 5 digits",
      });
    }

    const sale = await Sale.create({
      buyerName,
      amountDue,
      dueDate,
      produceName,
      tonnage,
      dispatchDate,
      type: "credit",
      recordedBy: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: "Credit sale recorded successfully",
      data: sale,
    });
  } catch (error) {
    console.error("Credit Sale Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

/* 
   GET ALL SALES
   Manager → See All
   SalesAgent → See Only Their Sales
 */
router.get(
  "/",
  protect,
  authorize("Manager", "SalesAgent"),
  async (req, res) => {
    try {
      let query = {};

      // If SalesAgent → only show their own sales
      if (req.user.role === "SalesAgent") {
        query.recordedBy = req.user.id;
      }

      const sales = await Sale.find(query)
        .populate("recordedBy", "name email role")
        .sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        count: sales.length,
        data: sales,
      });
    } catch (error) {
      console.error("Get Sales Error:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  },
);

module.exports = router;
