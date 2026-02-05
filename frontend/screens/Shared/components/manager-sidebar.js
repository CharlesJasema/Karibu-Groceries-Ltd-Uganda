document.addEventListener("DOMContentLoaded", () => {
  const sidebar = document.querySelector(".kgl-sidebar");
  if (!sidebar) return;

  sidebar.innerHTML = `
    <div class="sidebar-brand">
      <h3>Manager</h3>
    </div>

    <nav>
      <a href="../dashboard/manager-dashboard.html">Dashboard</a>
      <a href="../credit-tracker/credit-tracker.html">Credit Tracker</a>
      <a href="../notifications/notifications.html">Notifications</a>
      <a href="../audit-log/audit-log.html">Audit Log</a>
      <a href="../system-health/system-health.html">System Health</a>
    </nav>

    <button class="logout-btn">Logout</button>
  `;

  sidebar.querySelector(".logout-btn").onclick = () => {
    localStorage.removeItem("kgl_current_user");
    window.location.href = "../../auth/login.html";
  };
});
