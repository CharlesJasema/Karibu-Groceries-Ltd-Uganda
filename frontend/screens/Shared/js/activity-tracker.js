/* 
  KGL ACTIVITY TRACKER
  Logs staff actions for manager visibility
*/

function logActivity({ role, name, action, branch }) {
  const logs =
    JSON.parse(localStorage.getItem("kgl_activity_logs")) || [];

  const activity = {
    role,
    name,
    action,
    branch,
    timestamp: new Date().toISOString()
  };
  
  logs.unshift(activity);
  localStorage.setItem("kgl_activity_logs", JSON.stringify(logs));

  // Trigger notifications
  if (window.evaluateTriggers) {
    evaluateTriggers(activity);
  }
}

// Make global
window.logActivity = logActivity;
// Also integrate with notification engine
window.evaluateTriggers = evaluateTriggers;
import { evaluateTriggers } from "./notification-engine.js";
