/* 
KGL FINANCIAL REPORTS MODULE
 */

const session = JSON.parse(localStorage.getItem("kgl_session"));
let transactions = JSON.parse(localStorage.getItem("kglTransactions")) || [];
let clients = JSON.parse(localStorage.getItem("kglClients")) || [];

if (!session || session.role !== "manager") {
  window.location.href = "../../auth/login/login.html";
}

/* 
LOAD BRANCH OPTIONS
 */

const branchSet = new Set(transactions.map((t) => t.branch));
const branchSelect = document.getElementById("filterBranch");

branchSet.forEach((branch) => {
  branchSelect.innerHTML += `<option value="${branch}">${branch}</option>`;
});

/* 
CALCULATE SUMMARY
 */

function calculateSummary(data) {
  let totalRevenue = 0;
  let totalCredit = 0;

  data.forEach((t) => {
    if (t.paymentMethod === "Cash") totalRevenue += t.total;
    if (t.paymentMethod === "Credit") totalCredit += t.total;
  });

  const outstandingCredit = clients.reduce(
    (sum, c) => sum + (c.creditBalance || 0),
    0,
  );

  document.getElementById("totalRevenue").textContent =
    "UGX " + totalRevenue.toLocaleString();

  document.getElementById("totalCredit").textContent =
    "UGX " + totalCredit.toLocaleString();

  document.getElementById("totalTransactions").textContent = data.length;

  document.getElementById("outstandingCredit").textContent =
    "UGX " + outstandingCredit.toLocaleString();
}

/* 
LOAD TABLE
 */

function loadTable(data) {
  const table = document.getElementById("financialTable");
  table.innerHTML = "";

  if (data.length === 0) {
    table.innerHTML = `<tr><td colspan="6">No transactions found.</td></tr>`;
    return;
  }

  data.forEach((t) => {
    table.innerHTML += `
            <tr>
                <td>${t.id}</td>
                <td>${new Date(t.date).toLocaleString()}</td>
                <td>${t.clientName}</td>
                <td>${t.branch}</td>
                <td>${t.paymentMethod}</td>
                <td>UGX ${t.total.toLocaleString()}</td>
            </tr>
        `;
  });
}

/* 
FILTERS
*/

function applyFilters() {
  const date = document.getElementById("filterDate").value;
  const branch = document.getElementById("filterBranch").value;
  const payment = document.getElementById("filterPayment").value;

  let filtered = [...transactions];

  if (date) {
    filtered = filtered.filter((t) => t.date.startsWith(date));
  }

  if (branch) {
    filtered = filtered.filter((t) => t.branch === branch);
  }

  if (payment) {
    filtered = filtered.filter((t) => t.paymentMethod === payment);
  }

  calculateSummary(filtered);
  loadTable(filtered);

  trackActivity("Manager applied financial filters");
  showToast("Filters applied", "success");
}

/* 
INITIAL LOAD
 */

calculateSummary(transactions);
loadTable(transactions);

trackActivity("Manager viewed financial reports");
