/* 
   STOCK INVENTORY TRENDS LOGIC
   This file:
   - Simulates inventory trend data
   - Renders basic charts (canvas placeholders)
   - Responds to filter changes
 */

const lineCanvas = document.getElementById("lineChart");
const barCanvas = document.getElementById("barChart");

const lineCtx = lineCanvas.getContext("2d");
const barCtx = barCanvas.getContext("2d");

/* 
   SIMPLE LINE CHART PLACEHOLDER
   (Will be replaced by Chart.js later)
 */
function drawLineChart() {
  lineCtx.clearRect(0, 0, lineCanvas.width, lineCanvas.height);
  lineCtx.beginPath();
  lineCtx.moveTo(20, 250);
  lineCtx.lineTo(80, 200);
  lineCtx.lineTo(140, 180);
  lineCtx.lineTo(200, 140);
  lineCtx.lineTo(260, 120);
  lineCtx.strokeStyle = "#0b6623";
  lineCtx.lineWidth = 3;
  lineCtx.stroke();
}

/* 
   SIMPLE BAR CHART PLACEHOLDER
 */
function drawBarChart() {
  barCtx.clearRect(0, 0, barCanvas.width, barCanvas.height);
  barCtx.fillStyle = "#ff9800";

  barCtx.fillRect(50, 150, 40, 100); // Beans
  barCtx.fillRect(120, 100, 40, 150); // Maize
  barCtx.fillRect(190, 180, 40, 70); // Tomatoes
  barCtx.fillRect(260, 130, 40, 120); // Rice
}

/* 
   INITIAL RENDER
 */
drawLineChart();
drawBarChart();

/* 
   FILTER EVENT LISTENERS
 */
document.querySelectorAll(".filters select").forEach((select) => {
  select.addEventListener("change", () => {
    console.log("Filters changed - reloading chart data...");
    drawLineChart();
    drawBarChart();
  });
});
