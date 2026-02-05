document.addEventListener("DOMContentLoaded", () => {
  const sidebar = document.querySelector(".kgl-sidebar");
  if (!sidebar) return;

  sidebar.innerHTML = `
    <div class="sidebar-brand">
      <h3>Staff</h3>
    </div>

    <nav>
      <a href="../dashboard/staff-dashboard.html">Dashboard</a>
      <a href="../sales/sales.html">Sales</a>
      <a href="../credit/credit.html">Credit</a>
      <a href="../reports/daily-report.html">Daily Report</a>
      <a href="../attendance/attendance.html">Attendance</a>
      <a href="../inquiry/inquiry.html">Inquiry</a>
      <a href="../profile/profile.html">Profile</a>
    </nav>

    <button class="logout-btn">Logout</button>
  `;

  sidebar.querySelector(".logout-btn").onclick = () => {
    localStorage.removeItem("kgl_current_user");
    window.location.href = "../../auth/login.html";
  };
});
