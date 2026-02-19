const API_BASE = "http://localhost:3000";

const form = document.getElementById("loginForm");
const toastContainer = document.getElementById("toastContainer");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!email || !password) {
    showToast("Please fill in all fields");
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/users/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      showToast(data.message || "Invalid credentials");
      return;
    }

    // Store auth data
    localStorage.setItem("accessToken", data.token);
    localStorage.setItem("userRole", data.user.role);
    localStorage.setItem("userName", data.user.name);
    localStorage.setItem("userId", data.user.id);

    showToast("Login successful!");

    setTimeout(() => {
      if (data.user.role === "Manager") {
        window.location.href = "/manager/manager-dashboard.html";
      } 
      else if (data.user.role === "SalesAgent") {
        window.location.href = "/agent/agent-dashboard.html";
      } 
      else if (data.user.role === "Client") {
        window.location.href = "/client/client-dashboard.html";
      } 
      else {
        window.location.href = "/";
      }
    }, 1000);

  } catch (error) {
    showToast("Server error. Please try again.");
  }
});

function showToast(message) {
  const toast = document.createElement("div");
  toast.classList.add("toast");
  toast.textContent = message;

  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}
