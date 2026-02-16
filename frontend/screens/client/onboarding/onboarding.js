function registerClient() {

    const fullName = document.getElementById("fullName").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const password = document.getElementById("password").value;
    const branch = document.getElementById("branch").value;

    if (!fullName || !phone || !password || !branch) {
        showToast("All fields are required", "error");
        return;
    }

    let clients = JSON.parse(localStorage.getItem("kglClients")) || [];

    const exists = clients.find(c => c.phone === phone);
    if (exists) {
        showToast("Client already registered", "error");
        return;
    }

    const newClient = {
        id: "CL" + Date.now(),
        fullName,
        phone,
        password,
        branch,
        creditBalance: 0,
        createdAt: new Date().toISOString()
    };

    clients.push(newClient);
    localStorage.setItem("kglClients", JSON.stringify(clients));

    trackActivity("New client registered: " + fullName);
    showToast("Registration successful", "success");

    setTimeout(() => {
        window.location.href = "../../auth/login/login.html";
    }, 1500);
}
