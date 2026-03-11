const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema(
  {
    // Reference to sale (cash or credit)
    saleType: {
      type: String,
      enum: ["cash", "credit"],
      required: true,
    },
    saleId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "saleModel",
      required: true,
    },
    saleModel: {
      type: String,
      enum: ["Sale", "CreditSale"],
      required: true,
    },
    
    // Payment details
    paymentMethod: {
      type: String,
      enum: ["cash", "momo", "bank", "credit"],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    
    // Method-specific details
    momoDetails: {
      provider: { type: String, enum: ["MTN", "Airtel", ""] }, // MTN or Airtel
      phoneNumber: { type: String },
      transactionId: { type: String },
    },
    bankDetails: {
      bankName: { type: String },
      accountNumber: { type: String },
      transactionRef: { type: String },
    },
    
    // Transaction info
    paymentDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "cancelled"],
      default: "completed",
    },
    
    // Buyer/Customer info
    buyerName: { type: String, required: true },
    branch: {
      type: String,
      enum: ["Maganjo", "Matugga"],
      required: true,
    },
    
    // Audit
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    notes: { type: String },
  },
  { timestamps: true }
);

// Indexes
PaymentSchema.index({ saleId: 1, saleType: 1 });
PaymentSchema.index({ paymentMethod: 1 });
PaymentSchema.index({ status: 1 });
PaymentSchema.index({ branch: 1 });
PaymentSchema.index({ paymentDate: -1 });
PaymentSchema.index({ "momoDetails.transactionId": 1 });
PaymentSchema.index({ "bankDetails.transactionRef": 1 });

module.exports = mongoose.model("Payment", PaymentSchema);
