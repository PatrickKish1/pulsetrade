// services/groq.js
const { ChatGroq } = require("@langchain/groq");
const {
  START,
  END,
  MessagesAnnotation,
  StateGraph,
  MemorySaver,
  Annotation,
} = require("@langchain/langgraph");
const {
  ChatPromptTemplate,
  MessagesPlaceholder,
  SystemMessagePromptTemplate,
} = require("@langchain/core/prompts");
const {
  SystemMessage,
  HumanMessage,
  AIMessage,
  trimMessages,
} = require("@langchain/core/messages");
const { v4: uuidv4 } = require('uuid');
const polygonService = require('./polygonDataService');

class GroqService {
  constructor() {
    this.llm = new ChatGroq({
      model: "mixtral-8x7b-32768",
      temperature: 0.7,
      maxTokens: 2048,
      apiKey: process.env.GROQ_API_KEY,
    });

    // Initialize message trimmer
    this.trimmer = trimMessages({
      maxTokens: 4000,
      strategy: "last",
      tokenCounter: (msgs) => msgs.length,
      includeSystem: true,
      allowPartial: false,
      startOn: "human",
    });

    // Initialize state and chat history
    this.memorySaver = new MemorySaver();
    this.initializePrompts();
    this.initializeGraph();
  }

  /**
   * Initialize prompt templates
   * @private
   */
  initializePrompts() {
    // Base system prompt
    this.basePrompt = ChatPromptTemplate.fromMessages([
      SystemMessagePromptTemplate.fromTemplate(
        `You are a professional financial analyst and trading assistant helping users manage their trading portfolio. 
        They understand it is inherently risky to trade cryptocurrency, and they want to make sure they are making informed decisions. 
        Think carefully through all scenarios and please provide your best guidance and reasoning for this decision.
        Use the provided market data to offer insights and analysis.
         Market Data: {marketData}`
      ),
      new MessagesPlaceholder("messages"),
    ]);

    // Technical analysis prompt
    this.technicalPrompt = ChatPromptTemplate.fromMessages([
      SystemMessagePromptTemplate.fromTemplate(
        `You are analyzing technical market data for {symbol}.
         Use this data to provide technical analysis:
         {marketData}
         
         Focus on:
         1. Price action and trends
         2. Support/resistance levels
         3. Volume analysis
         4. Technical indicators
         5. Risk assessment
        `
      ),
      new MessagesPlaceholder("messages"),
    ]);
  }

  /**
   * Initialize the LangGraph state and workflow
   * @private
   */
  initializeGraph() {
    // Define state annotation
    this.GraphAnnotation = Annotation.Root({
      ...MessagesAnnotation.spec,
      marketData: Annotation(),
      symbol: Annotation(),
      analysisType: Annotation()
    });

    // Define model call function
    const callModel = async (state) => {
      try {
        const trimmedMessages = await this.trimmer.invoke(state.messages);
        const prompt = this.selectPrompt(state.analysisType);
        const chain = prompt.pipe(this.llm);
        
        const response = await chain.invoke({
          messages: trimmedMessages,
          marketData: state.marketData,
          symbol: state.symbol || "the asset"
        });

        return { messages: [response] };
      } catch (error) {
        console.error('Error in model call:', error);
        throw error;
      }
    };

    // Create workflow
    this.workflow = new StateGraph(this.GraphAnnotation)
      .addNode("model", callModel)
      .addEdge(START, "model")
      .addEdge("model", END);

    // Compile application with memory
    this.app = this.workflow.compile({ checkpointer: this.memorySaver });
  }

  /**
   * Select appropriate prompt based on analysis type
   * @private
   */
  selectPrompt(analysisType) {
    switch (analysisType?.toLowerCase()) {
      case 'technical':
        return this.technicalPrompt;
      default:
        return this.basePrompt;
    }
  }

  /**
   * Extract market symbols from message
   * @private
   */
  extractQueryDetails(message) {
    // Extract symbols
    const symbolPattern = /\((X|S|C):([^)]+)\)/g;
    const symbols = [...message.matchAll(symbolPattern)].map(match => ({
        type: match[1],
        symbol: match[2],
        marketType: this.getMarketType(match[1])
    }));

