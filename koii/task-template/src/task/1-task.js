import { namespaceWrapper } from "@_koii/namespace-wrapper";
import StockPredictor from "./stock-prediction-model.js";
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// MongoDB connection function
async function connectToMongoDB() {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
        throw new Error('MongoDB URI is not defined in environment variables');
    }

    const client = new MongoClient(uri);
    try {
        await client.connect();
        console.log('Successfully connected to MongoDB');
        return client;
    } catch (error) {
        console.error('MongoDB connection error:', error);
        throw error;
    }
}

// Function to save results to MongoDB
async function saveToMongoDB(data) {
    const client = await connectToMongoDB();
    try {
        const database = client.db(process.env.MONGODB_DB_NAME);
        const collection = database.collection(process.env.MONGODB_COLLECTION_NAME);
        
        // Add timestamp if not present
        const documentToInsert = {
            ...data,
            created_at: new Date(),
        };

        const result = await collection.insertOne(documentToInsert);
        console.log(`Successfully saved prediction to MongoDB with id: ${result.insertedId}`);
        return result;
    } catch (error) {
        console.error('Error saving to MongoDB:', error);
        throw error;
    } finally {
        await client.close();
    }
}

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
        
        // Save results to MongoDB instead of local file
        await saveToMongoDB(results);
        
        // Store the stock symbol for submission
        await namespaceWrapper.storeSet("value", results.symbol);
        
        // Store the prediction results
        await namespaceWrapper.storeSet("prediction_results", JSON.stringify(results));
        
        return results;
    } catch (error) {
        console.error("EXECUTE TASK ERROR:", error);
        throw error;
    }
}




// import { namespaceWrapper } from "@_koii/namespace-wrapper";
// import StockPredictor from "./stock-prediction-model.js"

// export async function task(roundNumber) {
//   try {
//     console.log(`EXECUTE TASK FOR ROUND ${roundNumber}`);
    
//     // Initialize the stock predictor with default AAPL stock
//     const predictor = new StockPredictor({
//       symbol: 'AAPL',
//       startDate: '2023-01-01',
//       endDate: '2023-12-31',
//       timespan: 'day',
//       epochs: 15,
//       lookback: 30,
//       learningRate: 0.003,
//       iterations: 2000,
//       hiddenLayers: [16, 16, 8]
//   });
  

  
//   // Run the prediction
//   const results = await predictor.runPrediction();
//   predictor.saveResults(results);
    
//     // Store the stock symbol for submission
//     await namespaceWrapper.storeSet("value", results.symbol);
    
//     // You can optionally store more data if needed
//     await namespaceWrapper.storeSet("prediction_results", JSON.stringify(results));
    
//     return results;
//   } catch (error) {
//     console.error("EXECUTE TASK ERROR:", error);
//     throw error;
//   }
// }