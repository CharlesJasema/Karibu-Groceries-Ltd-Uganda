/* 
   MANAGERIAL AUDIT TRAIL LOG
   - Read-only
   - Backend-ready
 */

/*
  NOTE:
  This screen does NOT allow editing or deletion.
  All data must come from secure backend logs.
*/

document.querySelector(".btn-filter").addEventListener("click", () => {
    alert("Filters applied (backend integration pending)");
});


const logs =
  JSON.parse(localStorage.getItem("kgl_activity_logs")) || [];

const tableBody = document.querySelector("tbody");

logs.forEach(log => {
  const row = document.createElement("tr");

  row.innerHTML = `
    <td>${log.name}</td>
    <td>${log.role}</td>
    <td>${log.branch}</td>
    <td>${log.action}</td>
    <td>${new Date(log.timestamp).toLocaleString()}</td>
  `;

  tableBody.appendChild(row);
});
