/* 
KGL CART & CHECKOUT ENGINE
 */

const session = JSON.parse(localStorage.getItem("kgl_session"));
let cart = JSON.parse(localStorage.getItem("kgl_cart")) || [];
let inventory = JSON.parse(localStorage.getItem("kgl_inventory")) || [];
let sales = JSON.parse(localStorage.getItem("kgl_sales")) || [];

if (!session || session.role !== "client") {
  window.location.href = "../../auth/login/login.html";
}

const cartBody = document.getElementById("cartBody");

/* 
RENDER CART
 */

function renderCart() {
  cartBody.innerHTML = "";

  let subtotal = 0;

  cart.forEach((item, index) => {
    subtotal += item.total;

    cartBody.innerHTML += `
            <tr>
                <td>${item.name}</td>
                <td>${item.quantity}</td>
                <td>${item.price.toLocaleString()}</td>
                <td>${item.total.toLocaleString()}</td>
                <td><button onclick="removeItem(${index})">X</button></td>
            </tr>
        `;
  });

  applySummary(subtotal);
}

function removeItem(index) {
  cart.splice(index, 1);
  localStorage.setItem("kgl_cart", JSON.stringify(cart));
  renderCart();
}

/* 
DISCOUNT LOGIC
 */

function applySummary(subtotal) {
  let discount = 0;

  // 5% discount if total exceeds 1,000,000 UGX
  if (subtotal >= 1000000) {
    discount = subtotal * 0.05;
  }

  const total = subtotal - discount;

  document.getElementById("subtotal").textContent = subtotal.toLocaleString();
  document.getElementById("discount").textContent = discount.toLocaleString();
  document.getElementById("grandTotal").textContent = total.toLocaleString();
}

/* 
COMPLETE CHECKOUT
 */

function completeCheckout() {
  const paymentMethod = document.getElementById("paymentMethod").value;

  if (!paymentMethod) {
    showToast("Select payment method.", "error");
    return;
  }

  if (cart.length === 0) {
    showToast("Cart is empty.", "error");
    return;
  }

  // VALIDATE STOCK AGAIN
  for (let item of cart) {
    const invItem = inventory.find(
      (inv) => inv.name === item.name && inv.branch === session.branch,
    );

    if (!invItem || invItem.quantity < item.quantity) {
      showToast(`${item.name} stock insufficient.`, "error");
      return;
    }
  }

  // DEDUCT STOCK
  cart.forEach((item) => {
    const invItem = inventory.find(
      (inv) => inv.name === item.name && inv.branch === session.branch,
    );
    invItem.quantity -= item.quantity;
  });

  localStorage.setItem("kgl_inventory", JSON.stringify(inventory));

  // RECORD SALE
  const saleRecord = {
    id: "sale_" + Date.now(),
    client: session.username,
    branch: session.branch,
    items: cart,
    total: parseFloat(
      document.getElementById("grandTotal").textContent.replace(/,/g, ""),
    ),
    paymentMethod,
    date: new Date().toLocaleString(),
  };

  sales.push(saleRecord);
  localStorage.setItem("kgl_sales", JSON.stringify(sales));

  // ACTIVITY + NOTIFICATIONS
  trackActivity("Completed purchase", session.username);
  triggerNotification("New Sale Completed", session.branch);

  // CLEAR CART
  cart = [];
  localStorage.setItem("kgl_cart", JSON.stringify(cart));

  showToast("Payment successful!", "success");

  setTimeout(() => {
    window.location.href = "../dashboard/client-dashboard.html";
  }, 1500);
}

/* 
NAVIGATION
 */

function goShop() {
  window.location.href = "../shop/shop.html";
}

renderCart();
