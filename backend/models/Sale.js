const mongoose = require("mongoose");

const saleSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["cash", "credit"],
      required: true,
    },

    /* Common Fields */
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

    /* Cash Sale Fields */
    amountPaid: {
      type: Number,
      min: 10000,
    },

    date: {
      type: String,
    },

    time: {
      type: String,
    },

    /* Credit Sale Fields */
    amountDue: {
      type: Number,
      min: 10000,
    },

    nin: {
      type: String,
    },

    location: {
      type: String,
      minlength: 2,
    },

    contacts: {
      type: String,
    },

    dueDate: {
      type: String,
    },

    dispatchDate: {
      type: String,
    },

    /* Who Recorded It */
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

/* Index for faster filtering */
saleSchema.index({ type: 1, buyerName: 1 });

module.exports = mongoose.model("Sale", saleSchema);
