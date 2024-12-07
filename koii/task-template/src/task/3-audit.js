import { namespaceWrapper } from "@_koii/namespace-wrapper";

export async function audit(submission, roundNumber, submitterKey) {
    /**
     * Audit the submission by verifying the Python script output
     * @param {string} submission - The submitted output to verify
     * @param {number} roundNumber - The current round number of task
     * @param {string} submitterKey - The submitter's public key
     * @returns {boolean} Checks whether the submission is valid
     */
    console.log(`AUDIT SUBMISSION FOR ROUND ${roundNumber} from ${submitterKey}`);
    
    // Verify that the submission matches the expected Python output
    const expectedOutput = "Hello, World from Pulse Trade!. We are glad you are here...";
    return submission === expectedOutput;
}