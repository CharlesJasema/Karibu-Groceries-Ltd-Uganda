/* 
   MANAGER DASHBOARD - REAL DATA VERSION
 */

const API_BASE = "http://localhost:3000/api";

/* 
   AUTH GUARD
 */

(function protectRoute() {
  const token = localStorage.getItem("accessToken");
  const role = localStorage.getItem("userRole");

  if (!token || role !== "Manager") {
    localStorage.clear();
    window.location.href = "../auth/login.html";
  }
})();

/* 
   LOGOUT
 */

document.querySelector(".btn-logout").addEventListener("click", () => {
  localStorage.clear();
  window.location.href = "../auth/login.html";
});

/* 
   SET MANAGER NAME
 */

const managerName = localStorage.getItem("userName");
document.getElementById("managerName").textContent =
  "Welcome, " + (managerName || "Manager");

/* 
   AUTH FETCH HELPER
 */

async function authFetch(url) {
  const token = localStorage.getItem("accessToken");

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (res.status === 401) {
    localStorage.clear();
    window.location.href = "../auth/login.html";
  }

  return res.json();
}

/* 
   LOAD KPI SUMMARY
 */

async function loadKPI() {
  try {
    const data = await authFetch(`${API_BASE}/dashboard/manager-summary`);

    document.getElementById("totalSales").textContent =
      "UGX " + data.totalSales.toLocaleString();

    document.getElementById("inventoryStatus").textContent =
      `${data.inStock} In Stock | ${data.lowStock} Low`;

    document.getElementById("outstandingCredit").textContent =
      "UGX " + data.outstandingCredit.toLocaleString();

    document.getElementById("activeStaff").textContent =
      `${data.activeStaff} Active`;
  } catch (error) {
    console.error("KPI Load Error:", error);
  }
}

/* 
   LOAD BRANCH OVERVIEW
 */

async function loadBranches() {
  try {
    const branches = await authFetch(`${API_BASE}/branches/overview`);

    const container = document.getElementById("branchOverview");
    container.innerHTML = "";

    branches.forEach((branch) => {
      const div = document.createElement("div");
      div.className = "branch-box";
      div.innerHTML = `
        <h4>${branch.name}</h4>
        <p>Sales Today: UGX ${branch.salesToday.toLocaleString()}</p>
        <p>Stock Issues: ${branch.stockIssues}</p>
      `;
      container.appendChild(div);
    });
  } catch (error) {
    console.error("Branch Load Error:", error);
  }
}

/* 
   LOAD INVENTORY SNAPSHOT
 */

async function loadInventory() {
  try {
    const inventory = await authFetch(`${API_BASE}/inventory`);

    const tbody = document.getElementById("inventorySnapshot");
    tbody.innerHTML = "";

    inventory.forEach((item) => {
      let statusClass = "good";
      if (item.quantity <= 0) statusClass = "out";
      else if (item.quantity < 50) statusClass = "low";

      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${item.name}</td>
        <td>${item.price.toLocaleString()}</td>
        <td class="${statusClass}">
          ${item.quantity <= 0 ? "Out" : item.quantity < 50 ? "Low" : "Good"}
        </td>
      `;
      tbody.appendChild(row);
    });
  } catch (error) {
    console.error("Inventory Load Error:", error);
  }
}

/* 
   LOAD RECENT ACTIVITY
 */

async function loadActivity() {
  try {
    const activities = await authFetch(`${API_BASE}/activity/recent`);

    const list = document.getElementById("activityList");
    list.innerHTML = "";

    activities.forEach((log) => {
      const li = document.createElement("li");
      li.textContent = `${log.userName} (${log.branch}) - ${log.action} - ${new Date(log.createdAt).toLocaleTimeString()}`;
      list.appendChild(li);
    });
  } catch (error) {
    console.error("Activity Load Error:", error);
  }
}

/* 
   INIT LOAD
 */

loadKPI();
loadBranches();
loadInventory();
loadActivity();

/* auto-refresh every 30 seconds */
setInterval(() => {
  loadKPI();
  loadBranches();
  loadInventory();
  loadActivity();
}, 30000);
