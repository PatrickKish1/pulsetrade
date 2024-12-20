// polygon-config.js
require('dotenv').config();

/**
 * Market types supported by Polygon API
 * @readonly
 * @enum {string}
 */
const MARKET_TYPES = {
  STOCKS: 'stocks',
  CRYPTO: 'crypto',
  FOREX: 'forex',
  OPTIONS: 'options'
};

/**
 * Timeframe intervals supported by Polygon API
 * @readonly
 * @enum {string}
 */
const TIMEFRAMES = {
  MINUTE: '1/minute',
  MINUTE_5: '5/minute',
  MINUTE_15: '15/minute',
  MINUTE_30: '30/minute',
  HOUR: '1/hour',
  HOUR_4: '4/hour',
  DAY: '1/day',
  WEEK: '1/week',
  MONTH: '1/month'
};

/**
 * Symbol prefixes for different market types
 * @readonly
 * @enum {string}
 */
const SYMBOL_PREFIXES = {
  STOCKS: 'S:',
  CRYPTO: 'X:',
  FOREX: 'C:'
};

/**
 * Configuration settings for rate limiting
 * @readonly
 * @type {Object}
 */
const RATE_LIMITS = {
  BASIC: {
    requestsPerMinute: 5,
    requestsPerDay: 1000
  },
  STARTER: {
    requestsPerMinute: 10,
    requestsPerDay: 2000
  },
  DEVELOPER: {
    requestsPerMinute: 20,
    requestsPerDay: 5000
  },
  ADVANCED: {
    requestsPerMinute: 50,
    requestsPerDay: 10000
  }
};

/**
 * Base endpoints for different Polygon API services
 * @readonly
 * @type {Object}
 */
const API_ENDPOINTS = {
  REST_BASE: 'https://api.polygon.io/v2',
  WEBSOCKET_BASE: 'wss://socket.polygon.io',
  AGGREGATES: '/aggs',
  GROUPED_DAILY: '/grouped/locale/global/market',
  TICKER_DETAILS: '/reference/tickers'
};

/**
 * Main configuration object for Polygon API
 * @type {Object}
 */
const polygonConfig = {
  apiKey: process.env.POLYGON_API_KEY,
  
  // Base configuration
  endpoints: API_ENDPOINTS,
  marketTypes: MARKET_TYPES,
  timeframes: TIMEFRAMES,
  symbolPrefixes: SYMBOL_PREFIXES,
  
  // Request configuration
  request: {
    baseURL: API_ENDPOINTS.REST_BASE,
    timeout: 30000, // 30 seconds
    retryAttempts: 3,
    retryDelay: 1000, // 1 second
    headers: {
      'Content-Type': 'application/json'
    }
  },
  
  // Rate limiting configuration
  rateLimit: RATE_LIMITS[process.env.POLYGON_TIER || 'BASIC'],
  
  // Cache configuration
  cache: {
    enabled: true,
    ttl: 10000, // 10 seconds
    maxSize: 1000, // Maximum number of items in cache
  },

  // Helper functions
  helpers: {
    /**
     * Formats a symbol according to market type
     * @param {string} symbol - Raw symbol
     * @param {string} marketType - Market type from MARKET_TYPES
     * @returns {string} Formatted symbol
     */
    formatSymbol: (symbol, marketType) => {
      const prefix = SYMBOL_PREFIXES[marketType.toUpperCase()];
      return prefix ? `${prefix}${symbol}` : symbol;
    },

     /**
     * Formats a symbol for API requests
     * @param {string} symbol - Raw symbol (can include prefix)
     * @param {string} marketType - Market type from MARKET_TYPES
     * @returns {string} API-ready symbol
     */
     formatSymbolForAPI: (symbol, marketType) => {
        // If symbol includes a prefix (S:, X:, C:), remove it
        if (symbol.includes(':')) {
            symbol = symbol.split(':')[1];
        }
        
        // Add specific formatting based on market type
        switch(marketType.toUpperCase()) {
            case 'STOCKS':
                return symbol; // Just the raw symbol for stocks
            case 'CRYPTO':
                return `X:${symbol}`; // Keep X: prefix for crypto
            case 'FOREX':
                return `C:${symbol}`; // Keep C: prefix for forex
            default:
                return symbol;
        }
    },

    /**
     * Validates a timeframe string
     * @param {string} timeframe - Timeframe to validate
     * @returns {boolean} Whether timeframe is valid
     */
    isValidTimeframe: (timeframe) => {
      return Object.values(TIMEFRAMES).includes(timeframe);
    },

    /**
     * Constructs a full API URL
     * @param {string} endpoint - API endpoint
     * @param {Object} params - Query parameters
     * @returns {string} Complete URL with parameters
     */
    buildUrl: (endpoint, params = {}) => {
      const url = new URL(`${API_ENDPOINTS.REST_BASE}${endpoint}`);
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, value);
        }
      });
      url.searchParams.append('apiKey', process.env.POLYGON_API_KEY);
      return url.toString();
    }
  },

  // Environment settings
  environment: {
    isProd: process.env.NODE_ENV === 'production',
    isDev: process.env.NODE_ENV === 'development',
    logging: {
      enabled: process.env.ENABLE_LOGGING === 'true',
      level: process.env.LOG_LEVEL || 'info'
    }
  }
};

// Freeze the configuration object to prevent modifications
Object.freeze(polygonConfig);
Object.freeze(polygonConfig.request);
Object.freeze(polygonConfig.rateLimit);
Object.freeze(polygonConfig.cache);
Object.freeze(polygonConfig.helpers);
Object.freeze(polygonConfig.environment);

module.exports = polygonConfig;