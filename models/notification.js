const mongoose = require("mongoose");

/**
 * NotificationType Enum
 * Defines all possible notification types in the system
 */
const NotificationType = {
  RECORD_CREATED: "RECORD_CREATED",
  RECORD_UPDATED: "RECORD_UPDATED",
  RECORD_DELETED: "RECORD_DELETED",
  RECORD_RESTORED: "RECORD_RESTORED",
  USER_CREATED: "USER_CREATED",
  USER_UPDATED: "USER_UPDATED",
  PROFILE_UPDATED: "PROFILE_UPDATED",
};

const NotificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: Object.values(NotificationType),
      required: true,
    },
    entity: {
      type: String,
      required: true,
      trim: true,
    }, // "Sale", "CreditSale", "Procurement", "User"
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    action: {
      type: String,
      required: true,
      trim: true,
    }, // "CREATED", "UPDATED", "DELETED", "RESTORED"
    message: {
      type: String,
      required: true,
      trim: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    }, // Additional context data
    read: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
    },
    branch: {
      type: String,
      enum: ["Maganjo", "Matugga"],
    },
  },
  { timestamps: true }
);

// Indexes for efficient queries
NotificationSchema.index({ recipient: 1, read: 1 });
NotificationSchema.index({ recipient: 1, createdAt: -1 });
NotificationSchema.index({ type: 1, createdAt: -1 });
NotificationSchema.index({ branch: 1, createdAt: -1 });
NotificationSchema.index({ read: 1, createdAt: -1 });

/**
 * Helper method to mark notification as read
 */
NotificationSchema.methods.markAsRead = function () {
  this.read = true;
  this.readAt = new Date();
  return this.save();
};

/**
 * Static method to get unread count for a user
 * @param {ObjectId} userId - User ID
 * @returns {Promise<number>} Count of unread notifications
 */
NotificationSchema.statics.getUnreadCount = function (userId) {
  return this.countDocuments({ recipient: userId, read: false });
};

/**
 * Static method to mark all notifications as read for a user
 * @param {ObjectId} userId - User ID
 * @returns {Promise<object>} Update result
 */
NotificationSchema.statics.markAllAsRead = function (userId) {
  return this.updateMany(
    { recipient: userId, read: false },
    { $set: { read: true, readAt: new Date() } }
  );
};

module.exports = mongoose.model("Notification", NotificationSchema);
module.exports.NotificationType = NotificationType;