    // Extract date - look for common date formats
    const datePattern = /\b\d{4}-\d{2}-\d{2}\b|\b\d{2}\/\d{2}\/\d{4}\b/;
    const dateMatch = message.match(datePattern);
    const date = dateMatch ? dateMatch[0] : null;

    return {
        symbols,
        date
    };
}

  /**
   * Get market type from symbol prefix
   * @private
   */
  getMarketType(prefix) {
    const types = {
      'X': 'crypto',
      'S': 'stocks',
      'C': 'forex'
    };
    return types[prefix] || 'unknown';
  }

  /**
   * Format market data for prompt
   * @private
   */
  formatMarketData(data) {
    if (!data || !data.results || !data.results[0]) {
      return "No market data available";
    }

    const result = data.results[0];
    return `Current Price: $${result.c}
            Open: $${result.o}
            High: $${result.h}
            Low: $${result.l}
            Close: $${result.c}
            Volume: ${result.v}
            Timestamp: ${new Date(result.t).toISOString()}`;
  }

  /**
   * Fetch market data for symbols
   * @private
   */
  async fetchMarketData(symbols, date = null) {
    try {
        const marketData = await Promise.all(
            symbols.map(async ({ symbol, marketType }) => {
                let data;
                if (date) {
                    // If date is provided, use getDayData
                    data = await polygonService.getDayData(symbol, marketType, date);
                } else {
                    // Otherwise use current data
                    data = await polygonService.getCurrentData(symbol, marketType);
                }
                return {
                    symbol,
                    marketType,
                    data
                };
            })
        );
        return marketData;
    } catch (error) {
        console.error('Error fetching market data:', error);
        throw error;
    }
  }

  /**
   * Process message and generate response
   * @public
   */
  async chatWithAssistant(message, threadId = null) {
    try {
      // Extract symbols from message
      const {symbols, date} = this.extractQueryDetails(message);
      
      // If no symbols found, process as general query
      if (symbols.length === 0) {
        return this.processGeneralQuery(message, threadId);
      }

      // Fetch market data for all symbols
      const marketData = await this.fetchMarketData(symbols, date);
      const formattedMarketData = marketData.map(m => ({
        symbol: m.symbol,
        data: this.formatMarketData(m.data)
      }));

      // Determine analysis type from message
      const analysisType = this.determineAnalysisType(message);

      // Prepare input state
      const input = {
        messages: [{ role: 'user', content: message }],
        marketData: JSON.stringify(formattedMarketData),
        symbol: symbols[0].symbol,
        analysisType
      };

      // Generate config with thread ID
      const config = {
        configurable: {
          thread_id: threadId || uuidv4()
        }
      };

      // Get response from model
      const response = await this.app.invoke(input, config);

      return {
        response: response.messages[response.messages.length - 1],
        marketData: formattedMarketData,
        threadId: config.configurable.thread_id,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('Error in chat:', error);
      throw error;
    }
  }

  /**
   * Process general queries without market data
   * @private
   */
  async processGeneralQuery(message, threadId) {
    const input = {
      messages: [{ role: 'user', content: message }],
      marketData: "No specific market data requested",
      symbol: "general",
      analysisType: 'general'
    };

    const config = {
      configurable: {
        thread_id: threadId || uuidv4()
      }
    };

    const response = await this.app.invoke(input, config);

    return {
      response: response.messages[response.messages.length - 1],
      marketData: null,
      threadId: config.configurable.thread_id,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Determine analysis type from message content
   * @private
   */
  determineAnalysisType(message) {
    const message_lower = message.toLowerCase();
    if (message_lower.includes('technical') || 
        message_lower.includes('chart') || 
        message_lower.includes('indicator')) {
      return 'technical';
    }
    return 'general';
  }

  /**
   * Get conversation history for a thread
   * @public
   */
  async getConversationHistory(threadId) {
    try {
      return await this.memorySaver.get(threadId);
    } catch (error) {
      console.error('Error getting conversation history:', error);
      throw error;
    }
  }

  /**
   * Clear conversation history for a thread
   * @public
   */
  async clearConversationHistory(threadId) {
    try {
      await this.memorySaver.delete(threadId);
      return { success: true, message: 'Conversation history cleared' };
    } catch (error) {
      console.error('Error clearing conversation history:', error);
      throw error;
    }
  }
}

// Create singleton instance
const groqService = new GroqService();
Object.freeze(groqService);

module.exports = groqService;