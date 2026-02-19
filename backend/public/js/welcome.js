const loginBtn = document.getElementById("loginBtn");
const registerBtn = document.getElementById("registerBtn");
const chooseBranchBtn = document.getElementById("chooseBranchBtn");
const branchSection = document.getElementById("branchSection");

loginBtn.onclick = () => {
  window.location.href = "../public/auth/login/login.html";
};

registerBtn.onclick = () => {
  window.location.href = "../public/register.html";
};

chooseBranchBtn.onclick = () => {
  branchSection.classList.remove("hidden");
  branchSection.scrollIntoView({ behavior: "smooth" });
};

document.querySelectorAll(".selectBranchBtn").forEach(button => {
  button.addEventListener("click", (e) => {
    const branch = e.target.closest(".branch-card").dataset.branch;
    localStorage.setItem("selectedBranch", branch);
    window.location.href = "../public/auth/login/login.html";
  });
});
