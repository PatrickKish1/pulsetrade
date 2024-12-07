import { namespaceWrapper } from "@_koii/namespace-wrapper";
import { runPythonScript } from "./helloPy.js";

export async function task(roundNumber) {
    /**
     * Execute the Python script and store its output
     * @param {number} roundNumber - The current round number
     */
    try {
        console.log(`EXECUTE TASK FOR ROUND ${roundNumber}`);
        
        // Run the Python script and get its output
        const pythonOutput = await runPythonScript();
        
        // Store the output for submission
        await namespaceWrapper.storeSet("pythonOutput", pythonOutput);
        
        return pythonOutput; // Optional return for debugging
    } catch (error) {
        console.error("EXECUTE TASK ERROR:", error);
        throw error;
    }
}