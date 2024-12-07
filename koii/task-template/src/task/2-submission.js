import { namespaceWrapper } from "@_koii/namespace-wrapper";

export async function submission(roundNumber) {
    /**
     * Submit the Python script output for auditing
     * @param {number} roundNumber - The current round number
     * @returns {string} The stored Python output
     */
    try {
        console.log(`MAKE SUBMISSION FOR ROUND ${roundNumber}`);
        return await namespaceWrapper.storeGet("pythonOutput");
    } catch (error) {
        console.error("MAKE SUBMISSION ERROR:", error);
        throw error;
    }
}