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

if (user.role === "Staff") {
  window.location.href =
    "/screens/staff/dashboard/dashboard.html";
}
export const isStaff = user?.role === "Staff";

if (!isStaff) {
  window.location.href = "/auth/login.html";
}

app.get("/login", (req, res) => {
  res.sendFile(__dirname + "/frontend/screens/auth/login/login.html");
});
app.get("/register", (req, res) => {
  res.sendFile(__dirname + "/frontend/screens/auth/register/register.html");
});

app.get("/welcome", (req, res) => {
  res.sendFile(__dirname + "/frontend/screens/welcome-branch/welcome-branch.html");
}); 
app.get("/branch-selection", (req, res) => {
  res.sendFile(__dirname + "/frontend/screens/welcome-branch/welcome-branch.html");
});
app.get("/auth/login", (req, res) => {
  res.sendFile(__dirname + "/frontend/screens/auth/login/login.html");
});
app.get("/auth/register", (req, res) => {
  res.sendFile(__dirname + "/frontend/screens/auth/register/register.html");
});
app.get("/auth/welcome", (req, res) => {
  res.sendFile(__dirname + "/frontend/screens/welcome-branch/welcome-branch.html");
});
app.get("/auth/branch-selection", (req, res) => {
  res.sendFile(__dirname + "/frontend/screens/welcome-branch/welcome-branch.html");
});
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/frontend/screens/welcome-branch/welcome-branch.html");
});
app.get("/welcome", (req, res) => {
  res.sendFile(__dirname + "/frontend/screens/welcome-branch/welcome-branch.html");
});
app.get("/branch-selection", (req, res) => {
  res.sendFile(__dirname + "/frontend/screens/welcome-branch/welcome-branch.html");
});
app.get("/auth/welcome", (req, res) => {
  res.sendFile(__dirname + "/frontend/screens/welcome-branch/welcome-branch.html");
});
app.get("/auth/branch-selection", (req, res) => {
  res.sendFile(__dirname + "/frontend/screens/welcome-branch/welcome-branch.html");
});
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/frontend/screens/welcome-branch/welcome-branch.html");
});
