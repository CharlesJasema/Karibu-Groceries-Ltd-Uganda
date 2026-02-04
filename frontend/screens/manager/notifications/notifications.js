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

/*
  FUTURE ENHANCEMENTS:
  - WebSocket real-time push
  - Sound alerts for critical notifications
  - Snooze notifications
  - Archive history
*/
