require('dotenv').config();

module.exports = {
  yahooFinance: {
    apiKey: process.env.YAHOO_FINANCE_API_KEY,
    baseUrl: 'https://yfapi.net/v8',
    timeout: 30000,
    retryAttempts: 3,
    retryDelay: 1000,
    rateLimit: {
      maxRequests: 100,
      perTimeWindow: '1m'
    }
  },
  alphaVantage: {
    apiKey: process.env.ALPHA_VANTAGE_API_KEY,
    baseUrl: 'https://www.alphavantage.co/query',
    timeout: 30000,
    retryAttempts: 3,
    retryDelay: 1000,
    rateLimit: {
      maxRequests: 5,
      perTimeWindow: '1m'
    }
  },
  cache: {
    ttl: 10000, // 10 seconds
    checkPeriod: 600
  }
};