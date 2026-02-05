document.addEventListener("DOMContentLoaded", () => {
  const sidebar = document.querySelector(".kgl-sidebar");
  if (!sidebar) return;

  sidebar.innerHTML = `
    <div class="sidebar-brand">
      <h3>Client</h3>
    </div>

    <nav>
      <a href="../dashboard/client-dashboard.html">Dashboard</a>
      <a href="../orders/orders.html">My Orders</a>
      <a href="../credit/my-credit.html">My Credit</a>
      <a href="../profile/profile.html">Profile</a>
    </nav>
  `;
});
