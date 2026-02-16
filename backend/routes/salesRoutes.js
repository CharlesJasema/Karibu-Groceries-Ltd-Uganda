const express = require("express");
const Sale = require("../models/Sale");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

const router = express.Router();

/* 
   CASH SALES (Agents Only)
 */
router.post("/cash", protect, authorize("agent"), async (req, res) => {
  try {
    const {
      produceName,
      tonnage,
      amountPaid,
      buyerName,
      salesAgentName,
      date,
      time,
    } = req.body;

    if (
      !produceName ||
      !tonnage ||
      !amountPaid ||
      !buyerName ||
      !salesAgentName ||
      !date ||
      !time
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Buyer name validation
    if (!/^[A-Za-z0-9 ]{2,}$/.test(buyerName)) {
      return res.status(400).json({ message: "Invalid buyer name" });
    }

    // Amount Paid min 5 digits
    if (!/^\d{5,}$/.test(String(amountPaid))) {
      return res
        .status(400)
        .json({ message: "Amount must be at least 5 digits" });
    }

    const sale = await Sale.create({
      produceName,
      tonnage,
      amountPaid,
      buyerName,
      salesAgentName,
      date,
      time,
      type: "cash",
      recordedBy: req.user.id,
    });

    res.status(201).json(sale);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

/* 
   CREDIT SALES (Agents Only)
 */
router.post("/credit", protect, authorize("agent"), async (req, res) => {
  try {
    const {
      buyerName,
      nin,
      location,
      contacts,
      amountDue,
      salesAgentName,
      dueDate,
      produceName,
      produceType,
      tonnage,
      dispatchDate,
    } = req.body;

    if (
      !buyerName ||
      !nin ||
      !location ||
      !contacts ||
      !amountDue ||
      !salesAgentName ||
      !dueDate ||
      !produceName ||
      !produceType ||
      !tonnage ||
      !dispatchDate
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Buyer name validation
    if (!/^[A-Za-z0-9 ]{2,}$/.test(buyerName)) {
      return res.status(400).json({ message: "Invalid buyer name" });
    }

    // Simple NIN validation (Uganda NIN format example)
    if (!/^[A-Z0-9]{10,14}$/.test(nin)) {
      return res.status(400).json({ message: "Invalid NIN format" });
    }

    // Phone validation
    if (!/^\+?\d{10,13}$/.test(contacts)) {
      return res.status(400).json({ message: "Invalid phone number" });
    }

    // Amount Due min 5 digits
    if (!/^\d{5,}$/.test(String(amountDue))) {
      return res
        .status(400)
        .json({ message: "Amount must be at least 5 digits" });
    }

    const sale = await Sale.create({
      buyerName,
      nin,
      location,
      contacts,
      amountDue,
      salesAgentName,
      dueDate,
      produceName,
      produceType,
      tonnage,
      dispatchDate,
      type: "credit",
      recordedBy: req.user.id,
    });

    res.status(201).json(sale);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

/* 
   GET ALL SALES
 */
router.get("/", protect, async (req, res) => {
  try {
    const sales = await Sale.find();
    res.status(200).json(sales);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
