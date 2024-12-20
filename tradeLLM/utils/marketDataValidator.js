class MarketDataValidator {
    static validateQuote(quote) {
      const requiredFields = [
        'symbol',
        'price',
        'timestamp'
      ];
  
      const numericFields = [
        'price',
        'change',
        'changePercent',
        'volume',
        'high',
        'low',
        'open',
        'close',
      ];
  
      // Check required fields
      for (const field of requiredFields) {
        if (!quote[field]) {
          throw new Error(`Missing required field: ${field}`);
        }
      }
  
      // Validate numeric fields
      for (const field of numericFields) {
        if (quote[field] && (isNaN(quote[field]) || !isFinite(quote[field]))) {
          throw new Error(`Invalid numeric value for field: ${field}`);
        }
      }
  
      // Validate timestamp
      if (!Date.parse(quote.timestamp)) {
        throw new Error('Invalid timestamp format');
      }
  
      return true;
    }
  
    static validateOHLCV(data) {
      if (!Array.isArray(data)) {
        throw new Error('OHLCV data must be an array');
      }
  
      const requiredFields = ['timestamp', 'open', 'high', 'low', 'close', 'volume'];
  
      data.forEach((candle, index) => {
        // Check required fields
        for (const field of requiredFields) {
          if (!candle[field]) {
            throw new Error(`Missing required field ${field} at index ${index}`);
          }
        }
  
        // Validate numeric values
        if (candle.high < candle.low) {
          throw new Error(`Invalid high/low values at index ${index}`);
        }
  
        if (candle.open > candle.high || candle.open < candle.low) {
          throw new Error(`Invalid open price at index ${index}`);
        }
  
        if (candle.close > candle.high || candle.close < candle.low) {
          throw new Error(`Invalid close price at index ${index}`);
        }
  
        if (candle.volume < 0) {
          throw new Error(`Invalid volume at index ${index}`);
        }
      });
  
      return true;
    }
  
    static validateTimeRange(startTime, endTime) {
      const start = new Date(startTime);
      const end = new Date(endTime);
  
      if (isNaN(start.getTime())) {
        throw new Error('Invalid start time');
      }
  
      if (isNaN(end.getTime())) {
        throw new Error('Invalid end time');
      }
  
      if (end < start) {
        throw new Error('End time must be after start time');
      }
  
      return true;
    }
  }
  
  module.exports = MarketDataValidator;