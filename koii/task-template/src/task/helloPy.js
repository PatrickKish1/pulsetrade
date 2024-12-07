import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

/**
 * Executes the Python script and returns its output
 * @returns {Promise<string>} The output from the Python script
 */
export async function runPythonScript() {
    try {
        // Get the absolute path to the Python script
        const scriptPath = path.join(process.cwd(), 'main.py');
        
        // Execute the Python script
        const { stdout, stderr } = await execAsync(`python ${scriptPath}`);
        
        if (stderr) {
            console.error('Python script error:', stderr);
            throw new Error(stderr);
        }
        
        return stdout.trim();
    } catch (error) {
        console.error('Error running Python script:', error);
        throw error;
    }
}