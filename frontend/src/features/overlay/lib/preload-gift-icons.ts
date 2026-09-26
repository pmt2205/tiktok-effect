type GiftIconSource = {
  icon?: string;
  image?: string;
};

export function preloadGiftIcons(gifts: GiftIconSource[], loadedUrls: Set<string>): void {
  if (typeof Image === 'undefined') return;

  for (const gift of gifts) {
    const url = gift.icon || gift.image || '';
    if (!/^https?:\/\//i.test(url) || loadedUrls.has(url)) continue;

    loadedUrls.add(url);
    const image = new Image();
    image.decoding = 'async';
    image.src = url;
  }
}
