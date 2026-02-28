const mongoose = require("mongoose");

const SaleSchema = new mongoose.Schema(
  {
    produceName: { type: String, required: true, trim: true },
    tonnage: { type: Number, required: true, min: 0.1 },
    amountPaid: { type: Number, required: true, min: 10000 }, // min 5 digits
    buyerName: { type: String, required: true, trim: true, minlength: 2 },
    salesAgent: { type: String, required: true, trim: true, minlength: 2 },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    branch: { type: String, enum: ["Maganjo", "Matugga"] },
    procurement: { type: mongoose.Schema.Types.ObjectId, ref: "Procurement" },
    recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

// Indexes for performance
SaleSchema.index({ branch: 1, date: -1 });
SaleSchema.index({ recordedBy: 1 });
SaleSchema.index({ procurement: 1 });
SaleSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Sale", SaleSchema);
