const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");

/**
 * Sanitization middleware to prevent injection attacks
 */
const sanitizeMiddleware = [
  // Prevent NoSQL injection
  mongoSanitize({
    replaceWith: "_",
    onSanitize: ({ req, key }) => {
      console.warn(`Sanitized NoSQL injection attempt: ${key} from ${req.ip}`);
    },
  }),

  // Prevent XSS attacks
  xss(),
];

module.exports = sanitizeMiddleware;
