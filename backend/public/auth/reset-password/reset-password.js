const API_BASE = window.location.origin;

const form = document.getElementById("resetForm");
const strengthDiv = document.getElementById("strength");
const toastContainer = document.getElementById("toastContainer");

// Get email from URL
const params = new URLSearchParams(window.location.search);
const email = params.get("email");

if (!email) {
  showToast("Invalid access. Email missing.");
  setTimeout(() => {
    window.location.href = "../../public/auth/forgot-password/forgot-password.html";
  }, 2000);
}

// Password strength checker
document.getElementById("newPassword").addEventListener("input", function () {
  const value = this.value;

  if (value.length < 6) {
    strengthDiv.textContent = "Weak password";
    strengthDiv.style.color = "red";
  } else if (value.match(/[A-Z]/) && value.match(/[0-9]/)) {
    strengthDiv.textContent = "Strong password";
    strengthDiv.style.color = "green";
  } else {
    strengthDiv.textContent = "Medium strength";
    strengthDiv.style.color = "orange";
  }
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const otp = document.getElementById("otp").value.trim();
  const newPassword = document.getElementById("newPassword").value.trim();

  try {
    const res = await fetch(`${API_BASE}../../public/auth/reset-password/reset-password.html`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp, newPassword })
    });

    const data = await res.json();

    if (!res.ok) {
      showToast(data.message || "Reset failed");
      return;
    }

    showToast("Password reset successful!");

    setTimeout(() => {
      window.location.href = "../../public/auth/login/login.html";
    }, 1500);

  } catch (error) {
    showToast("Server error. Try again.");
  }
});

function showToast(message) {
  const toast = document.createElement("div");
  toast.classList.add("toast");
  toast.textContent = message;

  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 5500);
}
