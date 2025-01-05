import * as d3 from 'd3';
import * as fs from 'fs';
import StockPredictor from './stock-prediction-model.js';

class CandlestickPlotter {
    constructor(symbol = '^DJI', startDate = '2014-01-30', endDate = '2023-01-29') {
        this.symbol = symbol;
        this.startDate = startDate;
        this.endDate = endDate;
    }

    async plotCandlesticks() {
        // Create predictor instance
        const predictor = new StockPredictor(this.symbol, this.startDate, this.endDate);
        
        // Run prediction to get data
        const predictionResults = await predictor.runPrediction();
        const stockData = await predictor.fetchStockData();

        // D3 Candlestick Plotting
        const margin = { top: 20, right: 30, bottom: 30, left: 40 };
        const width = 960 - margin.left - margin.right;
        const height = 500 - margin.top - margin.bottom;

        const svg = d3.select('body').append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        // X scale
        const x = d3.scaleTime()
            .domain(d3.extent(stockData, d => new Date(d.date)))
            .range([0, width]);

        // Y scale
        const y = d3.scaleLinear()
            .domain([
                d3.min(stockData, d => Math.min(d.low, d.open, d.close, d.high)),
                d3.max(stockData, d => Math.max(d.low, d.open, d.close, d.high))
            ])
            .range([height, 0]);

        // Add X axis
        svg.append('g')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(x));

        // Add Y axis
        svg.append('g')
            .call(d3.axisLeft(y));

        // Candlesticks
        svg.selectAll('.candlestick')
            .data(stockData)
            .enter()
            .append('line')
            .attr('x1', d => x(new Date(d.date)))
            .attr('x2', d => x(new Date(d.date)))
            .attr('y1', d => y(d.low))
            .attr('y2', d => y(d.high))
            .attr('stroke', 'black');

        svg.selectAll('.candle')
            .data(stockData)
            .enter()
            .append('rect')
            .attr('x', d => x(new Date(d.date)) - 4)
            .attr('y', d => y(Math.max(d.open, d.close)))
            .attr('width', 8)
            .attr('height', d => Math.abs(y(d.open) - y(d.close)))
            .attr('fill', d => d.open > d.close ? 'red' : 'green');

        // Annotate prediction results and signals
        const futureAnnotation = svg.append('g')
            .attr('transform', `translate(${width}, ${y(predictionResults.futurePrediction)})`);

        futureAnnotation.append('text')
            .attr('x', 10)
            .attr('y', 0)
            .text(`Predicted: $${predictionResults.futurePrediction.toFixed(2)}`)
            .attr('fill', 'blue');

        // Optional: Output results to a file
        fs.writeFileSync('candlestick_plot_results.json', JSON.stringify({
            predictions: predictionResults,
            plotData: stockData
        }, null, 2));

        console.log('Trading Signals:', predictionResults.signals);
    }
}

// If run directly, create and run plot
if (import.meta.url === `file://${process.argv[1]}`) {
    const plotter = new CandlestickPlotter();
    plotter.plotCandlesticks().catch(console.error);
}

export default CandlestickPlotter;