const header = `
<header class="kgl-header flex space-between">
  <h2>Karibu Groceries Ltd</h2>
  <div class="user">
    <span id="userName"></span>
    <button class="kgl-btn">Logout</button>
  </div>
</header>
`;

document.querySelector(".kgl-main").insertAdjacentHTML("afterbegin", header);
