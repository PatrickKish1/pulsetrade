// polygonService.js
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

class PolygonService {
    constructor() {
        this.apiKey = process.env.POLYGON_API_KEY;
        this.baseURL = 'https://api.polygon.io/v2';
        
        // Initialize axios instance
        this.client = axios.create({
            baseURL: this.baseURL,
            timeout: 30000, // 30 seconds
            headers: {
                'Content-Type': 'application/json'
            }
        });

        // Setup error handling
        this.setupErrorHandling();
    }

    setupErrorHandling() {
        this.client.interceptors.response.use(
            response => response,
            error => {
                if (error.response) {
                    const { status, data } = error.response;
                    
                    // Handle rate limiting
                    if (status === 429) {
                        console.warn('Rate limit reached. Please wait before making more requests.');
                    }
                    
                    // Log API-specific errors
                    console.error('Polygon API Error:', {
                        status,
                        message: data.error || data.message || 'Unknown error',
                        endpoint: error.config.url
                    });
                }
                throw error;
            }
        );
    }

    /**
     * Get historical data for a symbol
     * @param {string} symbol - Trading symbol (e.g., 'AAPL', 'X:BTCUSD', 'C:EURUSD')
     * @param {string} timespan - Time interval (day, minute, hour)
     * @param {string} fromDate - Start date (YYYY-MM-DD)
     * @param {string} toDate - End date (YYYY-MM-DD)
     * @returns {Promise} Historical data
     */
    async getHistoricalData(symbol, timespan, fromDate, toDate) {
        try {
            const endpoint = `/aggs/ticker/${symbol}/range/1/${timespan}/${fromDate}/${toDate}`;
            
            const response = await this.client.get(endpoint, {
                params: {
                    adjusted: true,
                    sort: 'asc',
                    limit: 50000,
                    apiKey: this.apiKey
                }
            });

            if (!response.data.results || response.data.results.length === 0) {
                throw new Error('No data available for the specified period');
            }

            return response.data;
        } catch (error) {
            if (error.response?.status === 404) {
                throw new Error(`No data found for symbol ${symbol}`);
            }
            throw error;
        }
    }

    /**
     * Get previous day's data for a symbol
     * @param {string} symbol - Trading symbol
     * @returns {Promise} Previous day's data
     */
    async getPreviousClose(symbol) {
        try {
            const endpoint = `/aggs/ticker/${symbol}/prev`;
            
            const response = await this.client.get(endpoint, {
                params: {
                    adjusted: true,
                    apiKey: this.apiKey
                }
            });

            if (!response.data.results) {
                throw new Error('No previous close data available');
            }

            return response.data.results;
        } catch (error) {
            console.error('Error fetching previous close:', error);
            throw error;
        }
    }

    /**
     * Validate if a symbol exists and is tradeable
     * @param {string} symbol - Trading symbol
     * @returns {Promise<boolean>} Whether the symbol is valid
     */
    async validateSymbol(symbol) {
        try {
            const endpoint = `/reference/tickers/${symbol}`;
            
            const response = await this.client.get(endpoint, {
                params: {
                    apiKey: this.apiKey
                }
            });

            return response.data.status === 'ok';
        } catch (error) {
            if (error.response?.status === 404) {
                return false;
            }
            throw error;
        }
    }
}

// Create and export a singleton instance
const polygonService = new PolygonService();
export default polygonService;