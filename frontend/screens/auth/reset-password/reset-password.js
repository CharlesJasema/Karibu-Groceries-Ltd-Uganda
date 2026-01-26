const passwordInput = document.getElementById("newPassword");
const strength = document.getElementById("strength");

passwordInput.addEventListener("input", () => {
  const val = passwordInput.value;
  if (val.length < 6) {
    strength.textContent = "Weak password";
    strength.style.color = "red";
  } else if (val.length < 10) {
    strength.textContent = "Medium strength";
    strength.style.color = "orange";
  } else {
    strength.textContent = "Strong password";
    strength.style.color = "green";
  }
});

document.getElementById("resetBtn").addEventListener("click", () => {

  const enteredOtp = document.getElementById("otp").value;
  const newPassword = passwordInput.value;

  const storedOtp = localStorage.getItem("kgl_otp");
  const username = localStorage.getItem("kgl_otp_user");
  const users = JSON.parse(localStorage.getItem("kgl_users"));

  if (enteredOtp !== storedOtp) {
    showToast("Invalid OTP.", "error");
    return;
  }

  const userIndex = users.findIndex(u => u.username === username);
  users[userIndex].password = newPassword;

  localStorage.setItem("kgl_users", JSON.stringify(users));

  localStorage.removeItem("kgl_otp");
  localStorage.removeItem("kgl_otp_user");

  showToast("Password reset successful.", "success");

  setTimeout(() => {
    window.location.href = "../login/login.html";
  }, 1500);
});

function showToast(msg, type) {
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}
