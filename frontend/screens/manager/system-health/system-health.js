/* =====================================================
   SYSTEM MAINTENANCE & HEALTH
   - Admin critical actions
===================================================== */

const toggle = document.getElementById("maintenanceToggle");
const banner = document.getElementById("maintenanceBanner");

toggle.addEventListener("change", () => {
  if (toggle.checked) {
    const confirmAction = confirm(
      "Enable Maintenance Mode? This will block all staff and clients.",
    );
    if (confirmAction) {
      banner.classList.remove("hidden");
    } else {
      toggle.checked = false;
    }
  } else {
    banner.classList.add("hidden");
  }
});

document.querySelector(".btn-backup").addEventListener("click", () => {
  alert("Manual backup started (backend integration pending)");
});

/*
  FUTURE BACKEND INTEGRATION:
  - /health API (Node.js & MongoDB status)
  - Scheduled backups
  - Maintenance lock middleware
  - System alerts if downtime detected
*/
