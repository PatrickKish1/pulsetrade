import brain from 'brain.js';
import fs from 'fs';
import { minMax } from './libs/utils.js';
import polygonService from './polygonService.js';

class StockPredictor {
    constructor(config = {}) {
        this.config = {
            symbol: config.symbol || 'AAPL',
            startDate: config.startDate || '2014-01-30',
            endDate: config.endDate || '2023-01-29',
            timespan: config.timespan || 'day',
            lookback: config.lookback || 60,
            trainingRatio: config.trainingRatio || 0.8,
            // Brain.js specific configurations
            learningRate: config.learningRate || 0.01,
            iterations: config.iterations || 1000,
            hiddenLayers: config.hiddenLayers || [8, 8]
        };

        this.model = null;
        this.scaler = null;
        console.log('StockPredictor initialized with:', this.config);
    }

    initializeModel() {
        try {
            this.model = new brain.recurrent.LSTMTimeStep({
                inputSize: 1,
                hiddenLayers: this.config.hiddenLayers,
                outputSize: 1,
                learningRate: this.config.learningRate
            });
            
            console.log('Brain.js model initialized successfully');
        } catch (error) {
            throw new Error(`Failed to initialize Brain.js model: ${error.message}`);
        }
    }

    async fetchStockData() {
        console.log('Fetching stock data from Polygon...');
        try {
            const response = await polygonService.getHistoricalData(
                this.config.symbol,
                this.config.timespan,
                this.config.startDate,
                this.config.endDate
            );

            if (!response.results || response.results.length === 0) {
                throw new Error('No data received from Polygon API');
            }

            const transformedData = response.results.map(item => ({
                close: item.c,
                date: new Date(item.t).toISOString().split('T')[0]
            }));

            return transformedData;
        } catch (error) {
            throw new Error(`Failed to fetch data for ${this.config.symbol}: ${error.message}`);
        }
    }

    preprocessData(data) {
        try {
            const closePrices = data.map(row => row.close);
            const { scaledData, scaler } = minMax(closePrices);
            this.scaler = scaler;
            return scaledData;
        } catch (error) {
            throw new Error(`Data preprocessing failed: ${error.message}`);
        }
    }

    prepareTrainingData(scaledData) {
        try {
            const sequences = [];
            for (let i = 0; i <= scaledData.length - this.config.lookback - 1; i++) {
                sequences.push(scaledData.slice(i, i + this.config.lookback + 1));
            }
            return sequences;
        } catch (error) {
            throw new Error(`Failed to prepare training data: ${error.message}`);
        }
    }

    async trainModel(sequences) {
        try {
            console.log('Training model...');
            const trainingStats = await this.model.train(sequences, {
                iterations: this.config.iterations,
                log: true,
                logPeriod: 100,
                errorThresh: 0.01
            });
            console.log('Training completed:', trainingStats);
            return trainingStats;
        } catch (error) {
            throw new Error(`Model training failed: ${error.message}`);
        }
    }

    async predict(lastDays) {
        try {
            if (!this.model || !this.scaler) {
                throw new Error('Model not trained or scaler not initialized');
            }

            const scaledInput = this.scaler.transform(lastDays);
            const scaledPrediction = this.model.run(scaledInput);
            const prediction = this.scaler.inverseTransform([scaledPrediction])[0];
            
            return prediction;
        } catch (error) {
            throw new Error(`Prediction failed: ${error.message}`);
        }
    }

    generateTradingSignals(currentPrices, predictedPrice) {
        try {
            const currentPrice = currentPrices[currentPrices.length - 1];
            const priceDiffPercent = ((predictedPrice - currentPrice) / currentPrice) * 100;
            
            const stopLossPercent = 2;
            const takeProfitRatio = 1.5;
            
            let signal = {
                type: priceDiffPercent > 0 ? 'BUY' : 'SELL',
                entry: currentPrice,
                prediction: predictedPrice,
                stopLoss: null,
                takeProfit: null,
                potentialReturn: Math.abs(priceDiffPercent),
                confidence: this.calculateConfidenceScore(priceDiffPercent)
            };

            if (signal.type === 'BUY') {
                signal.stopLoss = currentPrice * (1 - stopLossPercent / 100);
                signal.takeProfit = currentPrice * (1 + (stopLossPercent * takeProfitRatio) / 100);
            } else {
                signal.stopLoss = currentPrice * (1 + stopLossPercent / 100);
                signal.takeProfit = currentPrice * (1 - (stopLossPercent * takeProfitRatio) / 100);
            }

            return signal;
        } catch (error) {
            throw new Error(`Failed to generate trading signals: ${error.message}`);
        }
    }

    calculateConfidenceScore(priceDiffPercent) {
        const absPercent = Math.abs(priceDiffPercent);
        if (absPercent < 1) return 'LOW';
        if (absPercent < 3) return 'MEDIUM';
        return 'HIGH';
    }

    async runPrediction() {
        try {
            // Initialize model if not already done
            if (!this.model) {
                this.initializeModel();
            }

            // Fetch and preprocess data
            const stockData = await this.fetchStockData();
            const scaledData = this.preprocessData(stockData);
            
            // Prepare training sequences
            const sequences = this.prepareTrainingData(scaledData);
            
            // Train the model
            await this.trainModel(sequences);
            
            // Get last days for prediction
            const lastDays = stockData.slice(-this.config.lookback).map(row => row.close);
            const futurePrediction = await this.predict(lastDays);
            const signals = this.generateTradingSignals(lastDays, futurePrediction);

            return {
                symbol: this.config.symbol,
                lastPrice: lastDays[lastDays.length - 1],
                predictedPrice: futurePrediction,
                signals,
                modelMetrics: {
                    lookbackPeriod: this.config.lookback,
                    iterations: this.config.iterations,
                    learningRate: this.config.learningRate,
                    hiddenLayers: this.config.hiddenLayers
                },
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            throw new Error(`Prediction run failed: ${error.message}`);
        }
    }

    saveResults(results, filename = 'prediction_results.json') {
        try {
            fs.writeFileSync(filename, JSON.stringify(results, null, 2));
        } catch (error) {
            throw new Error(`Failed to save results: ${error.message}`);
        }
    }

    // Save trained model
    saveModel(filename = 'stock_model.json') {
        try {
            const modelState = this.model.toJSON();
            fs.writeFileSync(filename, JSON.stringify(modelState));
            console.log(`Model saved to ${filename}`);
        } catch (error) {
            throw new Error(`Failed to save model: ${error.message}`);
        }
    }

    // Load trained model
    loadModel(filename = 'stock_model.json') {
        try {
            const modelState = JSON.parse(fs.readFileSync(filename, 'utf-8'));
            this.initializeModel();
            this.model.fromJSON(modelState);
            console.log(`Model loaded from ${filename}`);
        } catch (error) {
            throw new Error(`Failed to load model: ${error.message}`);
        }
    }
}

export default StockPredictor;


// test model
const predictor = new StockPredictor({
    symbol: 'AAPL',
    startDate: '2023-01-01',
    endDate: '2023-12-31',
    timespan: 'day',
    epochs: 15,
    lookback: 30,
    learningRate: 0.003,
    iterations: 2000,
    hiddenLayers: [16, 16, 8]
});

const results = await predictor.runPrediction();
predictor.saveResults(results);