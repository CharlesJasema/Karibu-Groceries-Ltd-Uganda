/* 
   KGL INVENTORY SYSTEM LOGIC
   Controls stock for both branches
   Auto integrates with notifications & activity tracker
 */

const PRODUCE_LIST = [
    "Beans","Soya Beans","Maize","Sorghum","Millet",
    "Cassava","Tomatoes","Onions","Cabbage",
    "Irish potato","Rice","Carrots"
];

const inventoryTable = document.querySelector("#inventoryTable tbody");
const stockModal = document.getElementById("stockModal");
const addStockBtn = document.getElementById("addStockBtn");
const closeModal = document.getElementById("closeModal");
const stockForm = document.getElementById("stockForm");

let inventory = JSON.parse(localStorage.getItem("kgl_inventory")) || [];

/* 
   INITIAL SETUP
 */

function initProduceDropdown() {
    const select = document.getElementById("produceSelect");
    PRODUCE_LIST.forEach(item => {
        let option = document.createElement("option");
        option.value = item;
        option.textContent = item;
        select.appendChild(option);
    });
}

function saveInventory() {
    localStorage.setItem("kgl_inventory", JSON.stringify(inventory));
}

function getStatus(item) {
    if (item.quantity === 0) return "status-red";
    if (item.quantity <= item.threshold) return "status-orange";
    return "status-green";
}

/* 
   RENDER INVENTORY TABLE
 */

function renderInventory() {
    inventoryTable.innerHTML = "";

    inventory.forEach(item => {
        let row = document.createElement("tr");

        row.innerHTML = `
            <td>${item.name}</td>
            <td>${item.branch}</td>
            <td>${item.buyingPrice.toLocaleString()}</td>
            <td>${item.sellingPrice.toLocaleString()}</td>
            <td>${item.quantity}</td>
            <td class="${getStatus(item)}">
                ${getStatus(item).replace("status-","").toUpperCase()}
            </td>
            <td>${item.updatedAt}</td>
            <td><button onclick="editItem('${item.id}')">Edit</button></td>
        `;

        inventoryTable.appendChild(row);
    });
}

/* 
   UPDATE STOCK
 */

stockForm.addEventListener("submit", function(e){
    e.preventDefault();

    const name = document.getElementById("produceSelect").value;
    const branch = document.getElementById("branchSelect").value;
    const buyingPrice = Number(document.getElementById("buyingPrice").value);
    const sellingPrice = Number(document.getElementById("sellingPrice").value);
    const quantity = Number(document.getElementById("quantity").value);
    const threshold = Number(document.getElementById("threshold").value);

    const currentUser = JSON.parse(localStorage.getItem("kgl_session"));

    const newItem = {
        id: Date.now().toString(),
        name,
        branch,
        buyingPrice,
        sellingPrice,
        quantity,
        threshold,
        updatedBy: currentUser.username,
        updatedAt: new Date().toLocaleString()
    };

    inventory.push(newItem);
    saveInventory();
    renderInventory();

    trackActivity("Stock Updated", `${name} updated in ${branch}`);
    showToast("Inventory updated successfully", "success");

    stockModal.classList.add("hidden");
});

/* 
   MODAL CONTROL
 */

addStockBtn.addEventListener("click", ()=>{
    stockModal.classList.remove("hidden");
});

closeModal.addEventListener("click", ()=>{
    stockModal.classList.add("hidden");
});

/* 
   INITIAL LOAD
*/

initProduceDropdown();
renderInventory();
