/* 
   KGL WELCOME & BRANCH SELECTION LOGIC
   This file controls:
   - Branch selection
   - Navigation to login & registration
 */

// Store selected branch (temporary frontend storage)
let selectedBranch = null;

/* 
   DOM ELEMENT REFERENCES
 */
const branchCards = document.querySelectorAll(".branch-card");
const loginBtn = document.getElementById("loginBtn");
const registerBtn = document.getElementById("registerBtn");

/* 
   BRANCH SELECTION HANDLER
   Saves branch choice for later screens
 */
branchCards.forEach((card) => {
  card.addEventListener("click", () => {
    selectedBranch = card.dataset.branch;

    // Save branch to localStorage for use in login/dashboard
    localStorage.setItem("kglSelectedBranch", selectedBranch);

    alert(`You selected ${selectedBranch.toUpperCase()}. Proceed to login.`);
    window.location.href = "../auth/login.html";
  });
});

/* 
   AUTH NAVIGATION
 */
loginBtn.addEventListener("click", () => {
  window.location.href = "../auth/login.html";
});

registerBtn.addEventListener("click", () => {
  window.location.href = "../auth/register.html";
});
