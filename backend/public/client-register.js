const API_BASE = "http://localhost:3000";

const form = document.getElementById("registerForm");
const toastContainer = document.getElementById("toastContainer");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!name || !email || !password) {
    showToast("All fields are required");
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/users/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email,
        password,
        role: "Client", // 🔥 IMPORTANT
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      showToast(data.message || "Registration failed");
      return;
    }

    showToast("Registration successful! Redirecting...");

    setTimeout(() => {
      window.location.href = "login.html";
    }, 1500);
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
