const express = require("express");
const Procurement = require("../models/Procurement");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

const router = express.Router();

/* 
   CREATE PROCUREMENT (Manager Only)
 */
router.post("/", protect, authorize("manager"), async (req, res) => {
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

    /* VALIDATIONS */

    if (
      !produceName ||
      !produceType ||
      !date ||
      !time ||
      !tonnage ||
      !cost ||
      !dealerName ||
      !branch ||
      !contact ||
      !sellingPrice
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Produce Type: alphabetic only, min 2 chars
    if (!/^[A-Za-z]{2,}$/.test(produceType)) {
      return res.status(400).json({ message: "Invalid produce type" });
    }

    // Tonnage: numeric, minimum 3 digits
    if (!/^\d{3,}$/.test(String(tonnage))) {
      return res
        .status(400)
        .json({ message: "Tonnage must be at least 3 digits" });
    }

    // Cost: numeric, minimum 5 digits
    if (!/^\d{5,}$/.test(String(cost))) {
      return res
        .status(400)
        .json({ message: "Cost must be at least 5 digits" });
    }

    // Dealer name: alphanumeric, min 2 chars
    if (!/^[A-Za-z0-9 ]{2,}$/.test(dealerName)) {
      return res.status(400).json({ message: "Invalid dealer name" });
    }

    // Branch validation
    if (!["Maganjo", "Matugga"].includes(branch)) {
      return res.status(400).json({ message: "Invalid branch" });
    }

    // Phone validation (Ugandan format simple check)
    if (!/^\+?\d{10,13}$/.test(contact)) {
      return res.status(400).json({ message: "Invalid phone number" });
    }

    const procurement = await Procurement.create({
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
      recordedBy: req.user.id,
    });

    res.status(201).json(procurement);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

/* 
   GET ALL PROCUREMENT
 */
router.get("/", protect, async (req, res) => {
  try {
    const data = await Procurement.find();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
