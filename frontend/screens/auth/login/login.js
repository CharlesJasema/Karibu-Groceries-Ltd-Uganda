/* 
   KGL LOGIN LOGIC (Mock Authentication)
    */

document.addEventListener("DOMContentLoaded", () => {

  /* 
     STEP 1: CREATE DEFAULT USER
      */

if (user.role === "manager") {
  window.location.href = "../../screens/manager/dashboard/dashboard.html";
} else if (user.role === "staff") {
  window.location.href = "../../screens/staff/dashboard/dashboard.html";
} else {
  window.location.href = "../../screens/client/home/home.html";
}


  if (!localStorage.getItem("kgl_users")) {
    const defaultUsers = [
      {
        username: "kgl_admin",
        password: "groceries2026",
        role: "manager"
      }
    ];
    localStorage.setItem("kgl_users", JSON.stringify(defaultUsers));
  }

});

const form = document.getElementById("loginForm");

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  /* 
     VALIDATION
      */
  if (!username || !password) {
    showToast("Please enter both username and password.", "error");
    return;
  }

  const users = JSON.parse(localStorage.getItem("kgl_users"));
  const user = users.find(u => u.username === username);

  if (!user) {
    showToast("Username does not exist.", "error");
    return;
  }

  if (user.password !== password) {
    showToast("Incorrect password. Please try again.", "error");
    return;
  }

  /* 
     SUCCESS LOGIN
      */
  localStorage.setItem("kgl_current_user", JSON.stringify(user));
  localStorage.setItem("kgl_user_role", user.role);

  showToast("Login successful. Redirecting...", "success");

  setTimeout(() => {
    window.location.href = "../../screens/manager/dashboard/dashboard.html";
  }, 1200);
});

/* 
   TOAST FUNCTION
    */
function showToast(message, type) {
  const container = document.getElementById("toastContainer");
  const toast = document.createElement("div");

  toast.className = `toast ${type}`;
  toast.textContent = message;

  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}
