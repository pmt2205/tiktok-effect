const imageCache = new Map<string, HTMLImageElement>();

/** Reuses gift media across physics-loop restarts and overlay remounts. */
export function getJarImage(url: string) {
  const cached = imageCache.get(url);
  if (cached) return cached;
  const image = new Image();
  image.decoding = 'async';
  image.referrerPolicy = 'no-referrer';
  image.src = url;
  imageCache.set(url, image);
  return image;
}

export function clearJarImageCache() {
  imageCache.clear();
}
