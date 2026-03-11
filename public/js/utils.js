/**
 * KGL Groceries - Shared Utilities
 */

// API Base URL
const API_BASE_URL = "";
const API_BASE = "";

// Get auth token
function getToken() {
  return localStorage.getItem("kgl_token");
}

// Get current user
function getUser() {
  try {
    return JSON.parse(localStorage.getItem("kgl_user") || "{}");
  } catch {
    return {};
  }
}

// Check authentication
function checkAuth(requiredRole = null) {
  const token = getToken();
  const user = getUser();

  if (!token || !user.role) {
    window.location.href = "/auth/login.html";
    return false;
  }

  if (requiredRole && user.role !== requiredRole) {
    window.location.href = "/auth/login.html";
    return false;
  }

  return true;
}

// Logout function
function logout() {
  localStorage.clear();
  window.location.href = "/index.html";
}

// Format currency
function formatCurrency(amount) {
  return new Intl.NumberFormat("en-UG", {
    style: "decimal",
    maximumFractionDigits: 0,
  }).format(amount || 0);
}

// Format date
function formatDate(dateString) {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// Format datetime
function formatDateTime(dateString) {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Show toast notification
function showToast(message, type = "info") {
  const toast = document.createElement("div");
  toast.className = `alert alert-${type}`;
  toast.textContent = message;
  toast.style.position = "fixed";
  toast.style.top = "20px";
  toast.style.right = "20px";
  toast.style.zIndex = "10000";
  toast.style.minWidth = "300px";
  toast.style.animation = "fadeInDown 0.3s ease";

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = "fadeOut 0.3s ease";
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// API request helper
async function apiRequest(endpoint, options = {}) {
  const token = getToken();

  const defaultOptions = {
    method: 'GET',
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    if (response.status === 401) {
      logout();
    }
    throw new Error(data.message || "Request failed");
  }

  return data;
}

// Loading state helper
function setLoading(button, isLoading, originalText = "Submit") {
  if (isLoading) {
    button.disabled = true;
    button.dataset.originalText = button.textContent;
    button.textContent = "Loading...";
  } else {
    button.disabled = false;
    button.textContent = button.dataset.originalText || originalText;
  }
}

// Validate form
function validateForm(formId) {
  const form = document.getElementById(formId);
  if (!form) return false;

  const inputs = form.querySelectorAll(
    "input[required], select[required], textarea[required]",
  );
  let isValid = true;

  inputs.forEach((input) => {
    if (!input.value.trim()) {
      input.style.borderColor = "var(--danger)";
      isValid = false;
    } else {
      input.style.borderColor = "";
    }
  });

  return isValid;
}

// Clear form
function clearForm(formId) {
  const form = document.getElementById(formId);
  if (form) {
    form.reset();
  }
}

// Get status badge class
function getStatusBadge(status) {
  const statusMap = {
    active: "badge-success",
    paid: "badge-success",
    completed: "badge-success",
    pending: "badge-warning",
    overdue: "badge-danger",
    unpaid: "badge-danger",
    inactive: "badge-default",
    "low-stock": "badge-warning",
    "out-of-stock": "badge-danger",
    "in-stock": "badge-success",
  };

  return statusMap[status?.toLowerCase()] || "badge-default";
}

// Debounce function
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Export for use in other scripts
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    getToken,
    getUser,
    checkAuth,
    logout,
    formatCurrency,
    formatDate,
    formatDateTime,
    showToast,
    apiRequest,
    setLoading,
    validateForm,
    clearForm,
    getStatusBadge,
    debounce,
  };
}
