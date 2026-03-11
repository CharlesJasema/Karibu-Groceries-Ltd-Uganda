const mongoose = require("mongoose");

const CreditSaleSchema = new mongoose.Schema(
  {
    buyerName: { type: String, required: true, trim: true, minlength: 2 },
    nin: { type: String, required: true, trim: true }, // National ID
    location: { type: String, required: true, trim: true, minlength: 2 },
    contact: { type: String, required: true },
    amountDue: { type: Number, required: true, min: 10000 }, // min 5 digits
    salesAgent: { type: String, required: true, trim: true, minlength: 2 },
    dueDate: { type: Date, required: true },
    produceName: { type: String, required: true, trim: true },
    produceType: { type: String, required: true, trim: true, minlength: 2 },
    tonnage: { type: Number, required: true, min: 0.1 },
    dispatchDate: { type: Date, required: true },
    branch: { type: String, enum: ["Maganjo", "Matugga"] },
    procurement: { type: mongoose.Schema.Types.ObjectId, ref: "Procurement" },
    paid: { type: Boolean, default: false },
    paidAt: { type: Date },
    recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    deleted: { type: Boolean, default: false }, // NEW FIELD
    deletedAt: { type: Date }, // NEW FIELD
    deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // NEW FIELD
    previousVersion: { type: mongoose.Schema.Types.Mixed }, // NEW FIELD
  },
  { timestamps: true },
);

// Indexes for performance
CreditSaleSchema.index({ branch: 1, paid: 1 });
CreditSaleSchema.index({ dueDate: 1, paid: 1 });
CreditSaleSchema.index({ nin: 1 });
CreditSaleSchema.index({ recordedBy: 1 });
CreditSaleSchema.index({ createdAt: -1 });
CreditSaleSchema.index({ deleted: 1 }); // NEW INDEX

module.exports = mongoose.model("CreditSale", CreditSaleSchema);
