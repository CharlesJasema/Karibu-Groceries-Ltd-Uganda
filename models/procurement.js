const mongoose = require("mongoose");

const ProcurementSchema = new mongoose.Schema(
  {
    produceName: { type: String, required: true, trim: true },
    produceType: { type: String, required: true, trim: true, minlength: 2 },
    date: { type: Date, required: true },
    time: { type: String, required: true }, // stored as "HH:MM"
    tonnage: { type: Number, required: true, min: 100 }, // minimum 3-digit value
    cost: { type: Number, required: true, min: 10000 }, // minimum 5-digit value
    dealerName: { type: String, required: true, trim: true, minlength: 2 },
    branch: { type: String, enum: ["Maganjo", "Matugga"], required: true },
    contact: { type: String, required: true },
    sellingPrice: { type: Number, required: true, min: 0 },
    recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    deleted: { type: Boolean, default: false }, // NEW FIELD
    deletedAt: { type: Date }, // NEW FIELD
    deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // NEW FIELD
    previousVersion: { type: mongoose.Schema.Types.Mixed }, // NEW FIELD
  },
  { timestamps: true },
);

// Indexes for performance
ProcurementSchema.index({ branch: 1, date: -1 });
ProcurementSchema.index({ produceName: 1, branch: 1 });
ProcurementSchema.index({ recordedBy: 1 });
ProcurementSchema.index({ createdAt: -1 });
ProcurementSchema.index({ deleted: 1 }); // NEW INDEX

module.exports = mongoose.model("Procurement", ProcurementSchema);
