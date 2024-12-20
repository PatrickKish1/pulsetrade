const createError = require('http-errors');

const errorHandler = {
  // Convert thrown errors to API responses
  apiErrorHandler: (err, req, res, next) => {
    // Log error for internal tracking
    console.error('API Error:', {
      error: err,
      path: req.path,
      method: req.method,
      body: req.body,
      params: req.params,
      query: req.query,
      timestamp: new Date().toISOString()
    });

    // Handle specific error types
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        error: 'Validation Error',
        details: err.details
      });
    }

    if (err.name === 'RateLimitError') {
      return res.status(429).json({
        error: 'Rate Limit Exceeded',
        message: err.message
      });
    }

    if (err.name === 'MarketDataError') {
      return res.status(503).json({
        error: 'Market Data Service Unavailable',
        message: err.message
      });
    }

    // Default error response
    res.status(err.status || 500).json({
      error: err.message || 'Internal Server Error',
      requestId: req.id
    });
  },

  // Not Found handler
  notFoundHandler: (req, res, next) => {
    next(createError(404, 'Endpoint not found'));
  }
};

module.exports = errorHandler;