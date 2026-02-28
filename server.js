require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const helmet = require("helmet");
const morgan = require("morgan");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger/swagger");
const connectDB = require("./config/db");
const validateEnv = require("./config/validateEnv");
const logger = require("./config/logger");
const { errorHandler } = require("./middleware/errorHandler");
const sanitizeMiddleware = require("./middleware/sanitize");
const { apiLimiter, authLimiter, passwordResetLimiter } = require("./middleware/rateLimiter");

// Validate environment variables
validateEnv();

// Connect Database
connectDB();

// Routers
const userRoutes = require("./routes/userRoutes");
const procurementRoutes = require("./routes/procurementRoutes");
const salesRoutes = require("./routes/salesRoutes");
const reportsRoutes = require("./routes/reportsRoutes");
const forgotPasswordRoutes = require("./routes/forgotPasswordRoutes");
const resetPasswordRoutes = require("./routes/resetPasswordRoutes");

const app = express();

// Trust proxy (for rate limiting behind reverse proxy)
app.set('trust proxy', 1);

// Security Middleware
app.use(helmet({
  contentSecurityPolicy: false, // Allow inline scripts for frontend
  crossOriginEmbedderPolicy: false
}));

// CORS Configuration
const corsOptions = {
  origin: process.env.CLIENT_URL || "*",
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Body Parser Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Sanitization Middleware
app.use(sanitizeMiddleware);

// Logging Middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', {
    stream: {
      write: (message) => logger.info(message.trim())
    }
  }));
}

// Serve Static Frontend
app.use(express.static(path.join(__dirname, "public")));

// API Documentation
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customSiteTitle: "KGL Groceries API Docs",
    customCss: `
      .swagger-ui .topbar { background-color: #14542f; }
      .swagger-ui .topbar-wrapper img { content: url(''); }
      .swagger-ui .topbar-wrapper::before { content: 'KGL Groceries LTD – API'; color:#fff; font-size:18px; font-weight:700; }
    `,
  }),
);

// API Routes – mount more specific paths first so they are matched before /users
app.use("/users/forgot-password", passwordResetLimiter, forgotPasswordRoutes);
app.use("/users/reset-password", passwordResetLimiter, resetPasswordRoutes);
app.use("/users/login", authLimiter); // Apply auth limiter to login route
app.use("/users", apiLimiter, userRoutes);
app.use("/procurement", apiLimiter, procurementRoutes);
app.use("/sales", apiLimiter, salesRoutes);
app.use("/reports", apiLimiter, reportsRoutes);

// Health Check
app.get("/health", (req, res) =>
  res.json({
    success: true,
    status: "ok",
    env: process.env.NODE_ENV,
    ts: new Date(),
  }),
);

// 404 Handler
app.use((req, res) =>
  res
    .status(404)
    .json({ success: false, message: `Route ${req.originalUrl} not found` }),
);

// Global Error Handler
app.use(errorHandler);

// Start Server
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  logger.info(`KGL Groceries API running on port ${PORT}`, {
    environment: process.env.NODE_ENV,
    port: PORT
  });
  console.log(`\n  KGL Groceries API running on http://localhost:${PORT}`);
  console.log(`  Swagger docs available at http://localhost:${PORT}/api-docs`);
  console.log(`  Security features enabled: Helmet, Rate Limiting, Sanitization\n`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

module.exports = app;
