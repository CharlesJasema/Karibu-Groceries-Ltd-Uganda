/* 
   STOCK REPLENISHMENT LOGIC
   - Inventory rendering
   - Status calculation
   - Procurement validation
 */

// Sample inventory data (UGX-based, realistic demo data)
const inventoryData = [
  { produce: "Beans", branch: "Branch A", qty: 1200 },
  { produce: "Maize", branch: "Branch A", qty: 200 },
  { produce: "Rice", branch: "Branch B", qty: 0 },
  { produce: "Tomatoes", branch: "Branch B", qty: 150 },
];

// Populate inventory table
const tableBody = document.getElementById("inventoryTable");

inventoryData.forEach((item) => {
  const row = document.createElement("tr");

  let statusClass = "good";
  let statusText = "Good";

  if (item.qty <= 0) {
    statusClass = "out";
    statusText = "Out of Stock";
  } else if (item.qty < 300) {
    statusClass = "low";
    statusText = "Low Stock";
  }

  row.innerHTML = `
        <td>${item.produce}</td>
        <td>${item.branch}</td>
        <td>${item.qty}</td>
        <td class="${statusClass}">${statusText}</td>
    `;

  tableBody.appendChild(row);
});

// Auto-calculate total cost
const qtyInput = document.getElementById("quantity");
const costInput = document.getElementById("cost");
const totalCost = document.getElementById("totalCost");

function calculateTotal() {
  const qty = Number(qtyInput.value) || 0;
  const cost = Number(costInput.value) || 0;
  totalCost.textContent = `UGX ${qty * cost}`;
}

qtyInput.addEventListener("input", calculateTotal);
costInput.addEventListener("input", calculateTotal);

// Handle form submission
document.getElementById("replenishmentForm").addEventListener("submit", (e) => {
  e.preventDefault();

  alert("Procurement record saved successfully!");
  e.target.reset();
  totalCost.textContent = "UGX 0";
});
