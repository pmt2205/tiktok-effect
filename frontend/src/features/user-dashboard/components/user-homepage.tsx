'use client';

import React, { useState, useEffect, useMemo } from 'react';
import ConnectionPanel from '@/features/admin-dashboard/components/connection-panel';
import { useUserEffects } from '@/features/user-dashboard/hooks/use-user-effects';
import { Gift, NpcCategory } from '@/types';
import { BACKEND_URL } from '@/lib/constants';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setSettings, setCustomGifts, setLikeLeaderboard } from '@/features/admin-dashboard/store/dashboard-slice';
import { useToast } from '@/hooks/use-toast';
import Button from '@/components/ui/button';
import Select from '@/components/ui/select';
import VideoPresetsModal from './video-presets-modal';
import NpcPreviewModal from './npc-preview-modal';
import GiftMenuDesignerPanel from './gift-menu-designer-panel';
import GiftJarDesignerPanel from './gift-jar-designer-panel';
import GiftTreeDesignerPanel from './gift-tree-designer-panel';
import TtsDesignerPanel from './tts-designer-panel';
import TopGifterDesignerPanel from './top-gifter-designer-panel';
import LikeLeaderboardDesignerPanel from './like-leaderboard-designer-panel';
import { UserSubTab } from '@/components/layout/user-sidebar';

