import { namespaceWrapper } from "@_koii/namespace-wrapper";
import StockPredictor from "./stock-prediction-model.js"

export async function task(roundNumber) {
  try {
    console.log(`EXECUTE TASK FOR ROUND ${roundNumber}`);
    
    // Initialize the stock predictor with default AAPL stock
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
  

  
  // Run the prediction
  const results = await predictor.runPrediction();
  predictor.saveResults(results);
    
    // Store the stock symbol for submission
    await namespaceWrapper.storeSet("value", results.symbol);
    
    // You can optionally store more data if needed
    await namespaceWrapper.storeSet("prediction_results", JSON.stringify(results));
    
    return results;
  } catch (error) {
    console.error("EXECUTE TASK ERROR:", error);
    throw error;
  }
}