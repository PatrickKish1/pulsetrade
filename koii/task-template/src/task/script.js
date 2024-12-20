import runPythonScript from "./helloPy.js";

(async () => {
    try {
        const result = await runPythonScript();
        console.log('Python script output:', result);
    } catch (error) {
        console.error('Failed to execute the Python script:', error.message);
    }
})();
