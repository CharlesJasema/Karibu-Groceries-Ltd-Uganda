document.getElementById("sendOtpBtn").addEventListener("click", () => {

  const username = document.getElementById("username").value.trim();
  const users = JSON.parse(localStorage.getItem("kgl_users"));

  if (!username) {
    showToast("Please enter your username.", "error");
    return;
  }

  const user = users.find(u => u.username === username);

  if (!user) {
    showToast("Username not found.", "error");
    return;
  }

  // Generate mock OTP
  const otp = Math.floor(100000 + Math.random() * 900000);

  localStorage.setItem("kgl_otp", otp);
  localStorage.setItem("kgl_otp_user", username);

  console.log("OTP (Mock):", otp); // simulate SMS/email

  showToast("OTP sent successfully.", "success");

  setTimeout(() => {
    window.location.href = "../reset-password/reset-password.html";
  }, 1200);
});

function showToast(msg, type) {
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}
