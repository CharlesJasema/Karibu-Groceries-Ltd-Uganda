function protectRoute(requiredRole) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token) {
    window.location.href = "../../auth/login/login.html";
    return;
  }

  if (requiredRole && role !== requiredRole) {
    alert("Unauthorized access");
    window.location.href = "../../auth/login/login.html";
  }
}
