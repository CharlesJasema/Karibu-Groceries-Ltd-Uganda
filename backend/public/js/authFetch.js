const API_BASE = "http://localhost:3000";

async function authFetch(url, options = {}) {
  const accessToken = localStorage.getItem("accessToken");

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${accessToken}`,
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers,
  });

  // If token expired or invalid
  if (response.status === 401) {
    localStorage.clear();
    alert("Session expired. Please login again.");
    window.location.href = "../../public/auth/login/login.html";
    return;
  }

  return response;
}
