/* 
   MANAGER DASHBOARD LOGIC
   Handles:
   - Authentication check
   - Real-time refresh placeholders
   - Navigation logic
 */

// Simple role validation (placeholder)
const role = localStorage.getItem("userRole");

if (role !== "manager") {
  alert("Access denied. Managers only.");
  window.location.href = "../../auth/login.html";
}

// Logout functionality
document.querySelector(".btn-logout").addEventListener("click", () => {
  localStorage.clear();
  window.location.href = "../../auth/login.html";
});

// Placeholder for real-time updates
setInterval(() => {
  console.log("Refreshing dashboard analytics...");
}, 5000);

document.querySelectorAll(".action-card").forEach((card) => {
  card.addEventListener("click", () => {
    const link = card.dataset.link;
    window.location.href = link;
  });
});

/* RECENT ACTIVITIES SECTION */
function loadRecentActivities() {
  const logs = JSON.parse(localStorage.getItem("kgl_activity_logs")) || [];

  const activityList = document.querySelector(".activity-section ul");
  if (!activityList) return;

  activityList.innerHTML = "";

  logs.slice(0, 5).forEach((log) => {
    const li = document.createElement("li");
    li.innerText = `${log.name} (${log.branch}) - ${log.action}`;
    activityList.appendChild(li);
  });
}

loadRecentActivities();

setInterval(loadRecentActivities, 5000);

function updateNotificationBadge() {
  const notifications =
    JSON.parse(localStorage.getItem("kgl_notifications")) || [];

  const unread = notifications.filter((n) => !n.read).length;

  const badge = document.getElementById("notificationCount");
  if (badge) badge.textContent = unread;
}

updateNotificationBadge();
setInterval(updateNotificationBadge, 5000);
document.getElementById("notificationIcon").addEventListener("click", () => {
  window.location.href = "../notifications/manager-notifications.html";
});
