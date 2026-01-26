const sidebar = `
<aside class="kgl-sidebar">
  <h3>KGL Manager</h3>
  <nav>
    <a href="../dashboard/manager-dashboard.html">Dashboard</a>
    <a href="../notifications/notifications.html">Notifications</a>
    <a href="../staff-performance/staff-performance.html">Staff Performance</a>
    <a href="../audit-log/audit-log.html">Audit Log</a>
    <a href="../system-health/system-health.html">System Health</a>
  </nav>
</aside>
`;

document.body.insertAdjacentHTML("afterbegin", sidebar);

/* 
   KGL SIDEBAR COMPONENT
   
   This file dynamically injects the correct sidebar
   based on the logged-in user's role.
   Current implementation: MANAGER sidebar
    */

document.addEventListener("DOMContentLoaded", () => {
  // Find the sidebar container in the HTML
  const sidebarContainer = document.querySelector(".kgl-sidebar");

  // If page does not require sidebar, exit safely
  if (!sidebarContainer) return;

  /* 
     STEP 1: GET LOGGED-IN USER ROLE
     
     In real app: fetched from backend / JWT
     For now: stored in localStorage
      */

  const userRole = localStorage.getItem("kgl_user_role");

  // Only inject manager sidebar for manager role
  if (userRole === "manager") {
    renderManagerSidebar(sidebarContainer);
  }
});

/* 
   MANAGER SIDEBAR RENDER FUNCTION
    */
function renderManagerSidebar(container) {
  container.classList.add("manager-sidebar");

  container.innerHTML = `
   
    <!-- SIDEBAR BRAND / LOGO -->
   
    <div class="sidebar-brand">
      <img src="../../shared/images/kgl-logo.png" alt="KGL Logo" />
      <span>KGL Manager</span>
    </div>

   
    <!-- NAVIGATION LINKS -->
   
    <nav>
      <a href="../dashboard/dashboard.html" data-page="dashboard">
        <i class="icon-dashboard"></i>
        Dashboard
      </a>

      <a href="../stock-replenishment/stock-replenishment.html" data-page="stock-replenishment">
        <i class="icon-box"></i>
        Stock Replenishment
      </a>

      <a href="../stock-trends/stock-trends.html" data-page="stock-trends">
        <i class="icon-chart"></i>
        Stock Trends
      </a>

      <a href="../branch-comparison/branch-comparison.html" data-page="branch-comparison">
        <i class="icon-compare"></i>
        Branch Comparison
      </a>

      <a href="../audit-log/audit-log.html" data-page="audit-log">
        <i class="icon-shield"></i>
        Audit Trail
      </a>

      <a href="../staff-performance/staff-performance.html" data-page="staff-performance">
        <i class="icon-trophy"></i>
        Staff Performance
      </a>

      <a href="../notifications/notifications.html" data-page="notifications">
        <i class="icon-bell"></i>
        Notifications
      </a>

      <a href="../system-health/system-health.html" data-page="system-health">
        <i class="icon-cog"></i>
        System Health
      </a>
    </nav>

   
    <!-- SIDEBAR FOOTER -->
   
    <div class="sidebar-footer">
      <button class="logout-btn" id="logoutBtn">
        Logout
      </button>
    </div>
  `;

  highlightActiveLink();
  attachLogoutHandler();
}

/* 
   ACTIVE LINK HIGHLIGHT
   
   Highlights the sidebar item matching current page
    */
function highlightActiveLink() {
  const currentPath = window.location.pathname;

  document.querySelectorAll(".manager-sidebar nav a").forEach(link => {
    if (currentPath.includes(link.getAttribute("data-page"))) {
      link.classList.add("active");
    }
  });
}

/* 
   LOGOUT HANDLER
   
   Clears session and redirects to login
   */
function attachLogoutHandler() {
  const logoutBtn = document.getElementById("logoutBtn");

  if (!logoutBtn) return;

  logoutBtn.addEventListener("click", () => {
    // Clear stored auth data
    localStorage.removeItem("kgl_user_role");
    localStorage.removeItem("kgl_user_token");

    // Redirect to login screen
    window.location.href = "../../auth/login/login.html";
  });
}
