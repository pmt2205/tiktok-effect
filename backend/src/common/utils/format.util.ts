/**
 * Format large numbers for display (e.g. 10400 -> 10.4K)
 */
export function formatNumber(num: number): string {
  if (!num) return '0';
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1) + 'M';
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(1) + 'K';
  }
  return num.toString();
}
