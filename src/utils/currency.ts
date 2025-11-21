/**
 * Format currency values consistently across the application
 * @param amount - The amount to format (can be number or string)
 * @param includeDecimals - Whether to include decimal places
 * @returns Formatted currency string in PKR
 */
export const formatCurrency = (amount: number | string, includeDecimals = false): string => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

  if (isNaN(numAmount)) {
    return 'Rs 0';
  }

  const formatted = includeDecimals
    ? numAmount.toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : numAmount.toLocaleString('en-PK');

  return `Rs ${formatted}`;
};

/**
 * Format currency in thousands (K)
 * @param amount - The amount to format (can be number or string)
 * @returns Formatted currency string with K suffix
 */
export const formatCurrencyK = (amount: number | string): string => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

  if (isNaN(numAmount)) {
    return 'Rs 0K';
  }

  // Handle negative amounts
  const absAmount = Math.abs(numAmount);
  const formatted = (absAmount / 1000).toFixed(1);

  return `Rs ${numAmount < 0 ? '-' : ''}${formatted}K`;
};

/**
 * Parse currency string to number
 * @param value - Currency string to parse
 * @returns Parsed number value
 */
export const parseCurrency = (value: string): number => {
  if (!value || typeof value !== 'string') {
    return 0;
  }

  // Remove currency symbols, commas, and extra spaces
  const cleaned = value.replace(/[Rs,\s]/g, '').trim();

  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
};

/**
 * Validate currency input
 * @param value - The value to validate
 * @returns True if valid currency format
 */
export const isValidCurrency = (value: string | number): boolean => {
  if (typeof value === 'number') {
    return !isNaN(value) && isFinite(value);
  }

  if (typeof value === 'string') {
    const cleaned = value.replace(/[Rs,\s]/g, '').trim();
    const parsed = parseFloat(cleaned);
    return !isNaN(parsed) && isFinite(parsed);
  }

  return false;
};
