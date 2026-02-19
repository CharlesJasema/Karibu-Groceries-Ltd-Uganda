require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");

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
   GLOBAL SECURITY MIDDLEWARE
 */

// Security headers
app.use(helmet());

// CORS configuration (adjust origin in production)
app.use(
  cors({
    origin: "http://localhost:3000", // Change to frontend domain in production
    credentials: true,
  }),
);

// Body parser
app.use(express.json());

// Static files
app.use(express.static("public"));

/* 
   RATE LIMITING
 */

// Global API limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP
  message: "Too many requests, please try again later.",
});

app.use(apiLimiter);

// Strict limiter for login (anti brute-force)
// const loginLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   max: 5,
//   message: "Too many login attempts. Try again after 15 minutes.",
// });

// Apply login limiter only to login route
// app.use("/users/login", loginLimiter);

/* 
   ROUTES
 */

app.use("/users", userRoutes);
app.use("/procurement", procurementRoutes);
app.use("/sales", salesRoutes);

/* 
   SWAGGER DOCUMENTATION
 */
// app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

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
   GLOBAL ERROR HANDLER
 */
app.use((err, req, res, next) => {
  console.error(" Error:", err.message);
  res.status(500).json({
    success: false,
    message: "Server error",
  });
});

/* 
   START SERVER
 */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(` Server running on port ${PORT}`));
