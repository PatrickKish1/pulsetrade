// middleware/rateLimiter.js
const rateLimit = require('express-rate-limit');

// Create rate limiter middleware
const createRateLimiter = (options = {}) => {
  const defaultOptions = {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false
  };

  return rateLimit({
    ...defaultOptions,
    ...options
  });
};

// Export middleware instances
module.exports = {
  // Standard rate limit for general endpoints
  standard: createRateLimiter(),
  
  // Rate limit for market data endpoints
  market: createRateLimiter({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 50 // 50 requests per 5 minutes
  }),
  
  // Rate limit for chat endpoints
  chat: createRateLimiter({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 10 // 10 requests per minute
  })
};