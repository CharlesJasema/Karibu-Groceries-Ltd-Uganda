const BASE_URL = "http://localhost:3000";

async function recordProcurement() {
  const data = {
    produceName: document.getElementById("produceName").value.trim(),
    produceType: document.getElementById("produceType").value.trim(),
    date: document.getElementById("date").value,
    time: document.getElementById("time").value,
    tonnage: Number(document.getElementById("tonnage").value),
    cost: Number(document.getElementById("cost").value),
    dealerName: document.getElementById("dealerName").value.trim(),
    branch: document.getElementById("branch").value,
    contact: document.getElementById("contact").value.trim(),
    sellingPrice: Number(document.getElementById("sellingPrice").value),
  };

  try {
    const response = await fetch(`${BASE_URL}/procurement`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: localStorage.getItem("token"),
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (response.status === 201) {
      alert("Procurement recorded successfully");
      location.reload();
    } else {
      alert(result.message);
    }
  } catch (error) {
    alert("Error connecting to server");
  }
}
