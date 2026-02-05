/*
  STAFF SALES LOGIC
  - Validation
  - Activity logging
  - Dashboard + Manager sync
*/

document.addEventListener("DOMContentLoaded", () => {

  const session = JSON.parse(localStorage.getItem("kgl_current_user"));
  if (!session || session.role !== "Staff") {
    window.location.href = "../../auth/login.html";
    return;
  }

  document.getElementById("backDashboard").onclick = () => {
    window.location.href = "../dashboard/staff-dashboard.html";
  };

  const quantity = document.getElementById("quantity");
  const price = document.getElementById("price");
  const total = document.getElementById("totalAmount");

  function calculateTotal() {
    const q = Number(quantity.value) || 0;
    const p = Number(price.value) || 0;
    total.textContent = `UGX ${(q * p).toLocaleString()}`;
  }

  quantity.oninput = calculateTotal;
  price.oninput = calculateTotal;

  document.getElementById("salesForm").addEventListener("submit", e => {
    e.preventDefault();

    const sale = {
      id: Date.now(),
      staff: session.username,
      branch: session.branch,
      produce: produce.value,
      quantity: Number(quantity.value),
      price: Number(price.value),
      amount: Number(quantity.value) * Number(price.value),
      payment: paymentMethod.value,
      type: paymentMethod.value === "Credit" ? "CREDIT" : "SALE",
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString()
    };

    const logs = JSON.parse(localStorage.getItem("kgl_activity_log")) || [];
    logs.push(sale);
    localStorage.setItem("kgl_activity_log", JSON.stringify(logs));

    alert("Sale recorded successfully");
    window.location.href = "../dashboard/staff-dashboard.html";
  });
});

const session = JSON.parse(localStorage.getItem("kgl_current_user"));

document.getElementById("recordSaleBtn").addEventListener("click", () => {
  // Save sale logic here...

  logActivity({
    role: "staff",
    name: session.username,
    branch: session.branch,
    action: "Recorded a new sale (UGX 450,000)"
  });

  showToast("Sale recorded successfully", "success");
});
