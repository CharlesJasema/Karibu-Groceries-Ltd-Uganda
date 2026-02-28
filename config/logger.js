const fs = require("fs");
const path = require("path");

// Ensure logs directory exists
const logsDir = path.join(__dirname, "../logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const logLevels = {
  ERROR: "ERROR",
  WARN: "WARN",
  INFO: "INFO",
  DEBUG: "DEBUG",
};

class Logger {
  constructor() {
    this.logFile = path.join(logsDir, "app.log");
    this.errorFile = path.join(logsDir, "error.log");
  }

  formatMessage(level, message, meta = {}) {
    return (
      JSON.stringify({
        timestamp: new Date().toISOString(),
        level,
        message,
        ...meta,
      }) + "\n"
    );
  }

  writeToFile(file, content) {
    fs.appendFileSync(file, content, "utf8");
  }

  log(level, message, meta = {}) {
    const formattedMessage = this.formatMessage(level, message, meta);

    // Write to console in development
    if (process.env.NODE_ENV !== "production") {
      console.log(formattedMessage.trim());
    }

    // Write to file
    this.writeToFile(this.logFile, formattedMessage);

    // Write errors to separate file
    if (level === logLevels.ERROR) {
      this.writeToFile(this.errorFile, formattedMessage);
    }
  }

  error(message, meta) {
    this.log(logLevels.ERROR, message, meta);
  }

  warn(message, meta) {
    this.log(logLevels.WARN, message, meta);
  }

  info(message, meta) {
    this.log(logLevels.INFO, message, meta);
  }

  debug(message, meta) {
    if (process.env.NODE_ENV !== "production") {
      this.log(logLevels.DEBUG, message, meta);
    }
  }
}

module.exports = new Logger();
