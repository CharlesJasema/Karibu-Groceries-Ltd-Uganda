/* 
KGL CLIENT SHOP LOGIC
 */

const session = JSON.parse(localStorage.getItem("kgl_session"));
const inventory = JSON.parse(localStorage.getItem("kgl_inventory")) || [];
let cart = JSON.parse(localStorage.getItem("kgl_cart")) || [];

if (!session || session.role !== "client") {
  window.location.href = "../../public/auth/login/login.html";
}

document.getElementById("branchName").textContent = session.branch;

/* 
FILTER INVENTORY BY BRANCH
 */

const branchInventory = inventory.filter(
  (item) => item.branch === session.branch,
);

const productGrid = document.getElementById("productGrid");

/* 
RENDER PRODUCTS
 */

branchInventory.forEach((item) => {
  const card = document.createElement("div");
  card.classList.add("product-card");

  const status =
    item.quantity <= 0
      ? `<p class="out-of-stock">Out of Stock</p>`
      : `<p>Stock: ${item.quantity}</p>`;

  card.innerHTML = `
        <h3>${item.name}</h3>
        <p>Price: UGX ${item.price.toLocaleString()}</p>
        ${status}
        <input type="number" min="1" max="${item.quantity}" 
               placeholder="Enter quantity" 
               id="qty-${item.name}">
        <button onclick="addToCart('${item.name}', ${item.price}, ${item.quantity})">
            Add to Cart
        </button>
    `;

  productGrid.appendChild(card);
});

/* 
ADD TO CART
 */

function addToCart(name, price, availableQty) {
  const qtyInput = document.getElementById(`qty-${name}`);
  const quantity = parseInt(qtyInput.value);

  if (!quantity || quantity <= 0) {
    showToast("Enter valid quantity.", "error");
    return;
  }

  if (quantity > availableQty) {
    showToast("Quantity exceeds available stock.", "error");
    return;
  }

  cart.push({
    client: session.username,
    branch: session.branch,
    name,
    price,
    quantity,
    total: price * quantity,
  });

  localStorage.setItem("kgl_cart", JSON.stringify(cart));

  trackActivity(`Added ${quantity} ${name} to cart`, session.username);

  showToast(`${name} added to cart!`, "success");
}

/* 
NAVIGATION
 */

function goDashboard() {
  window.location.href = "../../public/client/client-dashboard.html";
}
