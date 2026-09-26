import { mkdir, rename, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const TIKFINITY_GIFTS_URL = 'https://tikfinity.zerody.one/api/getAllGifts?lang=vi&client=giftlist';
const EXPECTED_GIFT_COUNT = 772;
const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const outputPath = resolve(scriptDirectory, '../src/features/gifts/data/vn_gifts.json');

function normalizeName(value) {
  return String(value || '')
    .normalize('NFKC')
    .trim()
    .toLocaleLowerCase('vi-VN')
    .replace(/\s+/g, ' ');
}

function firstImageUrl(gift) {
  const candidates = [
    ...(Array.isArray(gift?.image?.url_list) ? gift.image.url_list : []),
    ...(Array.isArray(gift?.image?.urlList) ? gift.image.urlList : []),
    gift?.icon,
    gift?.image_url,
  ];
  return candidates.find((value) => typeof value === 'string' && /^https:\/\//i.test(value)) || '';
}

const response = await fetch(TIKFINITY_GIFTS_URL, {
  headers: { Accept: 'application/json' },
  signal: AbortSignal.timeout(60_000),
});
if (!response.ok) throw new Error(`TikFinity returned HTTP ${response.status}`);

const rawGifts = await response.json();
if (!Array.isArray(rawGifts)) throw new Error('TikFinity response is not a gift array');

const uniqueGifts = new Map();
for (const gift of rawGifts) {
  const giftId = Number(gift?.id);
  const name = String(gift?.name || '').trim();
  const coins = Math.max(0, Number(gift?.diamond_count) || 0);
  const icon = firstImageUrl(gift);
  if (!Number.isInteger(giftId) || !name || !icon) continue;

  const key = `${normalizeName(name)}|${coins}`;
  if (!uniqueGifts.has(key)) {
    uniqueGifts.set(key, {
      giftId,
      name,
      coins,
      icon,
      videos: [],
      activeVideo: '',
    });
  }
}

const gifts = Array.from(uniqueGifts.values());
if (gifts.length !== EXPECTED_GIFT_COUNT) {
  throw new Error(`Expected ${EXPECTED_GIFT_COUNT} Vietnamese gifts, received ${gifts.length}; file was not changed`);
}

await mkdir(dirname(outputPath), { recursive: true });
const temporaryPath = `${outputPath}.tmp`;
await writeFile(temporaryPath, `${JSON.stringify(gifts, null, 2)}\n`, 'utf8');
await rename(temporaryPath, outputPath);

console.log(`Updated ${outputPath}`);
console.log(`TikFinity raw: ${rawGifts.length}; Vietnamese catalog after name+coins deduplication: ${gifts.length}`);
