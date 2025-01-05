// Utility functions for data scaling and transformation
export function minMax(data, featureRange = [0, 1]) {
    const min = Math.min(...data);
    const max = Math.max(...data);
    
    const scaler = {
        transform: (input) => {
            if (Array.isArray(input)) {
                return input.map(val => 
                    ((val - min) / (max - min)) * (featureRange[1] - featureRange[0]) + featureRange[0]
                );
            }
            return ((input - min) / (max - min)) * (featureRange[1] - featureRange[0]) + featureRange[0];
        },
        inverseTransform: (input) => {
            if (Array.isArray(input)) {
                return input.map(val => 
                    ((val - featureRange[0]) / (featureRange[1] - featureRange[0])) * (max - min) + min
                );
            }
            return ((input - featureRange[0]) / (featureRange[1] - featureRange[0])) * (max - min) + min;
        }
    };

    return {
        scaledData: scaler.transform(data),
        scaler
    };
}