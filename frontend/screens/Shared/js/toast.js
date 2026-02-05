/* 
  KGL TOAST UTILITY
  Usage: showToast("Message", "success")
*/

function showToast(message, type = "success") {
  const toast = document.createElement("div");
  toast.className = `kgl-toast ${type}`;
  toast.innerText = message;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}

// Make globally accessible
window.showToast = showToast;
