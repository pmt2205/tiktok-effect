import { useMemo, useState } from 'react';
import { Gift } from '@/types';
import { COIN_RANGES } from '../lib/coin-ranges';

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
