// server.js
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const groqService = require('./services/groq');
const polygonService = require('./services/polygonDataService');
const rateLimiter = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');

dotenv.config();

class TradingAIServer {
  constructor() {
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  /**
   * Setup middleware
   * @private
   */
  setupMiddleware() {
    // Basic middleware
    this.app.use(express.json());
    this.app.use(cors({
      origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
      methods: ['GET', 'POST'],
      allowedHeaders: ['Content-Type', 'Authorization']
    }));

    // Add request ID
    this.app.use((req, res, next) => {
      req.id = uuidv4();
      next();
    });

    // Apply rate limiters
    this.app.use('/api/chat', rateLimiter.chat);
    this.app.use('/api/market', rateLimiter.market);
    this.app.use(rateLimiter.standard);

    // Basic security headers
    this.app.use((req, res, next) => {
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-Frame-Options', 'DENY');
      res.setHeader('X-XSS-Protection', '1; mode=block');
      next();
    });
  }

  /**
   * Setup API routes
   * @private
   */
  setupRoutes() {
    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.status(200).json({
        status: 'OK',
        message: 'Trading AI Assistant API is running',
        timestamp: new Date().toISOString(),
        requestId: req.id
      });
    });

    // Chat endpoints
    this.app.post('/', this.handleChatRequest.bind(this));
    this.app.post('/api/chat', this.handleChatRequest.bind(this));
    this.app.get('/api/chat/history/:threadId', this.handleGetHistory.bind(this));
    this.app.delete('/api/chat/history/:threadId', this.handleClearHistory.bind(this));

    // Market data endpoints
    this.app.get('/api/market/current/:symbol', this.handleCurrentMarketData.bind(this));
    this.app.get('/api/market/historical/:symbol', this.handleHistoricalData.bind(this));
    this.app.get('/api/market/day/:symbol/:date', this.handleDayData.bind(this));
    this.app.get('/api/market/grouped/:marketType/:date', this.handleGroupedDaily.bind(this));
    this.app.get('/api/market/search', this.handleSymbolSearch.bind(this));
  }

  /**
   * Setup error handling
   * @private
   */
  setupErrorHandling() {
    this.app.use(errorHandler.notFoundHandler);
    this.app.use(errorHandler.apiErrorHandler);
  }

  /**
   * Handle chat request
   * @private
   */
  async handleChatRequest(req, res, next) {
    try {
      const { message, threadId } = req.body;

      if (!message) {
        return res.status(400).json({
          error: 'Message is required',
          requestId: req.id
        });
      }

      const response = await groqService.chatWithAssistant(message, threadId);
      
      res.status(200).json({
        ...response,
        requestId: req.id
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Handle get chat history request
   * @private
   */
  async handleGetHistory(req, res, next) {
    try {
      const { threadId } = req.params;
      const history = await groqService.getConversationHistory(threadId);
      
      res.status(200).json({
        history,
        requestId: req.id
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Handle clear chat history request
   * @private
   */
  async handleClearHistory(req, res, next) {
    try {
      const { threadId } = req.params;
      await groqService.clearConversationHistory(threadId);
      
      res.status(200).json({
        message: 'Conversation history cleared',
        requestId: req.id
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Handle current market data request
   * @private
   */
  async handleCurrentMarketData(req, res, next) {
    try {
      const { symbol } = req.params;
      const { marketType } = req.query;

      const data = await polygonService.getCurrentData(symbol, marketType);
      
      res.status(200).json({
        data,
        requestId: req.id
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Handle historical data request
   * @private
   */
  async handleHistoricalData(req, res, next) {
    try {
      const { symbol } = req.params;
      const { marketType, timeframe, from, to } = req.query;

      const data = await polygonService.getHistoricalData(
        symbol,
        marketType,
        timeframe,
        from,
        to
      );
      
      res.status(200).json({
        data,
        requestId: req.id
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Handle day data request
   * @private
   */
  async handleDayData(req, res, next) {
    try {
      const { symbol, date } = req.params;
      const { marketType } = req.query;

      const data = await polygonService.getDayData(symbol, marketType, date);
      
      res.status(200).json({
        data,
        requestId: req.id
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Handle grouped daily data request
   * @private
   */
  async handleGroupedDaily(req, res, next) {
    try {
      const { marketType, date } = req.params;
      const data = await polygonService.getGroupedDaily(marketType, date);
      
      res.status(200).json({
        data,
        requestId: req.id
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Handle symbol search request
   * @private
   */
  async handleSymbolSearch(req, res, next) {
    try {
      const { query, marketType } = req.query;
      const data = await polygonService.searchSymbols(query, marketType);
      
      res.status(200).json({
        data,
        requestId: req.id
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Start the server
   * @public
   */
  start() {
    const port = process.env.PORT || 3000;
    
    this.app.listen(port, () => {
      console.log(`Trading AI Assistant API is running on port ${port}`);
      console.log(`Health check: http://localhost:${port}/health`);
      
      if (process.env.NODE_ENV === 'development') {
        console.log('Available endpoints:');
        console.log('- POST /api/chat');
        console.log('- GET /api/chat/history/:threadId');
        console.log('- DELETE /api/chat/history/:threadId');
        console.log('- GET /api/market/current/:symbol');
        console.log('- GET /api/market/historical/:symbol');
        console.log('- GET /api/market/day/:symbol/:date');
        console.log('- GET /api/market/grouped/:marketType/:date');
        console.log('- GET /api/market/search');
      }
    });
  }
}

// Create and start server
const server = new TradingAIServer();
server.start();

module.exports = server.app; // Export for testing