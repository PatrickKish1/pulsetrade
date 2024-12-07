export async function setup() {
  // Check if Python is installed and accessible
  try {
      await execAsync('python --version');
      console.log("Python is installed and ready");
  } catch (error) {
      console.error("Python is not installed or not accessible:", error);
      throw error;
  }
}