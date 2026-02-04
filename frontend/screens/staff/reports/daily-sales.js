/*
  STAFF DAILY SALES REPORT
  - Reads recorded sales
  - Filters by staff + today
  - Read-only
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

  const sales = JSON.parse(localStorage.getItem("kgl_sales_records")) || [];
  const today = new Date().toLocaleDateString();

  const tbody = document.getElementById("salesBody");
  const totalDisplay = document.getElementById("totalSales");

  let total = 0;

  sales
    .filter(sale =>
      sale.staff === session.username &&
      sale.date === today
    )
    .forEach(sale => {

      total += sale.total;

      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${sale.produce}</td>
        <td>${sale.quantity}</td>
        <td>${sale.price.toLocaleString()}</td>
        <td>${sale.total.toLocaleString()}</td>
        <td>${sale.time}</td>
      `;
      tbody.appendChild(row);
    });

  totalDisplay.textContent = `UGX ${total.toLocaleString()}`;
});
