document.addEventListener("DOMContentLoaded", () => {
  const header = document.querySelector(".kgl-header");
  if (!header) return;

  const session = JSON.parse(localStorage.getItem("kgl_current_user"));

  header.innerHTML = `
    <div class="header-left">
      <img src="../../shared/images/kgl-logo.png" class="header-logo" />
      <span>KGL System</span>
    </div>
    <div class="header-right">
      <span class="user-meta">
        ${session?.username || "Guest"} (${session?.role || "N/A"})
      </span>
    </div>
  `;
});
