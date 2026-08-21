/**
 * Format price with currency settings
 */
/**
 * Format price with currency settings
 */
export const formatPrice = (
  price: number | string | null | undefined,
  currencySymbol: string = '$',
  currencyPosition: 'before' | 'after' = 'before',
  formattedCurrency?: string
): string => {
  if (price === null || price === undefined || price === '') return '';
  const num = typeof price === 'number' ? price : parseFloat(String(price));
  if (isNaN(num)) return '';

  const amount = num.toFixed(2);
  const symbol = formattedCurrency || currencySymbol;
  
  return currencyPosition === 'after' 
    ? `${amount}${symbol}` 
    : `${symbol}${amount}`;
};
