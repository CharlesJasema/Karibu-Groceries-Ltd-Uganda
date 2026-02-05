/*
  KGL NOTIFICATION ENGINE
  Automatically creates manager alerts
  based on activities & system conditions
*/

function createNotification({ type, title, message, urgency }) {
  const notifications =
    JSON.parse(localStorage.getItem("kgl_notifications")) || [];

  notifications.unshift({
    id: Date.now(),
    type,
    title,
    message,
    urgency, // low | medium | high
    read: false,
    timestamp: new Date().toISOString()
  });

  localStorage.setItem(
    "kgl_notifications",
    JSON.stringify(notifications)
  );
}

/*
  EVALUATE TRIGGERS
*/
function evaluateTriggers(activity) {

  // 1️ CREDIT ISSUED BY STAFF
  if (activity.action.includes("credit")) {
    createNotification({
      type: "credit",
      title: "New Credit Issued",
      message: `${activity.name} issued credit at ${activity.branch}`,
      urgency: "high"
    });
  }

  // 2️ LARGE SALE
  if (activity.action.includes("sale")) {
    createNotification({
      type: "sales",
      title: "Sale Recorded",
      message: `${activity.name} recorded a sale (${activity.branch})`,
      urgency: "medium"
    });
  }

  // 3️ ATTENDANCE
  if (activity.action.includes("Clocked in")) {
    createNotification({
      type: "attendance",
      title: "Staff Clock-in",
      message: `${activity.name} clocked in (${activity.branch})`,
      urgency: "low"
    });
  }

  // 4️ SYSTEM / MANAGER ACTIONS
  if (activity.role === "manager") {
    createNotification({
      type: "system",
      title: "Manager Action",
      message: activity.action,
      urgency: "medium"
    });
  }
}

// Expose globally
window.createNotification = createNotification;
window.evaluateTriggers = evaluateTriggers;
