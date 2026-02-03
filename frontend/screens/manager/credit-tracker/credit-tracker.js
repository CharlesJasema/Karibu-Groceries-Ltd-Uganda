// Mock credit data (later from MongoDB)
const credits = [
  {
    client: "Musa Traders",
    branch: "Branch A",
    produce: "Maize",
    amount: 1200000,
    dueDate: "2026-02-05",
    status: "Overdue"
  },
  {
    client: "Kato Foods",
    branch: "Branch B",
    produce: "Beans",
    amount: 850000,
    dueDate: "2026-02-12",
    status: "Active"
  }
];

const table = document.getElementById("creditTable");

let total = 0;
let overdue = 0;
let cleared = 0;

credits.forEach(c => {
  total += c.amount;
  if (c.status === "Overdue") overdue++;
  if (c.status === "Cleared") cleared++;

  const tr = document.createElement("tr");

  tr.innerHTML = `
    <td>${c.client}</td>
    <td>${c.branch}</td>
    <td>${c.produce}</td>
    <td>${c.amount.toLocaleString()}</td>
    <td>${c.dueDate}</td>
    <td class="status-${c.status.toLowerCase()}">${c.status}</td>
    <td>
      <button class="action-btn approve" onclick="approveCredit()">Approve</button>
      <button class="action-btn extend" onclick="extendCredit()">Extend</button>
    </td>
  `;

  table.appendChild(tr);
});

// Summary
document.getElementById("totalCredit").textContent =
  total.toLocaleString();

document.getElementById("overdueCount").textContent = overdue;
document.getElementById("clearedCount").textContent = cleared;

// Actions
function approveCredit() {
  alert("Credit marked as cleared (Mock)");
}

function extendCredit() {
  alert("Credit due date extended (Mock)");
}

// Dashboard redirect
function goToDashboard() {
  window.location.href =
    "/screens/manager/dashboard/dashboard.html";
}
