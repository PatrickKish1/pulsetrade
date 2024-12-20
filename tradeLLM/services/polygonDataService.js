// polygonDataService.js
const axios = require('axios');
const config = require('../config/polygon-config');
const { RateLimiter } = require('limiter');
const NodeCache = require('node-cache');

class PolygonDataService {
  constructor() {
    // Initialize axios instance with base configuration
    this.client = axios.create({
      baseURL: config.endpoints.REST_BASE,
      timeout: config.request.timeout,
      headers: config.request.headers
    });

    // Initialize rate limiter (5 requests per minute)
    this.rateLimiter = new RateLimiter({
      tokensPerInterval: config.rateLimit.requestsPerMinute || 5,
      interval: "minute"
    });

    // Initialize cache
    this.cache = new NodeCache({
      stdTTL: config.cache.ttl / 1000, // Convert to seconds
      maxKeys: config.cache.maxSize
    });

    // Setup axios interceptors for error handling
    this.setupInterceptors();
  }

  /**
   * Setup axios interceptors for request/response handling
   * @private
   */
  setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(async (config) => {
      // Wait for a token from the rate limiter
      await this.rateLimiter.removeTokens(1);
      return config;
    });

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 429) {
          // Handle rate limiting
          const retryAfter = parseInt(error.response.headers['retry-after']) || 60;
          await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
          return this.client(error.config);
        }
        throw error;
      }
    );
  }

  /**
   * Generic request method with retries and caching
   * @private
   */
  async makeRequest(endpoint, params = {}, useCache = true) {
    const cacheKey = `${endpoint}:${JSON.stringify(params)}`;
    
    // Check cache first
    if (useCache && this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    let attempts = 0;
    while (attempts < config.request.retryAttempts) {
      try {
        // Wait for rate limiter before making request
        await this.rateLimiter.removeTokens(1);
        
        const response = await this.client.get(endpoint, {
          params: { ...params, apiKey: config.apiKey }
        });

        if (useCache) {
          this.cache.set(cacheKey, response.data);
        }
        
        return response.data;
      } catch (error) {
        attempts++;
        if (attempts === config.request.retryAttempts) {
          throw error;
        }
        await new Promise(resolve => 
          setTimeout(resolve, config.request.retryDelay * attempts)
        );
      }
    }
  }

  /**
   * Get current market data for a symbol
   * @param {string} symbol - Trading symbol
   * @param {string} marketType - Market type (stocks, crypto, forex)
   */
  async getCurrentData(symbol, marketType) {
    const formattedSymbol = config.helpers.formatSymbolForAPI(symbol, marketType);
    const endpoint = `${config.endpoints.AGGREGATES}/ticker/${formattedSymbol}/prev`;
    return this.makeRequest(endpoint);
  }

  /**
   * Get historical data for a symbol
   * @param {string} symbol - Trading symbol
   * @param {string} marketType - Market type
   * @param {string} timeframe - Time interval
   * @param {string} from - Start date (YYYY-MM-DD)
   * @param {string} to - End date (YYYY-MM-DD)
   */
  async getHistoricalData(symbol, marketType, timeframe, from, to) {
    if (!config.helpers.isValidTimeframe(timeframe)) {
      throw new Error(`Invalid timeframe: ${timeframe}`);
    }

    const formattedSymbol = config.helpers.formatSymbolForAPI(symbol, marketType);
    const endpoint = `${config.endpoints.AGGREGATES}/ticker/${formattedSymbol}/range/${timeframe}/${from}/${to}`;
    return this.makeRequest(endpoint);
  }

  /**
   * Get grouped daily data for a market type
   * @param {string} marketType - Market type
   * @param {string} date - Date (YYYY-MM-DD)
   */
  async getGroupedDaily(marketType, date) {
    if (!config.marketTypes[marketType.toUpperCase()]) {
      throw new Error(`Invalid market type: ${marketType}`);
    }

    const endpoint = `${config.endpoints.GROUPED_DAILY}/${marketType}/${date}`;
    return this.makeRequest(endpoint);
  }

  /**
   * Get specific day data for a symbol
   * @param {string} symbol - Trading symbol
   * @param {string} marketType - Market type
   * @param {string} date - Date (YYYY-MM-DD)
   */
  async getDayData(symbol, marketType, date) {
    const formattedSymbol = config.helpers.formatSymbolForAPI(symbol, marketType);
    const endpoint = `${config.endpoints.AGGREGATES}/ticker/${formattedSymbol}/range/1/day/${date}/${date}`;
    return this.makeRequest(endpoint);
  }

  /**
   * Search for symbols
   * @param {string} query - Search query
   * @param {string} marketType - Market type
   */
  async searchSymbols(query, marketType) {
    const endpoint = `${config.endpoints.TICKER_DETAILS}`;
    const params = {
      search: query,
      market: marketType,
      active: true,
      sort: 'ticker',
      order: 'asc',
      limit: 10
    };
    return this.makeRequest(endpoint, params);
  }

  /**
   * Clear cache for a specific key or all cache
   * @param {string} [key] - Specific cache key to clear
   */
  clearCache(key = null) {
    if (key) {
      this.cache.del(key);
    } else {
      this.cache.flushAll();
    }
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      keys: this.cache.keys(),
      stats: this.cache.getStats()
    };
  }

  /**
   * Get current rate limit status
   */
  async getRateLimitStatus() {
    return {
      remainingTokens: this.rateLimiter.getTokensRemaining(),
      resetIn: this.rateLimiter.tryRemoveTokens(0)
    };
  }
}

// Create singleton instance
const polygonService = new PolygonDataService();
Object.freeze(polygonService);

module.exports = polygonService;