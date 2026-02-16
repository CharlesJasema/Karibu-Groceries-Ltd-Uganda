const BASE_URL = "http://localhost:3000";

async function login() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!email || !password) {
    alert("Please fill all fields");
    return;
  }

  try {
    const response = await fetch(`${BASE_URL}/users/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.status === 200) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);

      if (data.role === "Manager") {
        window.location.href = "../../manager/dashboard/dashboard.html";
      } else {
        window.location.href = "../../staff/dashboard/dashboard.html";
      }
    } else {
      alert(data.message);
    }
  } catch (error) {
    alert("Server error. Is backend running?");
  }
}
