export function getJarBottomY(x: number, jarType?: string): number {
  if (jarType === 'promax') {
    const a = 80, b = 35, cy = 231;
    const dx = Math.min(1, Math.max(-1, (x - 160) / a));
    return cy + b * Math.sqrt(1 - dx * dx);
  }
  if (jarType === 'pro') {
    const a = x < 160 ? 137 : 100;
    const dx = Math.min(1, Math.max(-1, (x - 160) / a));
    return 305 + 63 * Math.sqrt(1 - dx * dx);
  }
  const a = 90, b = 46, cy = 286;
  const dx = Math.min(1, Math.max(-1, (x - 161) / a));
  return cy + b * Math.sqrt(1 - dx * dx);
}
