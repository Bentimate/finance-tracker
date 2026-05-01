/**
 * Formats a number as SGD currency string.
 * Uses manual formatting for reliable output across Hermes and JSC engines.
 *
 * @example formatCurrency(1234.5)  →  "S$1,234.50"
 * @example formatCurrency(0)       →  "S$0.00"
 */
export function formatCurrency(value: number): string {
  const abs = Math.abs(value);
  const [intPart, decPart] = abs.toFixed(2).split('.');
  const formatted = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `$${formatted}.${decPart}`;
}

/**
 * Compact form for tight spaces: omits cents when amount is a round number.
 *
 * @example formatCurrencyCompact(1234)     →  "S$1,234"
 * @example formatCurrencyCompact(1234.56)  →  "S$1,234.56"
 */
export function formatCurrencyCompact(value: number): string {
  const abs = Math.abs(value);
  const isRound = abs % 1 === 0;
  const [intPart, decPart] = abs.toFixed(2).split('.');
  const formatted = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return isRound ? `$${formatted}` : `$${formatted}.${decPart}`;
}
