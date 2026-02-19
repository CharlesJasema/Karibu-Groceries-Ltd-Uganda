/* 
KGL CLIENT DASHBOARD LOGIC
 */

const session = JSON.parse(localStorage.getItem("kgl_session"));
const inventory = JSON.parse(localStorage.getItem("kgl_inventory")) || [];
const credits = JSON.parse(localStorage.getItem("kgl_credit_requests")) || [];
const orders = JSON.parse(localStorage.getItem("kgl_orders")) || [];

if (!session || session.role !== "client") {
  window.location.href = "../../public/auth/login/login.html";
}

document.getElementById("clientName").textContent = session.username;
document.getElementById("clientBranch").textContent = session.branch;

/* 
AVAILABLE PRODUCTS COUNT
 */
const branchInventory = inventory.filter(
  (item) => item.branch === session.branch && item.quantity > 0,
);

document.getElementById("availableCount").textContent = branchInventory.length;

/* 
OUTSTANDING CREDIT
 */
const myCredit = credits
  .filter((c) => c.client === session.username && c.status === "approved")
  .reduce((sum, c) => sum + c.amount, 0);

document.getElementById("clientCredit").textContent =
  "UGX " + myCredit.toLocaleString();

/* 
RECENT ORDERS
 */
const myOrders = orders.filter((o) => o.client === session.username);
document.getElementById("recentOrders").textContent = myOrders.length;

/* 
NAVIGATION
 */
function goToShop() {
  window.location.href = "../../public/client/shop.html";
}

function goToReceipts() {
  window.location.href = "../../public/client/receipts.html";
}

function goToProfile() {
  window.location.href = "../../public/client/profile.html";
}

/* 
TRACK LOGIN ACTIVITY
 */
trackActivity("Client Dashboard Viewed", session.username);
