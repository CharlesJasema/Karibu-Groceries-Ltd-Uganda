const AuditLog = require("../models/auditLog");

const logAction = async (action, entity, entityId, req, details = {}) => {
  try {
    await AuditLog.create({
      user: req.user?._id,
      action,
      entity,
      entityId,
      details,
      ip: req.ip || req.connection?.remoteAddress || "unknown",
    });
  } catch (error) {
    console.error("Audit Log Error:", error.message);
  }
};

module.exports = logAction;
