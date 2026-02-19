async function recordCashSale() {

    const data = {
        produceName: document.getElementById("produceName").value,
        tonnage: Number(document.getElementById("tonnage").value),
        amountPaid: Number(document.getElementById("amountPaid").value),
        buyerName: document.getElementById("buyerName").value,
        salesAgentName: document.getElementById("salesAgentName").value,
        date: document.getElementById("date").value,
        time: document.getElementById("time").value
    };

    await fetch("http://localhost:3000/sales/cash", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": localStorage.getItem("token")
        },
        body: JSON.stringify(data)
    });

    alert("Cash sale recorded");
}
