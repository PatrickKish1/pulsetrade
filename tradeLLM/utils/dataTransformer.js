class DataTransformer {
    static normalizeQuote(quote, source) {
      const baseQuote = {
        symbol: '',
        price: null,
        change: null,
        changePercent: null,
        volume: null,
        high: null,
        low: null,
        open: null,
        close: null,
        timestamp: null,
        source: source
      };
  
      switch (source) {
        case 'yahoo':
          return {
            ...baseQuote,
            symbol: quote.symbol,
            price: quote.regularMarketPrice,
            change: quote.regularMarketChange,
            changePercent: quote.regularMarketChangePercent,
            volume: quote.regularMarketVolume,
            high: quote.regularMarketDayHigh,
            low: quote.regularMarketDayLow,
            open: quote.regularMarketOpen,
            close: quote.regularMarketClose,
            timestamp: new Date(quote.regularMarketTime * 1000).toISOString()
          };
  
        case 'alphavantage':
          return {
            ...baseQuote,
            symbol: quote['01. symbol'],
            price: parseFloat(quote['06. price']),
            change: parseFloat(quote['10. change']),
            changePercent: parseFloat(quote['11. change percent'].replace('%', '')),
            volume: parseInt(quote['09. volume']),
            high: parseFloat(quote['05. high']),
            low: parseFloat(quote['04. low']),
            open: parseFloat(quote['02. open']),
            close: parseFloat(quote['03. close']),
            timestamp: quote['07. latest trading day']
          };
  
        default:
          throw new Error(`Unknown data source: ${source}`);
      }
    }
  
    static normalizeOHLCV(data, source) {
      switch (source) {
        case 'yahoo':
        case 'alphavantage':
          return data.map(candle => ({
            timestamp: new Date(candle.timestamp).toISOString(),
            open: parseFloat(candle.open),
            high: parseFloat(candle.high),
            low: parseFloat(candle.low),
            close: parseFloat(candle.close),
            volume: parseInt(candle.volume),
            source: source
          }));
  
        default:
          throw new Error(`Unknown data source: ${source}`);
      }
    }
  
    static calculateMetrics(data) {
      if (!data || data.length === 0) return {};
  
      const prices = data.map(d => d.close);
      const returns = prices.slice(1).map((price, i) => 
        (price - prices[i]) / prices[i]
      );
  
      return {
        mean: returns.reduce((a, b) => a + b, 0) / returns.length,
        volatility: Math.sqrt(
          returns.reduce((a, b) => a + Math.pow(b - returns.reduce((a, b) => a + b, 0) / returns.length, 2), 0) / returns.length
        ) * Math.sqrt(252),
        sharpeRatio: (returns.reduce((a, b) => a + b, 0) / returns.length) / 
          (Math.sqrt(returns.reduce((a, b) => a + Math.pow(b - returns.reduce((a, b) => a + b, 0) / returns.length, 2), 0) / returns.length) || 1)
      };
    }
  }
  
  module.exports = DataTransformer;