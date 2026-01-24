/* 
   BRANCH PERFORMANCE COMPARISON LOGIC
   - Visual comparison placeholder
   - Ready for backend integration
 */

const canvas = document.getElementById("comparisonChart");
const ctx = canvas.getContext("2d");

/*
   SIMPLE BAR CHART PLACEHOLDER
 */
function drawComparisonChart() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Branch A
  ctx.fillStyle = "#0b6623";
  ctx.fillRect(60, 120, 40, 160); // Sales
  ctx.fillRect(60, 200, 40, 80); // Procurement
  ctx.fillRect(60, 240, 40, 40); // Credit

  // Branch B
  ctx.fillStyle = "#ff9800";
  ctx.fillRect(160, 150, 40, 130);
  ctx.fillRect(160, 210, 40, 70);
  ctx.fillRect(160, 230, 40, 50);
}

drawComparisonChart();