export default function UserHomepage({
  activeSubTab = 'overview',
  onSelectSubTab,
  onConnect,
  onDisconnect,
  onSendMessage,
  onSimulateEvent,
}: {
  activeSubTab?: UserSubTab;
  onSelectSubTab?: (tab: UserSubTab) => void;
  onConnect: (username: string) => void;
  onDisconnect: () => void;
  onSendMessage: (receiver: string, message: string) => void;
  onSimulateEvent?: (eventType: string, payload: any) => void;
}) {
  const dispatch = useAppDispatch();
  const settings = useAppSelector((state) => state.dashboard.settings);
  const likeLeaderboard = useAppSelector((state) => state.dashboard.likeLeaderboard);
  const allowNpc = settings.allowNpc || false;
  const toast = useToast();

  const [activeTab, setActiveTab] = useState<'single' | 'npc'>('single');
  const [subTab, setSubTab] = useState<'catalog' | 'menu' | 'jar' | 'tree' | 'tts' | 'topgifter' | 'likeleaderboard'>('catalog');

  const handleSimulateTopGifter = () => {
    if (!onSimulateEvent) return;
    onSimulateEvent('top-gifter-join', {
      uniqueId: 'top_vip_fan_' + Date.now(),
      nickname: language === 'vi' ? 'Đại Gia TikTok 👑' : 'TikTok VIP Donor 👑',
      profilePictureUrl: 'https://i.pravatar.cc/150?u=vip_donor',
      totalDiamonds: 9999,
      rank: 1,
    });
    toast.success(language === 'vi' ? 'Đã bắn thử sự kiện Top Gifter vào phòng (4s)!' : 'Simulated Top Gifter join event (4s)!');
  };

  const handleSimulateLike = () => {
    const mockLikers = [
      { uniqueId: 'fan_tym_01', nickname: 'Bé Thả Tim ❤️', profilePictureUrl: 'https://i.pravatar.cc/100?img=1' },
      { uniqueId: 'fan_tym_02', nickname: 'Anh Ba Sài Gòn ⚡', profilePictureUrl: 'https://i.pravatar.cc/100?img=3' },
      { uniqueId: 'fan_tym_03', nickname: 'Neko Chan 🐱', profilePictureUrl: 'https://i.pravatar.cc/100?img=5' },
      { uniqueId: 'fan_tym_04', nickname: 'Hùng Streamer 🎮', profilePictureUrl: 'https://i.pravatar.cc/100?img=8' },
    ];
    const randomUser = mockLikers[Math.floor(Math.random() * mockLikers.length)];
    const randomLikes = Math.floor(Math.random() * 25) + 10;

    if (onSimulateEvent) {
      onSimulateEvent('like', {
        uniqueId: randomUser.uniqueId,
        nickname: randomUser.nickname,
        profilePictureUrl: randomUser.profilePictureUrl,
        likeCount: randomLikes,
      });
    }

    // Local state fallback update for instant UI feedback
    const currentList = [...(likeLeaderboard || [])];
    const existingIndex = currentList.findIndex((item) => item.uniqueId === randomUser.uniqueId);
    if (existingIndex !== -1) {
      currentList[existingIndex] = {
        ...currentList[existingIndex],
        totalLikes: currentList[existingIndex].totalLikes + randomLikes,
      };
    } else {
      currentList.push({
        uniqueId: randomUser.uniqueId,
        nickname: randomUser.nickname,
        profilePictureUrl: randomUser.profilePictureUrl,
        totalLikes: randomLikes,
        rank: 0,
      });
    }
    currentList.sort((a, b) => b.totalLikes - a.totalLikes);
    const updatedWithRanks = currentList.map((item, idx) => ({ ...item, rank: idx + 1 }));
    dispatch(setLikeLeaderboard(updatedWithRanks));

    toast.success(language === 'vi' ? `Đã thả tim thử nghiệm: +${randomLikes} tym từ @${randomUser.nickname}!` : `Simulated +${randomLikes} likes from @${randomUser.nickname}!`);
  };

  const handleResetLikeLeaderboard = () => {
    if (onSimulateEvent) {
      onSimulateEvent('reset-like-leaderboard', {});
    }
    dispatch(setLikeLeaderboard([]));
    toast.info(language === 'vi' ? 'Đã đặt lại Bảng Xếp Hạng Tap Tay!' : 'Reset Like Leaderboard!');
  };
  const [npcCategory, setNpcCategory] = useState('anime');
  const [npcGifts, setNpcGifts] = useState<Gift[]>([]);
  const [npcLoading, setNpcLoading] = useState(false);
  const [selectedNpcGift, setSelectedNpcGift] = useState<Gift | null>(null);

  // Pending settings selection state
  const [pendingMode, setPendingMode] = useState<'single' | 'npc'>('single');
  const [pendingCategory, setPendingCategory] = useState('anime');
  const [categories, setCategories] = useState<NpcCategory[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [coinRange, setCoinRange] = useState<string>('all');
  const [savingSettings, setSavingSettings] = useState(false);

  // Reset search query & coin range when tabs change
  useEffect(() => {
    setSearchQuery('');
    setCoinRange('all');
  }, [subTab, activeTab]);

  // Sync tab with settings.liveMode
  useEffect(() => {
    if (settings.liveMode === 'npc') {
      setActiveTab('npc');
    } else {
      setActiveTab('single');
    }
  }, [settings.liveMode]);

  // Sync category with settings.activeNpcCategory
  useEffect(() => {
    if (settings.activeNpcCategory) {
      setNpcCategory(settings.activeNpcCategory);
    }
  }, [settings.activeNpcCategory]);

  // Sync pending local form states
  useEffect(() => {
    if (settings.liveMode) {
      setPendingMode(settings.liveMode as 'single' | 'npc');
    }
    if (settings.activeNpcCategory) {
      setPendingCategory(settings.activeNpcCategory);
    }
  }, [settings.liveMode, settings.activeNpcCategory]);

  // Fetch available NPC categories
  useEffect(() => {
    if (allowNpc) {
      const fetchCategories = async () => {
        try {
          const token = localStorage.getItem('auth_token');
          const res = await fetch(`${BACKEND_URL}/api/settings/npc-categories`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            const allowedCats = settings.allowedNpcCategories || [];
            const filtered = data.filter((c: any) => allowedCats.includes(c.name));
            setCategories(filtered);
          }
        } catch (e) {
          console.error('Failed to load categories:', e);
        }
      };
      fetchCategories();
    }
  }, [allowNpc, settings.allowedNpcCategories]);

  const fetchNpcGifts = async (cat: string) => {
    setNpcLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${BACKEND_URL}/api/gifts/npc?category=${cat}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setNpcGifts(data);
      }
    } catch (err) {
      console.error('Failed to load NPC gifts:', err);
    } finally {
      setNpcLoading(false);
    }
  };

  useEffect(() => {
    if (allowNpc) {
      fetchNpcGifts(npcCategory);
    }
  }, [allowNpc, npcCategory]);

  const handleSaveSettings = async (mode: 'single' | 'npc', cat: string) => {
    setSavingSettings(true);
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${BACKEND_URL}/api/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          liveMode: mode,
          activeNpcCategory: cat
        })
      });
      const data = await res.json();
      dispatch(setSettings(data));
    } catch (err) {
      console.error(err);
      toast.error('Network error.');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleModeChange = (mode: 'single' | 'npc') => {
    if (savingSettings) return;
    setPendingMode(mode);
    handleSaveSettings(mode, pendingCategory);
  };

  const handleCategoryChange = (cat: string) => {
    if (savingSettings) return;
    setPendingCategory(cat);
    handleSaveSettings(pendingMode, cat);
  };

  const handleSaveMenuSettings = async (updates: Partial<any>) => {
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${BACKEND_URL}/api/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        const data = await res.json();
        dispatch(setSettings(data));
      }
    } catch (err) {
      console.error('Failed to save menu settings:', err);
      toast.error('Failed to save settings.');
    }
  };

  const handleToggleSingle = (enabled: boolean) => {
    handleSaveMenuSettings({ singleEnabled: enabled });
  };

  const handleToggleNpc = (enabled: boolean) => {
    handleSaveMenuSettings({ npcEnabled: enabled });
  };

  const handleToggleVideo = (enabled: boolean) => {
    handleSaveMenuSettings({ videoEnabled: enabled });
  };

  const handleToggleSound = (enabled: boolean) => {
    handleSaveMenuSettings({ soundEnabled: enabled });
  };

  const handleTriggerSimulation = (gift: Gift) => {
    if (!onSimulateEvent) return;
    onSimulateEvent('gift', {
      nickname: language === 'vi' ? 'Người xem thử' : 'Test Viewer',
      uniqueId: 'simulated_viewer',
      giftName: gift.name,
      repeatCount: 1,
      diamondCount: gift.coins || 1,
      giftPictureUrl: gift.icon,
      profilePictureUrl: 'https://i.pravatar.cc/100',
    });
  };

  const handleSaveGiftMenuText = async (giftId: string, text: string, show: boolean) => {
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${BACKEND_URL}/api/gifts/${giftId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ menuText: text, menuShow: show })
      });
      if (res.ok) {
        const updatedGifts = customGifts.map(g => g._id === giftId ? { ...g, menuText: text, menuShow: show } : g);
        dispatch(setCustomGifts(updatedGifts));
      }
    } catch (err) {
      console.error('Failed to save gift menu text:', err);
      toast.error('Failed to save gift settings.');
    }
  };

  const handleSaveNpcGiftMenuText = async (giftId: string, text: string, show: boolean) => {
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${BACKEND_URL}/api/gifts/npc/${giftId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ menuText: text, menuShow: show, category: npcCategory })
      });
      if (res.ok) {
        const updatedGifts = npcGifts.map(g => g._id === giftId ? { ...g, menuText: text, menuShow: show } : g);
        setNpcGifts(updatedGifts);
      }
    } catch (err) {
      console.error('Failed to save NPC gift menu text:', err);
      toast.error('Failed to save NPC gift settings.');
    }
  };

  const {
    language,
    customGifts,
    selectedGift,
    activeVideo,
    openPreview,
    closePreview,
    selectVideo,
    t,
  } = useUserEffects();

  const COIN_RANGES = useMemo(() => [
    { id: 'all', labelVi: 'Tất cả Xu', labelEn: 'All Coins', min: 0, max: Infinity },
    { id: '1-9', labelVi: '1 - 9 Xu', labelEn: '1 - 9 Coins', min: 1, max: 9 },
    { id: '10-99', labelVi: '10 - 99 Xu', labelEn: '10 - 99 Coins', min: 10, max: 99 },
    { id: '100-999', labelVi: '100 - 999 Xu', labelEn: '100 - 999 Coins', min: 100, max: 999 },
    { id: '1000-9999', labelVi: '1,000 - 9,999 Xu', labelEn: '1k - 9.9k Coins', min: 1000, max: 9999 },
    { id: '10000+', labelVi: '≥ 10,000 Xu', labelEn: '10k+ Coins', min: 10000, max: Infinity },
  ], []);

  const filteredNpcGifts = useMemo(() => {
    return npcGifts.filter((gift) => {
      const q = searchQuery.toLowerCase().trim();
      if (q) {
        const matchName = gift.name.toLowerCase().includes(q);
        const matchCoins = gift.coins.toString().includes(q);
        const matchId = gift.giftId ? gift.giftId.toString().includes(q) : false;
        if (!matchName && !matchCoins && !matchId) return false;
      }
      if (coinRange !== 'all') {
        const range = COIN_RANGES.find((r) => r.id === coinRange);
        if (range && (gift.coins < range.min || gift.coins > range.max)) {
          return false;
        }
      }
      return true;
    });
  }, [npcGifts, searchQuery, coinRange, COIN_RANGES]);

  const filteredCustomGifts = useMemo(() => {
    return customGifts.filter((gift) => {
      const q = searchQuery.toLowerCase().trim();
      if (q) {
        const matchName = gift.name.toLowerCase().includes(q);
        const matchCoins = gift.coins.toString().includes(q);
        const matchId = gift.giftId ? gift.giftId.toString().includes(q) : false;
        if (!matchName && !matchCoins && !matchId) return false;
      }
      if (coinRange !== 'all') {
        const range = COIN_RANGES.find((r) => r.id === coinRange);
        if (range && (gift.coins < range.min || gift.coins > range.max)) {
          return false;
        }
      }
      return true;
    });
  }, [customGifts, searchQuery, coinRange, COIN_RANGES]);

  return (
    <div className="flex flex-col gap-6 p-5 md:p-8 w-full animate-[fade-in-up_0.6s_ease-out] relative z-10">
      {/* 1. OVERVIEW TAB: CONNECTION & LIVE MODE SETTINGS */}
      {activeSubTab === 'overview' && (
        <div className="flex flex-col gap-8 w-full">
          {/* Top Section: Connection & Livestream Settings */}
          {allowNpc ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
              <div className="flex">
                <ConnectionPanel onConnect={onConnect} onDisconnect={onDisconnect} className="w-full" t={t} />
              </div>

              <div className="relative z-20 bg-bg-card border border-border-color rounded-2xl p-5.5 backdrop-blur-[24px] flex flex-col gap-4.5 glass-shadow transition-all duration-300 hover:border-border-glow w-full justify-between">
                <div className="flex flex-col gap-1 select-none">
                  <h3 className="font-header text-[1.1rem] font-bold text-white uppercase tracking-[0.5px] flex items-center gap-2">
                    {savingSettings ? (
                      <i className="fa-solid fa-spinner animate-spin text-secondary" />
                    ) : (
                      <i className="fa-solid fa-sliders text-secondary animate-pulse" />
                    )}
                    <span>{language === 'vi' ? 'Cài đặt chế độ Livestream' : 'Livestream Mode Settings'}</span>
                  </h3>
                  <p className="text-[0.78rem] text-text-muted">
                    {language === 'vi'
                      ? 'Thiết lập chế độ hoạt động cho overlay và đồng bộ danh mục quà tặng tương ứng.'
                      : 'Configure operation mode for overlay and sync visual gifts catalog.'}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Mode Select Tabs */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[0.8rem] text-text-secondary font-bold select-none">
                      {language === 'vi' ? 'Chế độ hoạt động:' : 'Livestream Mode:'}
                    </label>
                    <div className="grid grid-cols-2 tabs-container border border-border-color rounded-xl p-1.5 gap-1.5 shadow-inner">
                      <button
                        type="button"
                        onClick={() => handleModeChange('single')}
                        disabled={savingSettings}
                        className={`py-2 px-3 rounded-lg text-[0.8rem] font-bold transition-all duration-200 cursor-pointer outline-none flex items-center justify-center gap-1.5 active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none ${
                          pendingMode === 'single'
                            ? 'bg-secondary text-black shadow-[0_4px_12px_var(--secondary-glow)]'
                            : 'tab-btn-inactive'
                        }`}
                      >
                        <i className="fa-solid fa-user text-[0.85rem]" />
                        {language === 'vi' ? 'Live Đơn' : 'Single Live'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleModeChange('npc')}
                        disabled={savingSettings}
                        className={`py-2 px-3 rounded-lg text-[0.8rem] font-bold transition-all duration-200 cursor-pointer outline-none flex items-center justify-center gap-1.5 active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none ${
                          pendingMode === 'npc'
                            ? 'bg-primary text-white shadow-[0_4px_12px_var(--primary-glow)]'
                            : 'tab-btn-inactive'
                        }`}
                      >
                        <i className="fa-solid fa-robot text-[0.85rem]" />
                        NPC Live
                      </button>
                    </div>
                  </div>

                  {/* Category Dropdown Selector */}
                  {pendingMode === 'npc' && categories.length > 0 && (
                    <Select
                      label={language === 'vi' ? 'Chủ đề NPC được chỉ định:' : 'Active NPC Theme:'}
                      value={pendingCategory}
                      options={categories.map((c) => ({
                        value: c.name,
                        label: c.displayName,
                      }))}
                      onChange={handleCategoryChange}
                      disabled={savingSettings}
                      className="mb-0 animate-[fade-in_0.2s_ease-out]"
                    />
                  )}
                </div>

                {/* Toggle switches for video & sound effects */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 border-t border-border-color/20 pt-3.5">
                  {/* Video Effect Toggle */}
                  <div className="flex justify-between items-center select-none bg-black/20 p-2.5 rounded-xl border border-white/5">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[0.82rem] text-text-secondary font-bold flex items-center gap-1.5">
                        <i className="fa-solid fa-video text-secondary text-[0.8rem]" />
                        {language === 'vi' ? 'Phát Video Hiệu ứng Quà:' : 'Play Gift Video Effect:'}
                      </span>
                      <span className="text-[0.66rem] text-text-muted">
                        {language === 'vi'
                          ? 'Bật/tắt chạy video/particle hiệu ứng khi nhận quà'
                          : 'Play/pause gift video or particle animation'}
                      </span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={settings.videoEnabled !== undefined ? settings.videoEnabled : true}
                        onChange={(e) => handleToggleVideo(e.target.checked)}
                        className="peer sr-only"
                        disabled={savingSettings}
                      />
                      <span className="w-10 h-[20px] bg-white/8 rounded-full relative transition-all duration-300 border border-border-color after:absolute after:w-[14px] after:h-[14px] after:rounded-full after:bg-white after:top-[2px] after:left-[2px] after:transition-all after:duration-300 after:ease-out peer-checked:bg-secondary peer-checked:border-transparent peer-checked:shadow-[0_0_8px_var(--color-secondary-glow)] peer-checked:after:translate-x-[20px] peer-disabled:opacity-40" />
                    </label>
                  </div>

                  {/* Sound Effect Toggle */}
                  <div className="flex justify-between items-center select-none bg-black/20 p-2.5 rounded-xl border border-white/5">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[0.82rem] text-text-secondary font-bold flex items-center gap-1.5">
                        <i className="fa-solid fa-volume-high text-primary text-[0.8rem]" />
                        {language === 'vi' ? 'Phát Âm thanh Quà:' : 'Play Gift Sound:'}
                      </span>
                      <span className="text-[0.66rem] text-text-muted">
                        {language === 'vi'
                          ? 'Bật/tắt âm thanh hiệu ứng khi quà được tặng'
                          : 'Enable/disable sound when receiving gifts'}
                      </span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={settings.soundEnabled !== undefined ? settings.soundEnabled : true}
                        onChange={(e) => handleToggleSound(e.target.checked)}
                        className="peer sr-only"
                        disabled={savingSettings}
                      />
                      <span className="w-10 h-[20px] bg-white/8 rounded-full relative transition-all duration-300 border border-border-color after:absolute after:w-[14px] after:h-[14px] after:rounded-full after:bg-white after:top-[2px] after:left-[2px] after:transition-all after:duration-300 after:ease-out peer-checked:bg-primary peer-checked:border-transparent peer-checked:shadow-[0_0_8px_var(--color-primary-glow)] peer-checked:after:translate-x-[20px] peer-disabled:opacity-40" />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-xl">
              <ConnectionPanel onConnect={onConnect} onDisconnect={onDisconnect} t={t} />
            </div>
          )}

          {/* Quick Feature Shortcuts Grid */}
          <div className="flex flex-col gap-4">
            <h3 className="font-header text-lg font-extrabold text-white flex items-center gap-2">
              <i className="fa-solid fa-[#00f2fe] fa-wand-magic-sparkles text-secondary" />
              <span>{language === 'vi' ? 'Lối Tắt Chức Năng Nổi Bật' : 'Feature Shortcuts'}</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div
                onClick={() => onSelectSubTab?.('catalog')}
                className="glass-card p-5 rounded-2xl border border-white/10 hover:border-secondary/50 bg-[#0d0f18]/80 cursor-pointer transition-all duration-300 hover:scale-[1.02] flex flex-col gap-2"
              >
                <div className="w-10 h-10 rounded-xl bg-secondary/15 flex items-center justify-center text-secondary text-lg">
                  <i className="fa-solid fa-gift" />
                </div>
                <span className="font-header font-bold text-white text-base">
                  {language === 'vi' ? 'Danh Mục Quà & Hiệu Ứng' : 'Gift Catalog'}
                </span>
                <span className="text-xs text-text-muted">
                  {language === 'vi'
                    ? 'Xem danh sách quà tặng và gán hiệu ứng video MP4/âm thanh'
                    : 'Map MP4 video & sound effects to TikTok gifts'}
                </span>
              </div>

              <div
                onClick={() => onSelectSubTab?.('menu')}
                className="glass-card p-5 rounded-2xl border border-white/10 hover:border-primary/50 bg-[#0d0f18]/80 cursor-pointer transition-all duration-300 hover:scale-[1.02] flex flex-col gap-2"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center text-primary text-lg">
                  <i className="fa-solid fa-layer-group" />
                </div>
                <span className="font-header font-bold text-white text-base">
                  {language === 'vi' ? 'Menu Quà Tặng' : 'Gift Menu'}
                </span>
                <span className="text-xs text-text-muted">
                  {language === 'vi'
                    ? 'Cấu hình khung quà mẫu (KPop, Mây, Vàng, Vương Miện)'
                    : 'Customize gift menu overlays & frames'}
                </span>
              </div>

              <div
                onClick={() => onSelectSubTab?.('jar')}
                className="glass-card p-5 rounded-2xl border border-white/10 hover:border-secondary/50 bg-[#0d0f18]/80 cursor-pointer transition-all duration-300 hover:scale-[1.02] flex flex-col gap-2"
              >
                <div className="w-10 h-10 rounded-xl bg-secondary/15 flex items-center justify-center text-secondary text-lg">
                  <i className="fa-solid fa-box-archive" />
                </div>
                <span className="font-header font-bold text-white text-base">
                  {language === 'vi' ? 'Hũ Quà TikTok' : 'Gift Jar Physics'}
                </span>
                <span className="text-xs text-text-muted">
                  {language === 'vi'
                    ? 'Mô phỏng vật lý hũ rơi quà độc đáo trên livestream'
                    : 'Interactive gift jar with physics simulation'}
                </span>
              </div>

              <div
                onClick={() => onSelectSubTab?.('tree')}
                className="glass-card p-5 rounded-2xl border border-white/10 hover:border-primary/50 bg-[#0d0f18]/80 cursor-pointer transition-all duration-300 hover:scale-[1.02] flex flex-col gap-2"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center text-primary text-lg">
                  <i className="fa-solid fa-tree" />
                </div>
                <span className="font-header font-bold text-white text-base">
                  {language === 'vi' ? 'Cây Quà TikTok' : 'Gift Tree'}
                </span>
                <span className="text-xs text-text-muted">
                  {language === 'vi'
                    ? 'Hiệu ứng cây đung đưa nảy quả trái tim/quà tặng'
                    : 'Swaying tree overlay blooming gifts'}
                </span>
              </div>

              <div
                onClick={() => onSelectSubTab?.('tts')}
                className="glass-card p-5 rounded-2xl border border-white/10 hover:border-secondary/50 bg-[#0d0f18]/80 cursor-pointer transition-all duration-300 hover:scale-[1.02] flex flex-col gap-2"
              >
                <div className="w-10 h-10 rounded-xl bg-secondary/15 flex items-center justify-center text-secondary text-lg">
                  <i className="fa-solid fa-volume-high" />
                </div>
                <span className="font-header font-bold text-white text-base">
                  {language === 'vi' ? 'Giọng Nói TTS' : 'Text-To-Speech'}
                </span>
                <span className="text-xs text-text-muted">
                  {language === 'vi'
                    ? 'Tự động đọc bình luận comment người xem khi live'
                    : 'Auto read viewer live comments aloud'}
                </span>
              </div>

              <div
                onClick={() => onSelectSubTab?.('topgifter')}
                className="glass-card p-5 rounded-2xl border border-white/10 hover:border-yellow-500/50 bg-[#0d0f18]/80 cursor-pointer transition-all duration-300 hover:scale-[1.02] flex flex-col gap-2"
              >
                <div className="w-10 h-10 rounded-xl bg-yellow-500/15 flex items-center justify-center text-yellow-400 text-lg">
                  <i className="fa-solid fa-crown" />
                </div>
                <span className="font-header font-bold text-white text-base">
                  {language === 'vi' ? 'Top Gifter Vào Phòng' : 'Top Gifter Alert'}
                </span>
                <span className="text-xs text-text-muted">
                  {language === 'vi'
                    ? 'Hiện thông báo 4s khi đại gia tặng quà tham gia live'
                    : 'Display 4s popup when VIP gifter enters live'}
                </span>
              </div>

              <div
                onClick={() => onSelectSubTab?.('likeleaderboard')}
                className="glass-card p-5 rounded-2xl border border-white/10 hover:border-primary/50 bg-[#0d0f18]/80 cursor-pointer transition-all duration-300 hover:scale-[1.02] flex flex-col gap-2"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center text-primary text-lg">
                  <i className="fa-solid fa-heart" />
                </div>
                <span className="font-header font-bold text-white text-base">
                  {language === 'vi' ? 'BXH Tap Tay (Tym Live)' : 'Like Leaderboard'}
                </span>
                <span className="text-xs text-text-muted">
                  {language === 'vi'
                    ? 'Bảng xếp hạng Bục 3 Cột (Top 1, 2, 3) người thả tim nhiều nhất'
                    : 'Real-time 3-Podium leaderboard for top likers'}
                </span>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* 2. GIFT CATALOG TAB */}
      {activeSubTab === 'catalog' && (
        <div className="flex flex-col gap-6 w-full animate-[fade-in-up_0.4s_ease-out]">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="font-header text-xl font-extrabold text-white flex items-center gap-2">
                <i className="fa-solid fa-gift text-secondary" />
                <span>{language === 'vi' ? 'Danh Sách Quà Tặng & Ánh Xạ Hiệu Ứng' : 'Gift Catalog & Visual Effects'}</span>
              </h3>
              <p className="text-xs text-text-muted mt-1">
                {language === 'vi'
                  ? 'Tìm kiếm quà tặng TikTok và gán hiệu ứng Video (.mp4) hoặc Âm thanh khi người xem gửi quà.'
                  : 'Search TikTok gifts and assign MP4 video or sound effects triggered when received.'}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-5 w-full animate-[fade-in-up_0.4s_ease-out]">
            {/* Search & Coin Range Filter Bar + Video & Sound Quick Controls */}
            <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-4 w-full bg-black/20 p-3 rounded-2xl border border-border-color/40 backdrop-blur-md relative z-30">
              {/* Text Search Input */}
              <div className="relative w-full lg:max-w-xs shrink-0">
                <input
                  type="text"
                  placeholder={language === 'vi' ? 'Tìm theo tên, ID hoặc số xu...' : 'Search name, ID or coins...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-bg-input border border-border-color rounded-xl pl-9 pr-8 py-2 text-white font-body text-[0.82rem] outline-none transition-all duration-200 placeholder:text-white/25 focus:border-secondary focus:ring-3 focus:ring-secondary-glow/25"
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-[0.8rem]">
                  <i className="fa-solid fa-magnifying-glass" />
                </div>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-white text-[0.8rem] cursor-pointer outline-none"
                  >
                    <i className="fa-solid fa-xmark" />
                  </button>
                )}
              </div>

              {/* Quick Video & Sound Toggles */}
              <div className="flex items-center gap-3 shrink-0 select-none">
                {/* Video toggle pill */}
                <label className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[0.78rem] font-bold cursor-pointer transition-all duration-200 ${
                  (settings.videoEnabled !== false)
                    ? 'bg-secondary/15 border-secondary text-white shadow-[0_0_8px_var(--color-secondary-glow)]'
                    : 'bg-black/30 border-white/10 text-text-muted opacity-60'
                }`}>
                  <input
                    type="checkbox"
                    checked={settings.videoEnabled !== undefined ? settings.videoEnabled : true}
                    onChange={(e) => handleToggleVideo(e.target.checked)}
                    className="sr-only"
                    disabled={savingSettings}
                  />
                  <i className={`fa-solid fa-video ${settings.videoEnabled !== false ? 'text-secondary animate-pulse' : 'text-text-muted'}`} />
                  <span>{language === 'vi' ? 'Video Quà' : 'Gift Video'}</span>
                  <span className={`w-2 h-2 rounded-full ${settings.videoEnabled !== false ? 'bg-secondary' : 'bg-white/20'}`} />
                </label>

                {/* Sound toggle pill */}
                <label className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[0.78rem] font-bold cursor-pointer transition-all duration-200 ${
                  (settings.soundEnabled !== false)
                    ? 'bg-primary/15 border-primary text-white shadow-[0_0_8px_var(--color-primary-glow)]'
                    : 'bg-black/30 border-white/10 text-text-muted opacity-60'
                }`}>
                  <input
                    type="checkbox"
                    checked={settings.soundEnabled !== undefined ? settings.soundEnabled : true}
                    onChange={(e) => handleToggleSound(e.target.checked)}
                    className="sr-only"
                    disabled={savingSettings}
                  />
                  <i className={`fa-solid fa-volume-high ${settings.soundEnabled !== false ? 'text-primary animate-pulse' : 'text-text-muted'}`} />
                  <span>{language === 'vi' ? 'Âm Thanh Quà' : 'Gift Sound'}</span>
                  <span className={`w-2 h-2 rounded-full ${settings.soundEnabled !== false ? 'bg-primary' : 'bg-white/20'}`} />
                </label>
              </div>

              {/* Coin Range Dropdown Filter using Select component */}
              <div className="w-full sm:w-52 shrink-0">
                <Select
                  value={coinRange}
                  options={COIN_RANGES.map((r) => ({
                    value: r.id,
                    label: language === 'vi' ? `🪙 ${r.labelVi}` : `🪙 ${r.labelEn}`,
                  }))}
                  onChange={setCoinRange}
                  className="mb-0"
                />
              </div>
            </div>

            {activeTab === 'npc' ? (
              npcLoading ? (
                <div className="text-center py-24 text-[0.9rem] text-text-muted select-none">
                  <i className="fa-solid fa-spinner animate-spin text-[2rem] text-primary mb-3 block" />
                  <span>Loading NPC category configs...</span>
                </div>
              ) : filteredNpcGifts.length === 0 ? (
                <div className="text-center py-16 text-[0.85rem] text-text-muted select-none">
                  {language === 'vi' ? 'Không tìm thấy quà tặng phù hợp.' : 'No matching gifts found.'}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
                  {filteredNpcGifts.map((gift) => {
                    const hasVideos = gift.videos && gift.videos.length > 0;
                    const activeVid = gift.activeVideo || (gift.videos && gift.videos[0]) || '';

                    return (
                      <div
                        key={gift._id}
                        onClick={() => hasVideos && setSelectedNpcGift(gift)}
                        className="aspect-[9/16] w-full max-w-[210px] mx-auto rounded-2xl overflow-hidden relative group cursor-pointer border border-border-color bg-bg-card backdrop-blur-md glass-shadow transition-all duration-300 hover:border-primary hover:shadow-[0_0_15px_rgba(255,0,80,0.25)] hover:-translate-y-1"
                      >
                        <div className="absolute top-3.5 right-3.5 z-10 px-2.5 py-0.5 rounded-full coin-badge backdrop-blur-md text-[0.7rem] font-semibold flex items-center gap-1 select-none">
                          <span>⚡</span>
                          <span>{gift.coins} {t.coins}</span>
                        </div>
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 z-10">
                          <div className="relative w-18 h-18 mb-4 transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6 flex items-center justify-center select-none filter drop-shadow-[0_0_8px_rgba(255,0,80,0.15)]">
                            <img src={gift.icon} alt={gift.name} className="w-full h-full object-contain animate-gift-bob" />
                          </div>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 p-3.5 gift-card-gradient z-10 flex flex-col items-center">
                          <span className="font-header text-[0.9rem] font-bold text-text-main tracking-[0.5px] uppercase select-none text-center truncate w-full group-hover:text-primary transition-colors duration-150">
                            {gift.name}
                          </span>
                          <span className="text-[0.62rem] text-text-muted mt-1 px-1.5 py-0.5 rounded-md bg-white/5 border border-white/10 truncate max-w-full select-none font-mono">
                            {hasVideos ? `${activeVid}` : t.noMapping}
                          </span>
                        </div>
                        {hasVideos && (
                          <div className="absolute inset-0 card-hover-overlay backdrop-blur-xs flex flex-col items-center justify-center gap-2.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                            <div className="w-10.5 h-10.5 rounded-full bg-primary flex items-center justify-center text-white shadow-[0_0_15px_rgba(255,0,80,0.4)] transform scale-90 group-hover:scale-100 transition-transform duration-300">
                              <i className="fa-solid fa-play text-[0.95rem] ml-0.5" />
                            </div>
                            <span className="text-[0.68rem] font-bold tracking-[1.5px] text-current uppercase select-none">XEM DEMO</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )
            ) : filteredCustomGifts.length === 0 ? (
              <div className="text-center py-16 text-[0.85rem] text-text-muted select-none">
                {language === 'vi' ? 'Không tìm thấy quà tặng phù hợp.' : 'No matching gifts found.'}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
                {filteredCustomGifts.map((gift) => {
                  const hasVideos = gift.videos && gift.videos.length > 0;

                  return (
                    <div
                      key={gift.giftId}
                      onClick={() => openPreview(gift)}
                      className="aspect-[9/16] w-full max-w-[210px] mx-auto rounded-2xl overflow-hidden relative group cursor-pointer border border-border-color bg-bg-card backdrop-blur-md glass-shadow transition-all duration-300 hover:border-secondary hover:shadow-[0_0_15px_rgba(0,242,254,0.15)] hover:-translate-y-1"
                    >
                      <div className="absolute top-3.5 right-3.5 z-10 px-2.5 py-0.5 rounded-full coin-badge backdrop-blur-md text-[0.7rem] font-semibold flex items-center gap-1 select-none">
                        <span>⚡</span>
                        <span>{gift.coins} {t.coins}</span>
                      </div>
                      <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.06)_1px,_transparent_1.5px)] bg-[size:16px_16px] bg-[position:0_0] z-0 pointer-events-none" />
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-4 z-10">
                        <div className="relative w-18 h-18 mb-4 transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6 flex items-center justify-center select-none filter drop-shadow-[0_0_8px_rgba(0,242,254,0.15)]">
                          <img src={gift.icon} alt={gift.name} className="w-full h-full object-contain animate-gift-bob" />
                        </div>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-3.5 gift-card-gradient z-10 flex flex-col items-center">
                        <span className="font-header text-[0.9rem] font-bold text-text-main tracking-[0.5px] uppercase select-none text-center truncate w-full group-hover:text-secondary transition-colors duration-150">
                          {gift.name}
                        </span>
                        {hasVideos ? (
                          <span className="text-[0.62rem] text-secondary font-semibold mt-1 px-2 py-0.5 rounded-md bg-secondary/10 border border-secondary/15 truncate max-w-full font-mono">
                            {gift.activeVideo || gift.videos[0]}
                          </span>
                        ) : (
                          <span className="text-[0.62rem] text-text-muted mt-1 px-1.5 py-0.5 rounded-md bg-white/5 border border-white/10 select-none">
                            {t.noMapping}
                          </span>
                        )}
                      </div>
                      <div
                        className="absolute inset-0 card-hover-overlay backdrop-blur-xs flex flex-col items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => openPreview(gift)}
                          className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-white font-bold text-[0.72rem] uppercase tracking-[0.5px] active:scale-[0.97] transition-all cursor-pointer w-28 text-center"
                        >
                          <i className="fa-solid fa-desktop mr-1.5" />
                          {language === 'vi' ? 'Xem thử' : 'Local'}
                        </button>
                        {onSimulateEvent && (
                          <button
                            type="button"
                            onClick={() => handleTriggerSimulation(gift)}
                            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-secondary to-[#00c2ee] hover:shadow-[0_0_12px_var(--color-secondary-glow)] text-black font-bold text-[0.72rem] uppercase tracking-[0.5px] active:scale-[0.97] transition-all cursor-pointer w-28 text-center"
                          >
                            <i className="fa-solid fa-paper-plane mr-1.5" />
                            Test OBS
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. OTHER OVERLAY SETTINGS TABS */}
      {activeSubTab === 'menu' && (
        <GiftMenuDesignerPanel
          language={language}
          settings={settings}
          customGifts={customGifts}
          npcGifts={npcGifts}
          activeTab={activeTab}
          savingSettings={savingSettings}
          onSaveSettings={handleSaveMenuSettings}
          onSaveGiftText={handleSaveGiftMenuText}
          onSaveNpcGiftText={handleSaveNpcGiftMenuText}
        />
      )}
      {activeSubTab === 'jar' && (
        <GiftJarDesignerPanel
          language={language}
          settings={settings}
          savingSettings={savingSettings}
          onSaveSettings={handleSaveMenuSettings}
          onSimulateEvent={onSimulateEvent}
        />
      )}
      {activeSubTab === 'tree' && (
        <GiftTreeDesignerPanel
          language={language}
          settings={settings}
          savingSettings={savingSettings}
          onSaveSettings={handleSaveMenuSettings}
          onSimulateEvent={onSimulateEvent}
        />
      )}
      {activeSubTab === 'tts' && (
        <TtsDesignerPanel
          language={language}
          settings={settings}
          savingSettings={savingSettings}
          onSaveSettings={handleSaveMenuSettings}
          onSimulateEvent={onSimulateEvent}
        />
      )}
      {activeSubTab === 'topgifter' && (
        <TopGifterDesignerPanel
          language={language}
          settings={settings}
          onSaveSettings={handleSaveMenuSettings}
          onSimulateTopGifter={handleSimulateTopGifter}
        />
      )}
      {activeSubTab === 'likeleaderboard' && (
        <LikeLeaderboardDesignerPanel
          language={language}
          settings={settings}
          likeLeaderboard={likeLeaderboard}
          onSaveSettings={handleSaveMenuSettings}
          onSimulateLike={handleSimulateLike}
          onResetLikeLeaderboard={handleResetLikeLeaderboard}
        />
      )}

      {/* Video Presets Modal */}
      {selectedGift && (
        <VideoPresetsModal
          gift={selectedGift}
          activeVideo={activeVideo}
          setActiveVideo={selectVideo}
          onClose={closePreview}
          language={language}
          t={t}
        />
      )}

      {/* NPC Preview Modal */}
      {selectedNpcGift && (
        <NpcPreviewModal
          gift={selectedNpcGift}
          onClose={() => setSelectedNpcGift(null)}
          language={language}
          t={t}
        />
      )}
    </div>
  );
}
