const mongoose = require("mongoose");

const saleSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["cash", "credit"],
      required: true,
    },

    buyerName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
    },

    salesAgentName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
    },

    produceName: {
      type: String,
      required: true,
      trim: true,
    },

    produceType: {
      type: String,
      trim: true,
    },

    tonnage: {
      type: Number,
      required: true,
      min: 1,
    },

    // Credit fields
    amountDue: Number,
    dueDate: String,
    dispatchDate: String,

    // Cash fields
    amountPaid: Number,
    date: String,
    time: String,

    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Sale", saleSchema);
