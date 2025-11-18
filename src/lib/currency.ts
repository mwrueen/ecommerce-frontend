/**
 * Format price with currency settings
 */
export const formatPrice = (
  price: number | string,
  currencySymbol: string = '$',
  currencyPosition: 'before' | 'after' = 'before',
  formattedCurrency?: string
): string => {
  const amount = parseFloat(String(price)).toFixed(2);
  const symbol = formattedCurrency || currencySymbol;
  
  return currencyPosition === 'after' 
    ? `${amount}${symbol}` 
    : `${symbol}${amount}`;
};
