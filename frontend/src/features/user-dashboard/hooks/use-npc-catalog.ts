'use client';

import { useEffect, useState } from 'react';
import { Gift, NpcCategory } from '@/types';
import { BACKEND_URL } from '@/lib/constants';
import { useToast } from '@/hooks/use-toast';

export function useNpcCatalog({ enabled, category, allowedCategories }: { enabled: boolean; category: string; allowedCategories?: string[] }) {
  const toast = useToast();
  const [categories, setCategories] = useState<NpcCategory[]>([]);
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    void Promise.resolve().then(async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const response = await fetch(`${BACKEND_URL}/api/settings/npc-categories`, { headers: { Authorization: `Bearer ${token}` } });
        if (!response.ok) return;
        const data = await response.json() as NpcCategory[];
        setCategories(data.filter((item) => (allowedCategories || []).includes(item.name)));
      } catch (error) { console.error('Failed to load NPC categories:', error); }
    });
  }, [enabled, allowedCategories]);

  useEffect(() => {
    if (!enabled) return;
    void Promise.resolve().then(async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('auth_token');
        const response = await fetch(`${BACKEND_URL}/api/gifts/npc?category=${encodeURIComponent(category)}`, { headers: { Authorization: `Bearer ${token}` } });
        if (!response.ok) return;
        setGifts(await response.json() as Gift[]);
      } catch (error) { console.error('Failed to load NPC gifts:', error); }
      finally { setIsLoading(false); }
    });
  }, [enabled, category]);

  const saveMenuText = async (giftId: string, text: string, show: boolean) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${BACKEND_URL}/api/gifts/npc/${giftId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ menuText: text, menuShow: show, category }) });
      if (!response.ok) throw new Error('save-npc-menu-text');
      setGifts((current) => current.map((gift) => gift._id === giftId ? { ...gift, menuText: text, menuShow: show } : gift));
    } catch (error) {
      console.error('Failed to save NPC gift menu text:', error);
      toast.error('Failed to save NPC gift settings.');
    }
  };

  return { categories, gifts, isLoading, saveMenuText };
}
