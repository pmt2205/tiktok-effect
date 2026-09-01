'use client';

import React, { useState, useEffect, useMemo } from 'react';
import ConnectionPanel from '@/features/admin-dashboard/components/connection-panel';
import { ChatWidget } from '@/features/shared/components/chat-dashboard';
import { useUserEffects } from '@/features/user-dashboard/hooks/use-user-effects';
import { Gift, NpcCategory } from '@/types';
import { BACKEND_URL } from '@/lib/constants';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setSettings, setCustomGifts } from '@/features/admin-dashboard/store/dashboard-slice';
import { useToast } from '@/hooks/use-toast';
import Button from '@/components/ui/button';
import Select from '@/components/ui/select';
import VideoPresetsModal from './video-presets-modal';
import NpcPreviewModal from './npc-preview-modal';
import GiftMenuDesignerPanel from './gift-menu-designer-panel';
import GiftJarDesignerPanel from './gift-jar-designer-panel';
import GiftTreeDesignerPanel from './gift-tree-designer-panel';
import TtsDesignerPanel from './tts-designer-panel';

export default function UserHomepage({
  onConnect,
  onDisconnect,
  onSendMessage,
  onSimulateEvent,
}: {
  onConnect: (username: string) => void;
  onDisconnect: () => void;
  onSendMessage: (receiver: string, message: string) => void;
  onSimulateEvent?: (eventType: string, payload: any) => void;
}) {
  const dispatch = useAppDispatch();
  const settings = useAppSelector((state) => state.dashboard.settings);
  const allowNpc = settings.allowNpc || false;
  const toast = useToast();

  const [activeTab, setActiveTab] = useState<'single' | 'npc'>('single');
  const [subTab, setSubTab] = useState<'catalog' | 'menu' | 'jar' | 'tree' | 'tts'>('catalog');
  const [npcCategory, setNpcCategory] = useState('anime');
  const [npcGifts, setNpcGifts] = useState<Gift[]>([]);
  const [npcLoading, setNpcLoading] = useState(false);
  const [selectedNpcGift, setSelectedNpcGift] = useState<Gift | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Pending settings selection state
  const [pendingMode, setPendingMode] = useState<'single' | 'npc'>('single');
  const [pendingCategory, setPendingCategory] = useState('anime');
  const [categories, setCategories] = useState<NpcCategory[]>([]);
  const [savingSettings, setSavingSettings] = useState(false);

  // Reset search query when tabs change
  useEffect(() => {
    setSearchQuery('');
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

  const filteredNpcGifts = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return npcGifts;
    return npcGifts.filter(gift =>
      gift.name.toLowerCase().includes(q) || gift.coins.toString().includes(q)
    );
  }, [npcGifts, searchQuery]);

  const filteredCustomGifts = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return customGifts;
    return customGifts.filter(gift =>
      gift.name.toLowerCase().includes(q) || gift.coins.toString().includes(q)
    );
  }, [customGifts, searchQuery]);

  return (
    <div className="flex flex-col gap-6 p-5 md:p-8 w-full animate-[fade-in-up_0.6s_ease-out] relative z-10">

      {/* Top Section: Connection & Livestream Settings (Equal Height side-by-side) */}
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
                    className={`py-2 px-3 rounded-lg text-[0.8rem] font-bold transition-all duration-200 cursor-pointer outline-none flex items-center justify-center gap-1.5 active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none ${pendingMode === 'single'
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
                    className={`py-2 px-3 rounded-lg text-[0.8rem] font-bold transition-all duration-200 cursor-pointer outline-none flex items-center justify-center gap-1.5 active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none ${pendingMode === 'npc'
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

            {/* Toggle switches for enabling/disabling modes */}
            <div className="flex flex-col gap-3.5 border-t border-border-color/20 pt-3.5">
              {/* Single Live Active Toggle */}
              <div className="flex justify-between items-center select-none">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[0.82rem] text-text-secondary font-bold">
                    {language === 'vi' ? 'Trạng thái Live Đơn:' : 'Single Live State:'}
                  </span>
                  <span className="text-[0.66rem] text-text-muted">
                    {language === 'vi' ? 'Bật/tắt hiển thị hiệu ứng Live Đơn trên live' : 'Enable/disable Single Live overlay effects'}
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer select-none">
                  <input 
                    type="checkbox" 
                    checked={settings.singleEnabled !== undefined ? settings.singleEnabled : true} 
                    onChange={(e) => handleToggleSingle(e.target.checked)} 
                    className="peer sr-only"
                    disabled={savingSettings}
                  />
                  <span className="w-10 h-[20px] bg-white/8 rounded-full relative transition-all duration-300 border border-border-color after:absolute after:w-[14px] after:h-[14px] after:rounded-full after:bg-white after:top-[2px] after:left-[2px] after:transition-all after:duration-300 after:ease-out peer-checked:bg-secondary peer-checked:border-transparent peer-checked:shadow-[0_0_8px_var(--color-secondary-glow)] peer-checked:after:translate-x-[20px] peer-disabled:opacity-40" />
                </label>
              </div>

              {/* NPC Live Active Toggle */}
              <div className="flex justify-between items-center select-none">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[0.82rem] text-text-secondary font-bold">
                    {language === 'vi' ? 'Trạng thái NPC Live:' : 'NPC Live State:'}
                  </span>
                  <span className="text-[0.66rem] text-text-muted">
                    {language === 'vi' ? 'Bật/tắt hiển thị hiệu ứng NPC Live trên live' : 'Enable/disable NPC Live overlay effects'}
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer select-none">
                  <input 
                    type="checkbox" 
                    checked={settings.npcEnabled !== undefined ? settings.npcEnabled : true} 
                    onChange={(e) => handleToggleNpc(e.target.checked)} 
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

      {/* Bottom Section: Gift Catalog / Menu Designer */}
      <div className="w-full flex flex-col gap-6">
        {/* Toggle subTab */}
        <div className="flex justify-between items-center select-none border-b border-border-color pb-3">
          <div className="flex gap-2">
            <button
              onClick={() => setSubTab('catalog')}
              className={`px-4 py-2 text-[0.85rem] font-bold tracking-[0.5px] uppercase rounded-lg transition-all duration-200 cursor-pointer outline-none active:scale-[0.98] ${subTab === 'catalog'
                  ? 'bg-secondary/10 border border-secondary/20 text-secondary font-bold'
                  : 'text-text-muted hover:text-white bg-transparent border border-transparent'
                }`}
            >
              {language === 'vi' ? 'Danh sách hiệu ứng' : 'Gift Effects Mappings'}
            </button>
            <button
              onClick={() => setSubTab('menu')}
              className={`px-4 py-2 text-[0.85rem] font-bold tracking-[0.5px] uppercase rounded-lg transition-all duration-200 cursor-pointer outline-none active:scale-[0.98] ${subTab === 'menu'
                  ? 'bg-primary/10 border border-primary/20 text-primary font-bold'
                  : 'text-text-muted hover:text-white bg-transparent border border-transparent'
                }`}
            >
              {language === 'vi' ? 'Thiết kế Bảng Quà' : 'Gift Menu Designer'}
            </button>
            <button
              onClick={() => setSubTab('jar')}
              className={`px-4 py-2 text-[0.85rem] font-bold tracking-[0.5px] uppercase rounded-lg transition-all duration-200 cursor-pointer outline-none active:scale-[0.98] ${subTab === 'jar'
                  ? 'bg-secondary/10 border border-secondary/20 text-secondary font-bold'
                  : 'text-text-muted hover:text-white bg-transparent border border-transparent'
                }`}
            >
              {language === 'vi' ? 'Thiết kế Hũ Quà' : 'Gift Jar Designer'}
            </button>
            <button
              onClick={() => setSubTab('tree')}
              className={`px-4 py-2 text-[0.85rem] font-bold tracking-[0.5px] uppercase rounded-lg transition-all duration-200 cursor-pointer outline-none active:scale-[0.98] ${subTab === 'tree'
                  ? 'bg-primary/10 border border-primary/20 text-primary font-bold'
                  : 'text-text-muted hover:text-white bg-transparent border border-transparent'
                }`}
            >
              {language === 'vi' ? 'Thiết kế Cây Quà' : 'Gift Tree Designer'}
            </button>
            <button
              onClick={() => setSubTab('tts')}
              className={`px-4 py-2 text-[0.85rem] font-bold tracking-[0.5px] uppercase rounded-lg transition-all duration-200 cursor-pointer outline-none active:scale-[0.98] ${subTab === 'tts'
                  ? 'bg-secondary/10 border border-secondary/20 text-secondary font-bold'
                  : 'text-text-muted hover:text-white bg-transparent border border-transparent'
                }`}
            >
              <i className="fa-solid fa-volume-high mr-1.5" />
              {language === 'vi' ? 'Đọc Comment (TTS)' : 'TTS Comment Bot'}
            </button>
          </div>
          <span className="text-[0.7rem] text-text-muted select-none uppercase tracking-[1px] font-mono hidden sm:inline">
            {subTab === 'catalog' ? (language === 'vi' ? 'Xem & Demo Hiệu ứng' : 'View & Demo Effects') : subTab === 'menu' ? (language === 'vi' ? 'Cài đặt Bảng Quà hiển thị trên live' : 'Configure OBS Overlay Gift Menu') : subTab === 'jar' ? (language === 'vi' ? 'Cài đặt Hũ Quà hiển thị trên live' : 'Configure OBS Overlay Gift Jar') : subTab === 'tree' ? (language === 'vi' ? 'Cài đặt Cây Quà hiển thị trên live' : 'Configure OBS Overlay Gift Tree') : (language === 'vi' ? 'Cài đặt Bot Đọc Comment tự động (TTS)' : 'Configure AI TTS Comment Reader Bot')}
          </span>
        </div>

        {subTab === 'catalog' && (
          <div className="flex flex-col gap-5 w-full animate-[fade-in-up_0.4s_ease-out]">
            {/* Search Bar */}
            <div className="relative w-full max-w-sm">
              <input
                type="text"
                placeholder={language === 'vi' ? 'Tìm theo tên hoặc số xu...' : 'Search by name or coins...'}
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
                        {/* Top Row: Coin Count Badge */}
                        <div className="absolute top-3.5 right-3.5 z-10 px-2.5 py-0.5 rounded-full coin-badge backdrop-blur-md text-[0.7rem] font-semibold flex items-center gap-1 select-none">
                          <span>⚡</span>
                          <span>{gift.coins} {t.coins}</span>
                        </div>

                        {/* Card Center: Gift Image Floating */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 z-10">
                          <div className="relative w-18 h-18 mb-4 transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6 flex items-center justify-center select-none filter drop-shadow-[0_0_8px_rgba(255,0,80,0.15)]">
                            <img src={gift.icon} alt={gift.name} className="w-full h-full object-contain animate-gift-bob" />
                          </div>
                        </div>

                        {/* Card Bottom: Gift Name Overlay */}
                        <div className="absolute bottom-0 left-0 right-0 p-3.5 gift-card-gradient z-10 flex flex-col items-center">
                          <span className="font-header text-[0.9rem] font-bold text-text-main tracking-[0.5px] uppercase select-none text-center truncate w-full group-hover:text-primary transition-colors duration-150">
                            {gift.name}
                          </span>
                          <span className="text-[0.62rem] text-text-muted mt-1 px-1.5 py-0.5 rounded-md bg-white/5 border border-white/10 truncate max-w-full select-none font-mono">
                            {hasVideos ? `${activeVid}` : t.noMapping}
                          </span>
                        </div>

                        {/* Hover Overlay */}
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
                      {/* Top Row: Coin Count Badge */}
                      <div className="absolute top-3.5 right-3.5 z-10 px-2.5 py-0.5 rounded-full coin-badge backdrop-blur-md text-[0.7rem] font-semibold flex items-center gap-1 select-none">
                        <span>⚡</span>
                        <span>{gift.coins} {t.coins}</span>
                      </div>

                      {/* Decorative star background */}
                      <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.06)_1px,_transparent_1.5px)] bg-[size:16px_16px] bg-[position:0_0] z-0 pointer-events-none" />

                      {/* Card Center: Gift Image Floating */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-4 z-10">
                        <div className="relative w-18 h-18 mb-4 transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6 flex items-center justify-center select-none filter drop-shadow-[0_0_8px_rgba(0,242,254,0.15)]">
                          <img src={gift.icon} alt={gift.name} className="w-full h-full object-contain animate-gift-bob" />
                        </div>
                      </div>

                      {/* Card Bottom: Gift Name Overlay */}
                      <div className="absolute bottom-0 left-0 right-0 p-3.5 gift-card-gradient z-10 flex flex-col items-center">
                        <span className="font-header text-[0.9rem] font-bold text-text-main tracking-[0.5px] uppercase select-none text-center truncate w-full group-hover:text-secondary transition-colors duration-150">
                          {gift.name}
                        </span>

                        {/* Active effect badge */}
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

                      {/* Hover Slide Up Play Overlay */}
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
        )}
        {subTab === 'menu' && (
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
        {subTab === 'jar' && (
          <GiftJarDesignerPanel
            language={language}
            settings={settings}
            savingSettings={savingSettings}
            onSaveSettings={handleSaveMenuSettings}
            onSimulateEvent={onSimulateEvent}
          />
        )}
        {subTab === 'tree' && (
          <GiftTreeDesignerPanel
            language={language}
            settings={settings}
            savingSettings={savingSettings}
            onSaveSettings={handleSaveMenuSettings}
            onSimulateEvent={onSimulateEvent}
          />
        )}
        {subTab === 'tts' && (
          <TtsDesignerPanel
            language={language}
            settings={settings}
            savingSettings={savingSettings}
            onSaveSettings={handleSaveMenuSettings}
            onSimulateEvent={onSimulateEvent}
          />
        )}
      </div>

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
