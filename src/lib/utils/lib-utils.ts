
// Utility function to format the balance to 6 decimal places
// This is more accurate than using .toFixed() because it does not rount it
export const formatBalance = (balanceInEther: string): string => {
    const [integerPart, decimalPart] = balanceInEther.split(".");
    const truncatedDecimalPart = decimalPart ? decimalPart.slice(0, 6) : "000000";
    return `${integerPart}.${truncatedDecimalPart}`;
  };
  
  // Function to truncate addresses for display
export const truncateAddress = (address: string): string => {
    return address ? `${address.slice(0, 6)}...${address.slice(address.length - 4)}` : '';
  };