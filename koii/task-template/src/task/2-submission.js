import { namespaceWrapper } from "@_koii/namespace-wrapper";

export async function submission(roundNumber) {
  try {
    console.log(`MAKE SUBMISSION FOR ROUND ${roundNumber}`);
    
    // Get the stored stock symbol
    const stockSymbol = await namespaceWrapper.storeGet("value");
    
    if (!stockSymbol) {
      throw new Error("No stock symbol found in storage");
    }
    
    // Return the stock symbol for validation
    return stockSymbol;
  } catch (error) {
    console.error("MAKE SUBMISSION ERROR:", error);
    throw error;
  }
}