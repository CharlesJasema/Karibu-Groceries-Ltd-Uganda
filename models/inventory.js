const mongoose = require("mongoose");

const InventorySchema = new mongoose.Schema(
  {
    procurement: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Procurement",
      required: true,
    },
    produceName: { type: String, required: true },
    produceType: { type: String, required: true },
    branch: { type: String, enum: ["Maganjo", "Matugga"], required: true },
    initialQty: { type: Number, required: true }, // original tonnage
    remainingQty: { type: Number, required: true }, // decremented on each sale
    sellingPrice: { type: Number, required: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
);

// Indexes for performance
InventorySchema.index({ branch: 1, active: 1 });
InventorySchema.index({ produceName: 1, branch: 1 });
InventorySchema.index({ procurement: 1 });
InventorySchema.index({ remainingQty: 1 });

// Virtual: stock percentage remaining
InventorySchema.virtual("stockPercent").get(function () {
  return this.initialQty > 0
    ? Math.round((this.remainingQty / this.initialQty) * 100)
    : 0;
});

// Virtual: status label
InventorySchema.virtual("status").get(function () {
  const pct = this.stockPercent;
  if (this.remainingQty <= 0) return "out-of-stock";
  if (pct < 15) return "low-stock";
  return "in-stock";
});

InventorySchema.set("toJSON", { virtuals: true });
InventorySchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Inventory", InventorySchema);
