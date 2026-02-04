document.addEventListener("DOMContentLoaded", () => {

  const session = JSON.parse(localStorage.getItem("kgl_current_user"));
  if (!session || session.role !== "Staff") {
    window.location.href = "../../auth/login.html";
    return;
  }

  const form = document.getElementById("inquiryForm");
  const inquiryBody = document.getElementById("inquiryBody");

  let inquiries = JSON.parse(localStorage.getItem("kgl_inquiries")) || [];

  // Display current staff's inquiries
  function renderTable() {
    inquiryBody.innerHTML = "";
    inquiries
      .filter(i => i.staff === session.username)
      .forEach(i => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${i.date}</td>
          <td>${i.subject}</td>
          <td>${i.priority}</td>
          <td>${i.status}</td>
        `;
        inquiryBody.appendChild(row);
      });
  }

  renderTable();

  // Form submission
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const newInquiry = {
      staff: session.username,
      branch: session.branch,
      date: new Date().toLocaleDateString(),
      subject: document.getElementById("subject").value.trim(),
      priority: document.getElementById("priority").value,
      details: document.getElementById("details").value.trim(),
      status: "Pending"
    };

    inquiries.push(newInquiry);
    localStorage.setItem("kgl_inquiries", JSON.stringify(inquiries));

    form.reset();
    renderTable();
    alert("Inquiry submitted successfully!");
  });

  // Back button
  document.getElementById("backDashboard").onclick = () => {
    window.location.href = "../dashboard/staff-dashboard.html";
  };
});
