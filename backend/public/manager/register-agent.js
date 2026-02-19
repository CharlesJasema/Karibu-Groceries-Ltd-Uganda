/* 
   REGISTER SALES AGENT (Manager Only)
    */

const API_BASE = "http://localhost:3000";

const form = document.getElementById("agentRegisterForm");

// AUTH GUARD (Manager Only)
(function protectManagerRoute() {
  const token = localStorage.getItem("accessToken");
  const role = localStorage.getItem("userRole");

  if (!token || role !== "Manager") {
    alert("Access denied. Managers only.");
    localStorage.clear();
    window.location.href = "../../public/auth/login/login.html";
  }
})();

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("agentName").value.trim();
  const email = document.getElementById("agentEmail").value.trim();
  const password = document.getElementById("agentPassword").value.trim();

  if (!name || !email || !password) {
    showToast("All fields are required", "error");
    return;
  }

  const submitBtn = form.querySelector("button");
  submitBtn.disabled = true;
  submitBtn.textContent = "Creating...";

  try {
    const res = await fetch(`${API_BASE}/users/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
      body: JSON.stringify({
        name,
        email,
        password,
        role: "SalesAgent", // MUST MATCH BACKEND ENUM
      }),
    });

    const data = await res.json();

    if (res.status === 401) {
      showToast("Session expired. Please login again.", "error");
      localStorage.clear();
      setTimeout(() => {
        window.location.href = "../../public/auth/login/login.html";
      }, 1500);
      return;
    }

    if (res.status === 403) {
      showToast("Only Managers can create agents.", "error");
      return;
    }

    if (!res.ok) {
      showToast(data.message || "Failed to create agent", "error");
      return;
    }

    showToast("Sales Agent created successfully!", "success");

    form.reset();
  } catch (error) {
    console.error("Register Agent Error:", error);
    showToast("Server error. Please try again.", "error");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Create Agent";
  }
});

/* 
   TOAST SYSTEM
    */

function showToast(message, type = "info") {
  let container = document.getElementById("toastContainer");

  if (!container) {
    container = document.createElement("div");
    container.id = "toastContainer";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.textContent = message;

  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}
