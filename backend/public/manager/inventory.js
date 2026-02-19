/* 
   SECURE INVENTORY SYSTEM
   Backend Powered
    */

const PRODUCE_LIST = [
  "Beans",
  "Soya Beans",
  "Maize",
  "Sorghum",
  "Millet",
  "Cassava",
  "Tomatoes",
  "Onions",
  "Cabbage",
  "Irish potato",
  "Rice",
  "Carrots",
];

const inventoryTable = document.querySelector("#inventoryTable tbody");
const stockModal = document.getElementById("stockModal");
const addStockBtn = document.getElementById("addStockBtn");
const closeModal = document.getElementById("closeModal");
const stockForm = document.getElementById("stockForm");

/* 
   LOAD INVENTORY FROM BACKEND
    */

async function loadInventory() {
  const res = await authFetch("/inventory");

  if (!res) return;

  const data = await res.json();
  renderInventory(data);
}

/* 
   RENDER TABLE
    */

function getStatus(item) {
  if (item.quantity === 0) return "status-red";
  if (item.quantity <= item.threshold) return "status-orange";
  return "status-green";
}

function renderInventory(inventory) {
  inventoryTable.innerHTML = "";

  inventory.forEach((item) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${item.name}</td>
      <td>${item.branch}</td>
      <td>${Number(item.buyingPrice).toLocaleString()}</td>
      <td>${Number(item.sellingPrice).toLocaleString()}</td>
      <td>${item.quantity}</td>
      <td class="${getStatus(item)}">
        ${getStatus(item).replace("status-", "").toUpperCase()}
      </td>
      <td>${new Date(item.updatedAt).toLocaleString()}</td>
      <td><button onclick="editItem('${item._id}')">Edit</button></td>
    `;

    inventoryTable.appendChild(row);
  });
}

/* 
   ADD / UPDATE STOCK (BACKEND)
    */

stockForm.addEventListener("submit", async function (e) {
  e.preventDefault();

  const name = document.getElementById("produceSelect").value;
  const branch = document.getElementById("branchSelect").value;
  const buyingPrice = Number(document.getElementById("buyingPrice").value);
  const sellingPrice = Number(document.getElementById("sellingPrice").value);
  const quantity = Number(document.getElementById("quantity").value);
  const threshold = Number(document.getElementById("threshold").value);

  const res = await authFetch("/inventory", {
    method: "POST",
    body: JSON.stringify({
      name,
      branch,
      buyingPrice,
      sellingPrice,
      quantity,
      threshold,
    }),
  });

  if (!res) return;

  const data = await res.json();

  if (!res.ok) {
    alert(data.message || "Failed to update inventory");
    return;
  }

  alert("Inventory updated successfully");
  stockModal.classList.add("hidden");

  loadInventory();
});

/* 
   MODAL CONTROL
    */

addStockBtn.addEventListener("click", () => {
  stockModal.classList.remove("hidden");
});

closeModal.addEventListener("click", () => {
  stockModal.classList.add("hidden");
});

/* 
   INIT
    */

function initProduceDropdown() {
  const select = document.getElementById("produceSelect");
  PRODUCE_LIST.forEach((item) => {
    let option = document.createElement("option");
    option.value = item;
    option.textContent = item;
    select.appendChild(option);
  });
}

initProduceDropdown();
loadInventory();
