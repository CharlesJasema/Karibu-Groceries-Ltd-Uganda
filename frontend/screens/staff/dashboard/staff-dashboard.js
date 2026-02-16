/*
  STAFF DASHBOARD LOGIC
  - Role validation
  - KPI calculations
  - Activity tracking
  - Navigation
*/

protectRoute("SalesAgent");

document.addEventListener("DOMContentLoaded", () => {

  const session = JSON.parse(localStorage.getItem("kgl_current_user"));

  if (!session || session.role !== "Staff") {
    window.location.href = "../../auth/login.html";
    return;
  }

  // Populate basic info
  document.getElementById("staffBranch").textContent = session.branch || "N/A";

  loadDashboardMetrics(session);
  loadRecentActivity(session);
  bindQuickActions();

});

/* KPI CALCULATIONS */
function loadDashboardMetrics(user) {

  const logs = JSON.parse(localStorage.getItem("kgl_activity_log")) || [];

  const today = new Date().toLocaleDateString();

  let sales = 0;
  let credit = 0;
  let transactions = 0;

  logs.forEach(log => {
    if (log.staff === user.username && log.date === today) {
      transactions++;
      if (log.type === "SALE") sales += log.amount;
      if (log.type === "CREDIT") credit += log.amount;
    }
  });

  document.getElementById("todaySales").textContent = `UGX ${sales.toLocaleString()}`;
  document.getElementById("todayCredit").textContent = `UGX ${credit.toLocaleString()}`;
  document.getElementById("transactionCount").textContent = transactions;
}

/* RECENT ACTIVITY */
function loadRecentActivity(user) {

  const logs = JSON.parse(localStorage.getItem("kgl_activity_log")) || [];
  const list = document.getElementById("activityList");

  const recent = logs
    .filter(l => l.staff === user.username)
    .slice(-5)
    .reverse();

  list.innerHTML = "";

  if (recent.length === 0) {
    list.innerHTML = "<li>No activity recorded today</li>";
    return;
  }

  recent.forEach(log => {
    const li = document.createElement("li");
    li.textContent = `${log.time} – ${log.type} – UGX ${log.amount.toLocaleString()}`;
    list.appendChild(li);
  });
}

/* QUICK ACTION NAVIGATION */
function bindQuickActions() {
  document.querySelectorAll(".action-grid button").forEach(btn => {
    btn.addEventListener("click", () => {
      window.location.href = btn.dataset.link;
    });
  });
}
