/*
  STAFF PROFILE LOGIC
  - Controlled updates
  - Password validation
  - Secure logout
*/

document.addEventListener("DOMContentLoaded", () => {

  const session = JSON.parse(localStorage.getItem("kgl_current_user"));
  if (!session || session.role !== "Staff") {
    window.location.href = "../../auth/login.html";
    return;
  }

  const users = JSON.parse(localStorage.getItem("kgl_users")) || [];
  const userIndex = users.findIndex(u => u.username === session.username);

  const profileName = document.getElementById("profileName");
  const profileMeta = document.getElementById("profileMeta");
  const fullNameInput = document.getElementById("fullName");
  const phoneInput = document.getElementById("phone");

  profileName.textContent = users[userIndex].name || session.username;
  profileMeta.textContent = `${session.role} | ${session.branch}`;

  fullNameInput.value = users[userIndex].name || "";
  phoneInput.value = users[userIndex].phone || "";

  // Update profile info
  document.getElementById("profileForm").onsubmit = (e) => {
    e.preventDefault();

    users[userIndex].name = fullNameInput.value.trim();
    users[userIndex].phone = phoneInput.value.trim();

    localStorage.setItem("kgl_users", JSON.stringify(users));
    alert("Profile updated successfully!");
  };

  // Change password
  document.getElementById("passwordForm").onsubmit = (e) => {
    e.preventDefault();

    const newPass = document.getElementById("newPassword").value;
    const confirmPass = document.getElementById("confirmPassword").value;

    if (newPass.length < 6) {
      alert("Password must be at least 6 characters.");
      return;
    }

    if (newPass !== confirmPass) {
      alert("Passwords do not match.");
      return;
    }

    users[userIndex].password = newPass;
    localStorage.setItem("kgl_users", JSON.stringify(users));

    alert("Password updated successfully!");
    e.target.reset();
  };

  // Logout
  document.getElementById("logoutBtn").onclick = () => {
    localStorage.removeItem("kgl_current_user");
    window.location.href = "../../auth/login.html";
  };

  document.getElementById("backDashboard").onclick = () => {
    window.location.href = "../dashboard/staff-dashboard.html";
  };
});
