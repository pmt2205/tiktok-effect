import { useMemo, useState } from 'react';
import { Gift } from '@/types';

const COIN_RANGES = [
  { id: 'all', labelVi: 'Tất cả Xu', labelEn: 'All Coins', min: 0, max: Infinity },
  { id: '1-9', labelVi: '1 - 9 Xu', labelEn: '1 - 9 Coins', min: 1, max: 9 },
  { id: '10-99', labelVi: '10 - 99 Xu', labelEn: '10 - 99 Coins', min: 10, max: 99 },
  { id: '100-999', labelVi: '100 - 999 Xu', labelEn: '100 - 999 Coins', min: 100, max: 999 },
  { id: '1000-9999', labelVi: '1,000 - 9,999 Xu', labelEn: '1k - 9.9k Coins', min: 1000, max: 9999 },
  { id: '10000+', labelVi: '≥ 10,000 Xu', labelEn: '10k+ Coins', min: 10000, max: Infinity },
];

function filterGifts(gifts: Gift[], query: string, rangeId: string) {
  const range = COIN_RANGES.find((item) => item.id === rangeId);
  const normalizedQuery = query.trim().toLowerCase();
  return gifts.filter((gift) => {
    const matchesQuery = !normalizedQuery || gift.name.toLowerCase().includes(normalizedQuery) || gift.coins.toString().includes(normalizedQuery) || Boolean(gift.giftId && gift.giftId.toString().includes(normalizedQuery));
    const matchesRange = !range || rangeId === 'all' || (gift.coins >= range.min && gift.coins <= range.max);
    return matchesQuery && matchesRange;
  });
}

export function useGiftCatalogFilter(customGifts: Gift[], npcGifts: Gift[]) {
  const [searchQuery, setSearchQuery] = useState('');
  const [coinRange, setCoinRange] = useState('all');
  const filteredCustomGifts = useMemo(() => filterGifts(customGifts, searchQuery, coinRange), [customGifts, searchQuery, coinRange]);
  const filteredNpcGifts = useMemo(() => filterGifts(npcGifts, searchQuery, coinRange), [npcGifts, searchQuery, coinRange]);
  return { coinRanges: COIN_RANGES, searchQuery, setSearchQuery, coinRange, setCoinRange, filteredCustomGifts, filteredNpcGifts };
}
