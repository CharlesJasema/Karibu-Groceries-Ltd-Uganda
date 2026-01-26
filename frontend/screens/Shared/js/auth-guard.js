const user = JSON.parse(localStorage.getItem("kglUser"));

if (!user) {
  window.location.href = "/auth/login.html";
}

export const isManager = user?.role === "manager";
