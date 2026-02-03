document.addEventListener("DOMContentLoaded", () => {
  const header = document.getElementById("kglHeader");
  if (!header) return;

  const user = JSON.parse(localStorage.getItem("kgl_current_user"));

  const isDashboard = window.location.pathname.includes("dashboard");

  header.innerHTML = `
    <div class="top-nav">
      <div class="nav-left">
        <h3>Manager Panel</h3>
        <small>${user.branch}</small>
      </div>

      <div class="nav-actions">
        ${!isDashboard ? `
          <button id="backToDashboard" class="nav-btn">
            ← Dashboard
          </button>
        ` : ""}

        <button id="backToWelcome" class="nav-btn outline">
          Welcome
        </button>
      </div>
    </div>
  `;

  if (!isDashboard) {
    document.getElementById("backToDashboard")
      .addEventListener("click", () => {
        window.location.href = "../dashboard/dashboard.html";
      });
  }

  document.getElementById("backToWelcome")
    .addEventListener("click", () => {
      window.location.href = "../../welcome/welcome.html";
    });
});
