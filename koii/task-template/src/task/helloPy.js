import { spawn } from 'child_process';
import path from 'path';

/**
 * Executes the Python script and returns its output
 * @returns {Promise<string>} The output from the Python script
 */
export function runPythonScript() {
    return new Promise((resolve, reject) => {
        // Get the absolute path to the Python script
        const scriptPath = path.resolve(process.cwd(), 'main.py');
        
        // Spawn the Python process
        const pythonProcess = spawn('python', [scriptPath]);

        let output = '';
        let errorOutput = '';

        // Collect standard output
        pythonProcess.stdout.on('data', (data) => {
            output += data.toString();
        });

        // Collect standard error
        pythonProcess.stderr.on('data', (data) => {
            errorOutput += data.toString();
        });

        // Handle process completion
        pythonProcess.on('close', (code) => {
            if (code === 0) {
                resolve(output.trim());
            } else {
                reject(new Error(`Python script exited with code ${code}: ${errorOutput.trim()}`));
            }
        });

        // Handle process errors
        pythonProcess.on('error', (err) => {
            reject(new Error(`Failed to start Python process: ${err.message}`));
        });
    });
}

export default runPythonScript;