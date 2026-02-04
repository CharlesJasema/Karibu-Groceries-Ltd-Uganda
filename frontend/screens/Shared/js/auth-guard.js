const user = JSON.parse(localStorage.getItem("kglUser"));

if (!user) {
  window.location.href = "/auth/login.html";
}

export const isManager = user?.role === "manager";

if (user.role !== "Staff") {
  window.location.href = "/auth/login.html";
}
export const isStaff = user?.role === "Staff";
if (!isStaff) {
  window.location.href = "/auth/login.html";
}
export const isAdmin = user?.role === "admin";
if (!isAdmin) {
  window.location.href = "/auth/login.html";
}
export const isDashboard = window.location.pathname.includes("dashboard");
export const isWelcome = window.location.pathname.includes("welcome");
export const isLogin = window.location.pathname.includes("login");
export const isRegister = window.location.pathname.includes("register"); 
export const isAuthPage = isLogin || isRegister;
export const isAuthenticated = !!user;

if (!isAuthenticated && !isAuthPage) {
  window.location.href = "/auth/login.html";
}
if (isAuthenticated && isAuthPage) {
  window.location.href = "/dashboard/dashboard.html";
}

