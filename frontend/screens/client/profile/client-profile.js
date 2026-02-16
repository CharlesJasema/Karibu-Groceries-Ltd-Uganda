/* 
KGL CLIENT PROFILE MODULE
 */

const session = JSON.parse(localStorage.getItem("kgl_session"));
let clients = JSON.parse(localStorage.getItem("kglClients")) || [];

if (!session || session.role !== "client") {
    window.location.href = "../../auth/login/login.html";
}

const currentClient = clients.find(c => c.phone === session.phone);

if (!currentClient) {
    showToast("Client not found", "error");
}

/* 
LOAD PROFILE DATA
 */

document.getElementById("clientName").textContent =
    currentClient.fullName;

document.getElementById("clientBranch").textContent =
    currentClient.branch;

document.getElementById("creditBalance").textContent =
    "UGX " + currentClient.creditBalance.toLocaleString();

/* 
UPDATE PROFILE
 */

function updateProfile() {

    const newPhone = document.getElementById("editPhone").value.trim();
    const newPassword = document.getElementById("editPassword").value.trim();

    if (!newPhone && !newPassword) {
        showToast("Nothing to update", "error");
        return;
    }

    const index = clients.findIndex(c => c.phone === session.phone);

    if (newPhone) {
        clients[index].phone = newPhone;
        session.phone = newPhone;
    }

    if (newPassword) {
        clients[index].password = newPassword;
    }

    localStorage.setItem("kglClients", JSON.stringify(clients));
    localStorage.setItem("kgl_session", JSON.stringify(session));

    trackActivity("Client updated profile: " + currentClient.fullName);
    showToast("Profile updated successfully", "success");

    setTimeout(() => {
        location.reload();
    }, 1200);
}

/* 
NAVIGATION
*/

function goDashboard(){
    window.location.href = "../dashboard/client-dashboard.html";
}
