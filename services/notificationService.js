const Notification = require("../models/notification");
const { NotificationType } = require("../models/notification");
const User = require("../models/user");
const logger = require("../config/logger");

/**
 * Notification Service
 * Handles creation and management of system notifications
 */

/**
 * Create a new notification
 * @param {Object} notificationData - Notification data
 * @param {ObjectId} notificationData.recipient - User who receives notification
 * @param {ObjectId} notificationData.actor - User who performed the action
 * @param {string} notificationData.type - Notification type from NotificationType enum
 * @param {string} notificationData.entity - Entity type (Sale, CreditSale, Procurement, User)
 * @param {ObjectId} notificationData.entityId - ID of the entity
 * @param {string} notificationData.action - Action performed (CREATED, UPDATED, DELETED, RESTORED)
 * @param {string} notificationData.message - Notification message
 * @param {Object} notificationData.metadata - Additional context data
 * @param {string} notificationData.branch - Branch where action occurred
 * @returns {Promise<Notification>} Created notification
 */
async function createNotification(notificationData) {
  try {
    const notification = await Notification.create(notificationData);
    logger.info(`Notification created: ${notification._id} for user ${notificationData.recipient}`);
    return notification;
  } catch (error) {
    logger.error(`Failed to create notification: ${error.message}`);
    // Don't throw - notifications are non-critical
    return null;
  }
}

/**
 * Create notifications for managers in a branch
 * @param {Object} data - Notification data
 * @param {ObjectId} data.actor - User who performed the action
 * @param {string} data.type - Notification type
 * @param {string} data.entity - Entity type
 * @param {ObjectId} data.entityId - Entity ID
 * @param {string} data.action - Action performed
 * @param {string} data.message - Notification message
 * @param {Object} data.metadata - Additional context
 * @param {string} data.branch - Branch
 * @returns {Promise<Array>} Created notifications
 */
async function notifyManagers(data) {
  try {
    // Find all managers in the branch
    const managers = await User.find({
      role: "manager",
      branch: data.branch,
      active: true,
    }).select("_id");

    // Don't notify the actor themselves
    const recipients = managers.filter(
      (manager) => manager._id.toString() !== data.actor.toString()
    );

    // Create notifications for each manager
    const notifications = await Promise.all(
      recipients.map((manager) =>
        createNotification({
          recipient: manager._id,
          ...data,
        })
      )
    );

    return notifications.filter((n) => n !== null);
  } catch (error) {
    logger.error(`Failed to notify managers: ${error.message}`);
    return [];
  }
}

/**
 * Create notifications for directors (all branches)
 * @param {Object} data - Notification data
 * @returns {Promise<Array>} Created notifications
 */
async function notifyDirectors(data) {
  try {
    // Find all directors
    const directors = await User.find({
      role: "director",
      active: true,
    }).select("_id");

    // Don't notify the actor themselves
    const recipients = directors.filter(
      (director) => director._id.toString() !== data.actor.toString()
    );

    // Create notifications for each director
    const notifications = await Promise.all(
      recipients.map((director) =>
        createNotification({
          recipient: director._id,
          ...data,
        })
      )
    );

    return notifications.filter((n) => n !== null);
  } catch (error) {
    logger.error(`Failed to notify directors: ${error.message}`);
    return [];
  }
}

/**
 * Get notifications for a user with filtering
 * @param {ObjectId} userId - User ID
 * @param {Object} filters - Filter options
 * @param {string} filters.type - Filter by notification type
 * @param {string} filters.branch - Filter by branch
 * @param {Date} filters.startDate - Filter by start date
 * @param {Date} filters.endDate - Filter by end date
 * @param {boolean} filters.read - Filter by read status
 * @param {number} filters.page - Page number (default 1)
 * @param {number} filters.limit - Items per page (default 20)
 * @returns {Promise<Object>} Notifications and pagination info
 */
async function getNotifications(userId, filters = {}) {
  try {
    const {
      type,
      branch,
      startDate,
      endDate,
      read,
      page = 1,
      limit = 20,
    } = filters;

    // Build query
    const query = { recipient: userId };

    if (type) query.type = type;
    if (branch) query.branch = branch;
    if (read !== undefined) query.read = read;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    // Execute query with pagination
    const skip = (page - 1) * limit;
    const [notifications, total] = await Promise.all([
      Notification.find(query)
        .populate("actor", "name username role")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Notification.countDocuments(query),
    ]);

    return {
      notifications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    logger.error(`Failed to get notifications: ${error.message}`);
    throw error;
  }
}

/**
 * Mark a notification as read
 * @param {ObjectId} notificationId - Notification ID
 * @param {ObjectId} userId - User ID (for authorization)
 * @returns {Promise<Notification>} Updated notification
 */
async function markAsRead(notificationId, userId) {
  try {
    const notification = await Notification.findOne({
      _id: notificationId,
      recipient: userId,
    });

    if (!notification) {
      throw new Error("Notification not found");
    }

    if (!notification.read) {
      await notification.markAsRead();
    }

    return notification;
  } catch (error) {
    logger.error(`Failed to mark notification as read: ${error.message}`);
    throw error;
  }
}

/**
 * Mark all notifications as read for a user
 * @param {ObjectId} userId - User ID
 * @returns {Promise<Object>} Update result
 */
async function markAllAsRead(userId) {
  try {
    const result = await Notification.markAllAsRead(userId);
    logger.info(`Marked ${result.modifiedCount} notifications as read for user ${userId}`);
    return result;
  } catch (error) {
    logger.error(`Failed to mark all notifications as read: ${error.message}`);
    throw error;
  }
}

/**
 * Delete a notification
 * @param {ObjectId} notificationId - Notification ID
 * @param {ObjectId} userId - User ID (for authorization)
 * @returns {Promise<void>}
 */
async function deleteNotification(notificationId, userId) {
  try {
    const result = await Notification.deleteOne({
      _id: notificationId,
      recipient: userId,
    });

    if (result.deletedCount === 0) {
      throw new Error("Notification not found");
    }

    logger.info(`Notification ${notificationId} deleted by user ${userId}`);
  } catch (error) {
    logger.error(`Failed to delete notification: ${error.message}`);
    throw error;
  }
}

/**
 * Get unread notification count for a user
 * @param {ObjectId} userId - User ID
 * @returns {Promise<number>} Unread count
 */
async function getUnreadCount(userId) {
  try {
    return await Notification.getUnreadCount(userId);
  } catch (error) {
    logger.error(`Failed to get unread count: ${error.message}`);
    throw error;
  }
}

/**
 * Clean up old read notifications (older than 30 days)
 * This should be run as a scheduled job
 * @returns {Promise<number>} Number of deleted notifications
 */
async function cleanupOldNotifications() {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const result = await Notification.deleteMany({
      read: true,
      readAt: { $lt: thirtyDaysAgo },
    });

    logger.info(`Cleaned up ${result.deletedCount} old notifications`);
    return result.deletedCount;
  } catch (error) {
    logger.error(`Failed to cleanup old notifications: ${error.message}`);
    throw error;
  }
}

module.exports = {
  createNotification,
  notifyManagers,
  notifyDirectors,
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount,
  cleanupOldNotifications,
  NotificationType,
};
