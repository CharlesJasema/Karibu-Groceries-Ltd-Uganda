require("dotenv").config();

const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");

const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger/swagger");

const userRoutes = require("./routes/userRoutes");
const procurementRoutes = require("./routes/procurementRoutes");
const salesRoutes = require("./routes/salesRoutes");

/* 
   CONNECT DATABASE
 */
connectDB();

const app = express();

/* 
   MIDDLEWARE
 */
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

/* 
   ROUTES
 */
app.use("/users", userRoutes);
app.use("/procurement", procurementRoutes);
app.use("/sales", salesRoutes);

/* 
   SWAGGER
 */
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/* 
   404 HANDLER
 */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

/* 
   START SERVER
 */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
