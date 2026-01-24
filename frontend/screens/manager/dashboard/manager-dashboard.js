/* 
   MANAGER DASHBOARD LOGIC
   Handles:
   - Authentication check
   - Real-time refresh placeholders
   - Navigation logic
 */

// Simple role validation (placeholder)
const role = localStorage.getItem("userRole");

if (role !== "manager") {
  alert("Access denied. Managers only.");
  window.location.href = "../../auth/login.html";
}

// Logout functionality
document.querySelector(".btn-logout").addEventListener("click", () => {
  localStorage.clear();
  window.location.href = "../../auth/login.html";
});

// Placeholder for real-time updates
setInterval(() => {
  console.log("Refreshing dashboard analytics...");
}, 5000);
