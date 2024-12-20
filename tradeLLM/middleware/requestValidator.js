const { body, param, validationResult } = require('express-validator');
const marketSymbols = require('../config/market-symbols.json');

const validateSymbol = (symbol) => {
  const allSymbols = [
    ...marketSymbols.stocks.US.map(s => s.symbol),
    ...marketSymbols.forex.map(s => s.symbol),
    ...marketSymbols.crypto.map(s => s.symbol),
    ...marketSymbols.indices.map(s => s.symbol)
  ];
  
  return allSymbols.includes(symbol);
};

const validators = {
  getQuote: [
    param('symbol')
      .trim()
      .notEmpty()
      .withMessage('Symbol is required')
      .custom(validateSymbol)
      .withMessage('Invalid symbol'),
  ],
  
  chatRequest: [
    body('message')
      .trim()
      .notEmpty()
      .withMessage('Message is required')
      .isLength({ max: 500 })
      .withMessage('Message too long (max 500 characters)'),
  ],
  
  timeframe: [
    param('timeframe')
      .optional()
      .isIn(['1m', '5m', '15m', '30m', '1h', '4h', '1d', '1w'])
      .withMessage('Invalid timeframe')
  ]
};

const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    res.status(400).json({
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg
      }))
    });
  };
};

module.exports = {
  validators,
  validate
};