/* 
CLIENT RECEIPTS MODULE
 */

const session = JSON.parse(localStorage.getItem("kgl_session"));
let transactions = JSON.parse(localStorage.getItem("kglTransactions")) || [];

if (!session || session.role !== "client") {
  window.location.href = "../../public/auth/login/login.html";
}

/* 
LOAD CLIENT RECEIPTS
 */

const clientTransactions = transactions.filter(
  (t) => t.clientPhone === session.phone,
);

const table = document.getElementById("receiptTable");

if (clientTransactions.length === 0) {
  table.innerHTML = `
        <tr><td colspan="5">No receipts found.</td></tr>
    `;
} else {
  clientTransactions.forEach((t) => {
    table.innerHTML += `
            <tr>
                <td>${t.id}</td>
                <td>${new Date(t.date).toLocaleString()}</td>
                <td>UGX ${t.total.toLocaleString()}</td>
                <td>${t.paymentMethod}</td>
                <td>
                    <button onclick="viewReceipt('${t.id}')">
                        View
                    </button>
                </td>
            </tr>
        `;
  });
}

/* 
VIEW RECEIPT
 */

function viewReceipt(id) {
  const transaction = transactions.find((t) => t.id === id);

  document.getElementById("receiptId").textContent = transaction.id;
  document.getElementById("receiptBranch").textContent = transaction.branch;
  document.getElementById("receiptDate").textContent = new Date(
    transaction.date,
  ).toLocaleString();
  document.getElementById("receiptTotal").textContent =
    transaction.total.toLocaleString();
  document.getElementById("receiptPayment").textContent =
    transaction.paymentMethod;

  const itemsTable = document.getElementById("receiptItems");
  itemsTable.innerHTML = "";

  transaction.items.forEach((item) => {
    itemsTable.innerHTML += `
            <tr>
                <td>${item.name}</td>
                <td>${item.qty}</td>
                <td>${item.price.toLocaleString()}</td>
                <td>${(item.qty * item.price).toLocaleString()}</td>
            </tr>
        `;
  });

  document.getElementById("receiptModal").style.display = "flex";

  trackActivity("Client viewed receipt: " + id);
}

/* 
PRINT
 */

function printReceipt() {
  window.print();
  trackActivity("Client printed receipt");
}

/* 
CLOSE MODAL
 */

function closeReceipt() {
  document.getElementById("receiptModal").style.display = "none";
}

/* 
NAVIGATION
 */

function goDashboard() {
  window.location.href = "../../public/client/client-dashboard.html";
}
