/*
  STAFF ATTENDANCE LOGGER
  - Prevents duplicate clock-ins
  - Prevents invalid clock-outs
  - Logs activity for manager review
*/

document.addEventListener("DOMContentLoaded", () => {

  const session = JSON.parse(localStorage.getItem("kgl_current_user"));
  if (!session || session.role !== "Staff") {
    window.location.href = "../../auth/login.html";
    return;
  }

  const today = new Date().toLocaleDateString();
  const now = () => new Date().toLocaleTimeString();

  const statusText = document.getElementById("statusText");
  const clockInBtn = document.getElementById("clockInBtn");
  const clockOutBtn = document.getElementById("clockOutBtn");
  const tbody = document.getElementById("attendanceBody");

  let records = JSON.parse(localStorage.getItem("kgl_attendance")) || [];

  const todayRecord = records.find(
    r => r.staff === session.username && r.date === today
  );

  if (todayRecord && todayRecord.clockIn && !todayRecord.clockOut) {
    statusText.textContent = "You are clocked in";
    clockInBtn.disabled = true;
    clockOutBtn.disabled = false;
  }

  clockInBtn.onclick = () => {
    if (todayRecord) return;

    records.push({
      staff: session.username,
      branch: session.branch,
      date: today,
      clockIn: now(),
      clockOut: null
    });

    localStorage.setItem("kgl_attendance", JSON.stringify(records));
    location.reload();
  };

  clockOutBtn.onclick = () => {
    todayRecord.clockOut = now();
    localStorage.setItem("kgl_attendance", JSON.stringify(records));
    location.reload();
  };

  document.getElementById("backDashboard").onclick = () => {
    window.location.href = "../dashboard/staff-dashboard.html";
  };

  records
    .filter(r => r.staff === session.username)
    .forEach(r => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${r.date}</td>
        <td>${r.clockIn || "-"}</td>
        <td>${r.clockOut || "-"}</td>
      `;
      tbody.appendChild(row);
    });
});
