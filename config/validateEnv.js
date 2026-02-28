/**
 * Validates required environment variables on startup
 */
const requiredEnvVars = ["DATABASE_URI", "JWT_SECRET", "PORT", "NODE_ENV"];

const validateEnv = () => {
  const missing = [];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missing.push(envVar);
    }
  }

  if (missing.length > 0) {
    console.error("FATAL: Missing required environment variables:");
    missing.forEach((v) => console.error(`   - ${v}`));
    console.error(
      "\nPlease check your .env file and ensure all required variables are set.",
    );
    process.exit(1);
  }

  // Validate JWT_SECRET strength
  if (process.env.JWT_SECRET.length < 32) {
    console.warn(
      "WARNING: JWT_SECRET should be at least 32 characters for security.",
    );
  }

  // Validate NODE_ENV
  const validEnvs = ["development", "production", "test"];
  if (!validEnvs.includes(process.env.NODE_ENV)) {
    console.warn(`WARNING: NODE_ENV should be one of: ${validEnvs.join(", ")}`);
  }

  console.log("Environment variables validated successfully");
};

module.exports = validateEnv;
