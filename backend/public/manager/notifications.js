/* 
   MANAGER NOTIFICATION CENTER
   - Real-time ready
*/

/*
  Each alert can be:
  - Marked as read
  - Dismissed
  - Acted upon (restock, contact, view)
*/

document.querySelectorAll(".btn-dismiss").forEach((button) => {
  button.addEventListener("click", (e) => {
    const alertCard = e.target.closest(".alert");
    alertCard.style.display = "none";
  });
});

document.querySelectorAll(".btn-action").forEach((button) => {
  button.addEventListener("click", () => {
    alert("Quick action triggered (backend integration pending)");
  });
});

const list = document.getElementById("notificationList");

function loadNotifications() {
  const notifications =
    JSON.parse(localStorage.getItem("kgl_notifications")) || [];

  list.innerHTML = "";

  notifications.forEach((note) => {
    const item = document.createElement("div");
    item.className = `notification ${note.urgency}`;

    item.innerHTML = `
      <h4>${note.title}</h4>
      <p>${note.message}</p>
      <small>${new Date(note.timestamp).toLocaleString()}</small>
      <button onclick="markRead(${note.id})">Mark Read</button>
    `;

    list.appendChild(item);
  });
}

function markRead(id) {
  const notifications =
    JSON.parse(localStorage.getItem("kgl_notifications")) || [];

  const updated = notifications.map((n) =>
    n.id === id ? { ...n, read: true } : n,
  );

  localStorage.setItem("kgl_notifications", JSON.stringify(updated));

  loadNotifications();
}

loadNotifications();
setInterval(loadNotifications, 4000);
