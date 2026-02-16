async function recordCreditSale() {
  const data = {
    buyerName: document.getElementById("buyerName").value,
    nationalId: document.getElementById("nationalId").value,
    location: document.getElementById("location").value,
    contacts: document.getElementById("contacts").value,
    amountDue: Number(document.getElementById("amountDue").value),
    salesAgentName: document.getElementById("salesAgentName").value,
    dueDate: document.getElementById("dueDate").value,
    produceName: document.getElementById("produceName").value,
    produceType: document.getElementById("produceType").value,
    tonnage: Number(document.getElementById("tonnage").value),
    dispatchDate: document.getElementById("dispatchDate").value,
  };

  await fetch("http://localhost:3000/sales/credit", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: localStorage.getItem("token"),
    },
    body: JSON.stringify(data),
  });

  alert("Credit sale recorded");
}
