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
  // Match the visible inner floor of jar.png inside the 320x380 overlay canvas.
  // A wider ellipse lets gifts sit close to both side walls, while the lower
  // centre keeps the pile visually resting on the glass base.
  const a = 118, b = 42, cy = 306;
  const dx = Math.min(1, Math.max(-1, (x - 161) / a));
  return cy + b * Math.sqrt(1 - dx * dx);
}
