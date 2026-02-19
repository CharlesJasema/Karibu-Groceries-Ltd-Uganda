const express = require("express");
const Procurement = require("../models/Procurement");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

const router = express.Router();

/* 
   CREATE PROCUREMENT (Manager Only)
 */
router.post("/", protect, authorize("Manager"), async (req, res) => {
  try {
    const {
      produceName,
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
      !date ||
      !time ||
      !tonnage ||
      !cost ||
      !dealerName ||
      !branch ||
      !contact ||
      !sellingPrice
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (!["Maganjo", "Matugga"].includes(branch)) {
      return res.status(400).json({
        success: false,
        message: "Invalid branch",
      });
    }

    if (!/^\+?\d{10,13}$/.test(contact)) {
      return res.status(400).json({
        success: false,
        message: "Invalid phone number",
      });
    }

    const procurement = await Procurement.create({
      produceName,
      date,
      time,
      tonnage,
      cost,
      dealerName,
      branch,
      contact,
      sellingPrice,
      recordedBy: req.user.id, // Automatically from token
    });

    res.status(201).json({
      success: true,
      message: "Procurement recorded successfully",
      data: procurement,
    });
  } catch (error) {
    console.error("Create Procurement Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

/* 
   GET ALL PROCUREMENT
   Manager → see all
 */
router.get("/", protect, authorize("Manager"), async (req, res) => {
  try {
    const data = await Procurement.find()
      .populate("recordedBy", "name email role")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    console.error("Get Procurement Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

module.exports = router;
