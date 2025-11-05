/**
 * Format currency values consistently across the application
 * @param amount - The amount to format
 * @param includeDecimals - Whether to include decimal places
 * @returns Formatted currency string in PKR
 */
export const formatCurrency = (amount: number, includeDecimals = false): string => {
  const formatted = includeDecimals 
    ? amount.toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : amount.toLocaleString('en-PK');
  
  return `Rs ${formatted}`;
};

/**
 * Format currency in thousands (K)
 * @param amount - The amount to format
 * @returns Formatted currency string with K suffix
 */
export const formatCurrencyK = (amount: number): string => {
  return `Rs ${(amount / 1000).toFixed(1)}K`;
};

/**
 * Parse currency string to number
 * @param value - Currency string to parse
 * @returns Parsed number value
 */
export const parseCurrency = (value: string): number => {
  return parseFloat(value.replace(/[^0-9.-]+/g, '')) || 0;
};
