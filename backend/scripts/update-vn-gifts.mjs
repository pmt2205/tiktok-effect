import { mkdir, rename, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const TIKFINITY_GIFTS_URL = 'https://tikfinity.zerody.one/api/getAllGifts?lang=vi&client=giftlist';
const EXPECTED_GIFT_COUNT = 772;
const MANUAL_GIFTS = [
  {
    giftId: 9072,
    name: 'TikTok Universe',
    coins: 44999,
    icon: 'https://p16-webcast.tiktokcdn.com/img/maliva/webcast-va/8f471afbcebfda3841a6cc515e381f58~tplv-obj.webp',
    giftType: 2,
    videos: [],
    activeVideo: '',
  },
  { giftId: 6559, name: 'Ngôi sao mới nổi', coins: 99, icon: 'https://p16-webcast.tiktokcdn.com/img/alisg/webcast-sg/resource/1c015f238086c961a72893a8c0ae18cc.png~tplv-obj.webp', giftType: 2, videos: [], activeVideo: '' },
  { giftId: 5577, name: 'Hôn', coins: 150, icon: 'https://p16-webcast.tiktokcdn.com/img/maliva/webcast-va/resource/70529cd75b4d64587658c462c45dc238.png~tplv-obj.webp', giftType: 2, videos: [], activeVideo: '' },
  { giftId: 9792, name: 'Manifesting', coins: 500, icon: 'https://p16-webcast.tiktokcdn.com/img/maliva/webcast-va/resource/ca11566ae5a41ec8971cc00b51f78dac.png~tplv-obj.webp', giftType: 2, videos: [], activeVideo: '' },
  { giftId: 5739, name: 'Súng bắn tiền', coins: 500, icon: 'https://p16-webcast.tiktokcdn.com/img/maliva/webcast-va/e0589e95a2b41970f0f30f6202f5fce6~tplv-obj.webp', giftType: 2, videos: [], activeVideo: '' },
  { giftId: 7882, name: 'Trống', coins: 1000, icon: 'https://p16-webcast.tiktokcdn.com/img/maliva/webcast-va/31b83dd3ed4b279ba3c7de9d5cea3048~tplv-obj.webp', giftType: 2, videos: [], activeVideo: '' },
  { giftId: 6031, name: 'Ghế chơi game', coins: 1200, icon: 'https://p16-webcast.tiktokcdn.com/img/maliva/webcast-va/fd53368cacaba5c02fceb38903ed8dd3~tplv-obj.webp', giftType: 2, videos: [], activeVideo: '' },
  { giftId: 14056, name: 'Giấc mơ hồng', coins: 2988, icon: 'https://p16-webcast.tiktokcdn.com/img/maliva/webcast-va/resource/0de49ea9a79e65307c674596da517792.png~tplv-obj.webp', giftType: 2, videos: [], activeVideo: '' },
  { giftId: 11497, name: 'Súng kim cương', coins: 5000, icon: 'https://p16-webcast.tiktokcdn.com/img/alisg/webcast-sg/resource/651e705c26b704d03bc9c06d841808f1.png~tplv-obj.webp', giftType: 2, videos: [], activeVideo: '' },
  { giftId: 7237, name: 'Con kỳ lân ảo', coins: 5000, icon: 'https://p16-webcast.tiktokcdn.com/img/maliva/webcast-va/483c644e67e9bb1dd5970f2df00b7576~tplv-obj.webp', giftType: 2, videos: [], activeVideo: '' },
  { giftId: 8420, name: 'Ngai vàng tinh tú', coins: 7999, icon: 'https://p16-webcast.tiktokcdn.com/img/maliva/webcast-va/30063f6bc45aecc575c49ff3dbc33831~tplv-obj.webp', giftType: 2, videos: [], activeVideo: '' },
  { giftId: 7627, name: 'Chim ưng', coins: 10999, icon: 'https://p16-webcast.tiktokcdn.com/img/alisg/webcast-sg/resource/1d91543decd90e6905aa134ca01a9a43.png~tplv-obj.webp', giftType: 2, videos: [], activeVideo: '' },
  { giftId: 6041, name: 'TikTok Universe', coins: 44999, icon: 'https://p16-webcast.tiktokcdn.com/img/maliva/webcast-va/8f471afbcebfda3841a6cc515e381f58~tplv-obj.webp', giftType: 2, videos: [], activeVideo: '' },
];
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
      giftType: Number.isInteger(Number(gift?.type)) ? Number(gift.type) : undefined,
      videos: [],
      activeVideo: '',
    });
  }
}

const tikfinityGifts = Array.from(uniqueGifts.values());
if (tikfinityGifts.length !== EXPECTED_GIFT_COUNT) {
  throw new Error(`Expected ${EXPECTED_GIFT_COUNT} Vietnamese gifts, received ${tikfinityGifts.length}; file was not changed`);
}
const gifts = [
  ...tikfinityGifts,
  ...MANUAL_GIFTS.filter((manualGift) => !tikfinityGifts.some((gift) => gift.giftId === manualGift.giftId)),
];

await mkdir(dirname(outputPath), { recursive: true });
const temporaryPath = `${outputPath}.tmp`;
await writeFile(temporaryPath, `${JSON.stringify(gifts, null, 2)}\n`, 'utf8');
await rename(temporaryPath, outputPath);

console.log(`Updated ${outputPath}`);
console.log(`TikFinity raw: ${rawGifts.length}; TikFinity catalog: ${tikfinityGifts.length}; final catalog with manual gifts: ${gifts.length}`);
