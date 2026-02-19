const API_BASE = window.location.origin;

const form = document.getElementById("forgotForm");
const toastContainer = document.getElementById("toastContainer");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();

  try {
    const res = await fetch(`${API_BASE}../../public/auth/forgot-password/forgot-password.html`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });

    const data = await res.json();

    if (!res.ok) {
      showToast(data.message || "Something went wrong");
      return;
    }

    showToast("OTP sent successfully!");

    setTimeout(() => {
      window.location.href = `../../public/auth/reset-password/reset-password.html?email=${email}`;
    }, 1500);

  } catch (error) {
    showToast("Server error. Try again.");
  }
});

function showToast(message) {
  const toast = document.createElement("div");
  toast.classList.add("toast");
  toast.innerText = message;

  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 5500);
}
