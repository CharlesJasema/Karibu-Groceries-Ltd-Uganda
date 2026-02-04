/*
  STAFF CREDIT HANDLING LOGIC
  - Strict validation
  - Credit code generation
  - Manager visibility
  - Audit logging
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

  function updateTotal() {
    const q = Number(quantity.value) || 0;
    const p = Number(price.value) || 0;
    total.textContent = `UGX ${(q * p).toLocaleString()}`;
  }

  quantity.oninput = updateTotal;
  price.oninput = updateTotal;

  document.getElementById("creditForm").addEventListener("submit", e => {
    e.preventDefault();

    const dueDate = new Date(document.getElementById("dueDate").value);
    const today = new Date();

    if (dueDate <= today) {
      alert("Due date must be in the future.");
      return;
    }

    const creditRecord = {
      id: "CR-" + Math.floor(Math.random() * 100000),
      client: clientName.value.trim(),
      staff: session.username,
      branch: session.branch,
      produce: produce.value,
      quantity: Number(quantity.value),
      price: Number(price.value),
      amount: Number(quantity.value) * Number(price.value),
      dueDate: dueDate.toDateString(),
      status: "Pending Approval",
      dateIssued: new Date().toLocaleDateString(),
      timeIssued: new Date().toLocaleTimeString()
    };

    // Store credit record
    const credits = JSON.parse(localStorage.getItem("kgl_credit_records")) || [];
    credits.push(creditRecord);
    localStorage.setItem("kgl_credit_records", JSON.stringify(credits));

    // Audit log
    const logs = JSON.parse(localStorage.getItem("kgl_activity_log")) || [];
    logs.push({
      action: "CREDIT ISSUED",
      reference: creditRecord.id,
      staff: session.username,
      branch: session.branch,
      amount: creditRecord.amount,
      time: creditRecord.timeIssued,
      date: creditRecord.dateIssued
    });
    localStorage.setItem("kgl_activity_log", JSON.stringify(logs));

    alert(`Credit issued successfully.\nReference: ${creditRecord.id}`);
    window.location.href = "../dashboard/staff-dashboard.html";
  });
});
