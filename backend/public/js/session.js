function checkSession() {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token || !role) return;

  if (role === "manager") {
    window.location.href = "../public/manager-dashboard.html";
  } else if (role === "agent") {
    window.location.href = "../public/agent-dashboard.html";
  } else if (role === "client") {
    window.location.href = "../public/client-dashboard.html";
  }
}

checkSession();
