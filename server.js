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
const paymentRoutes = require("./routes/paymentRoutes");
const reportsRoutes = require("./routes/reportsRoutes");
const forgotPasswordRoutes = require("./routes/forgotPasswordRoutes");
const resetPasswordRoutes = require("./routes/resetPasswordRoutes");
const profileRoutes = require("./routes/profileRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const auditRoutes = require("./routes/auditRoutes");

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

// Body Parser Middleware with error handling
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Handle JSON parsing errors
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    console.error('JSON Parse Error:', err.message);
    return res.status(400).json({
      success: false,
      message: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
  next(err);
});

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

// API Routes – mount BEFORE static files so API takes precedence
app.use("/users/forgot-password", passwordResetLimiter, forgotPasswordRoutes);
app.use("/users/reset-password", passwordResetLimiter, resetPasswordRoutes);
app.use("/users", apiLimiter, userRoutes);
app.use("/profile", apiLimiter, profileRoutes);
app.use("/notifications", apiLimiter, notificationRoutes);
app.use("/audit-logs", apiLimiter, auditRoutes);
app.use("/procurement", apiLimiter, procurementRoutes);
app.use("/sales", apiLimiter, salesRoutes);
app.use("/payments", apiLimiter, paymentRoutes);
app.use("/reports", apiLimiter, reportsRoutes);

// Health Check with MongoDB status
app.get("/health", async (req, res) => {
  const mongoose = require('mongoose');
  
  const healthCheck = {
    success: true,
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    uptime: process.uptime(),
    database: {
      status: "disconnected",
      name: null,
      host: null
    }
  };

  // Check MongoDB connection
  try {
    if (mongoose.connection.readyState === 1) {
      healthCheck.database.status = "connected";
      healthCheck.database.name = mongoose.connection.name;
      healthCheck.database.host = mongoose.connection.host;
    } else if (mongoose.connection.readyState === 2) {
      healthCheck.database.status = "connecting";
      healthCheck.status = "degraded";
    } else {
      healthCheck.database.status = "disconnected";
      healthCheck.status = "degraded";
      healthCheck.success = false;
    }
  } catch (error) {
    healthCheck.database.status = "error";
    healthCheck.database.error = error.message;
    healthCheck.status = "unhealthy";
    healthCheck.success = false;
  }

  const statusCode = healthCheck.success ? 200 : 503;
  res.status(statusCode).json(healthCheck);
});

// Serve Static Frontend AFTER API routes
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

// 404 Handler
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
