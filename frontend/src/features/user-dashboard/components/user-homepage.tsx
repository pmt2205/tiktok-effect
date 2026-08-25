'use client';

import React, { useState, useEffect } from 'react';
import ConnectionPanel from '@/features/admin-dashboard/components/connection-panel';
import { ChatWidget } from '@/features/shared/components/chat-dashboard';
import { useUserEffects } from '@/features/user-dashboard/hooks/use-user-effects';
import { Gift, NpcCategory } from '@/types';
import { BACKEND_URL } from '@/lib/constants';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setSettings } from '@/features/admin-dashboard/store/dashboard-slice';
import { useToast } from '@/hooks/use-toast';
import Button from '@/components/ui/button';
import Select from '@/components/ui/select';

export default function UserHomepage({
  onConnect,
  onDisconnect,
  onSendMessage,
}: {
  onConnect: (username: string) => void;
  onDisconnect: () => void;
  onSendMessage: (receiver: string, message: string) => void;
}) {
  const dispatch = useAppDispatch();
  const settings = useAppSelector((state) => state.dashboard.settings);
  const allowNpc = settings.allowNpc || false;
  const toast = useToast();

  const [activeTab, setActiveTab] = useState<'single' | 'npc'>('single');
  const [npcCategory, setNpcCategory] = useState('anime');
  const [npcGifts, setNpcGifts] = useState<Gift[]>([]);
  const [npcLoading, setNpcLoading] = useState(false);
  const [selectedNpcGift, setSelectedNpcGift] = useState<Gift | null>(null);

  // Pending settings selection state
  const [pendingMode, setPendingMode] = useState<'single' | 'npc'>('single');
  const [pendingCategory, setPendingCategory] = useState('anime');
  const [categories, setCategories] = useState<NpcCategory[]>([]);
  const [savingSettings, setSavingSettings] = useState(false);

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

  return (
    <div className="flex flex-col gap-6 p-5 md:p-8 w-full animate-[fade-in-up_0.6s_ease-out] relative z-10">

      {/* Top Section: Connection & Livestream Settings (Equal Height side-by-side) */}
      {allowNpc ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          <div className="flex">
            <ConnectionPanel onConnect={onConnect} onDisconnect={onDisconnect} className="w-full" />
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
          </div>
        </div>
      ) : (
        <div className="max-w-xl">
          <ConnectionPanel onConnect={onConnect} onDisconnect={onDisconnect} />
        </div>
      )}

      {/* Bottom Section: Gift Catalog (1 hàng 6 cái on desktop) */}
      <div className="w-full">
        {activeTab === 'npc' ? (
          <div className="flex flex-col gap-4 w-full animate-[fade-in-up_0.4s_ease-out]">
            {/* Grid of NPC custom gifts */}
            {npcLoading ? (
              <div className="text-center py-24 text-[0.9rem] text-text-muted select-none">
                <i className="fa-solid fa-spinner animate-spin text-[2rem] text-primary mb-3 block" />
                <span>Loading NPC category configs...</span>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
                {npcGifts.map((gift) => {
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
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
            {customGifts.map((gift) => {
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
                  <div className="absolute inset-0 card-hover-overlay backdrop-blur-xs flex flex-col items-center justify-center gap-2.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                    <div className="w-10.5 h-10.5 rounded-full play-btn-circle flex items-center justify-center transform scale-90 group-hover:scale-100 transition-transform duration-300">
                      <i className="fa-solid fa-play text-[0.95rem] ml-0.5" />
                    </div>
                    <span className="text-[0.68rem] font-bold tracking-[1.5px] text-current uppercase select-none">{t.preview}</span>
                  </div>
                </div>
              );
            })}
          </div>
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

// Modal displaying all configured videos with a mock interactive canvas player
function VideoPresetsModal({
  gift,
  activeVideo,
  setActiveVideo,
  onClose,
  language,
  t,
}: {
  gift: Gift;
  activeVideo: string;
  setActiveVideo: (video: string) => void;
  onClose: () => void;
  language: 'vi' | 'en';
  t: Record<string, string>;
}) {
  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-5 bg-black/75 backdrop-blur-sm animate-[fade-in_0.2s_ease-out]">
      <div className="relative w-full max-w-[760px] bg-bg-surface/95 border border-border-color rounded-2xl shadow-[0_12px_48px_rgba(0,0,0,0.6)] p-6 md:p-8 animate-[fade-in-up_0.3s_cubic-bezier(0.175,0.885,0.32,1.275)] flex flex-col md:flex-row gap-6 backdrop-blur-[24px]">

        {/* Left Side: Simulation canvas player */}
        <div className="flex flex-col gap-3.5 items-center md:items-start shrink-0">
          <span className="font-header text-[0.92rem] font-bold text-white tracking-[0.5px] uppercase flex items-center gap-2 select-none">
            <i className="fa-solid fa-play text-secondary" />
            {t.previewPlayerTitle}
          </span>
          <div className="relative w-[280px] h-[360px] rounded-2xl overflow-hidden border border-border-color shadow-[0_8px_32px_rgba(0,0,0,0.5)] bg-black/90 flex items-center justify-center">
            {activeVideo ? (
              <video
                key={activeVideo}
                src={
                  activeVideo.startsWith('http://') || activeVideo.startsWith('https://')
                    ? activeVideo
                    : `${BACKEND_URL}/media/${activeVideo}`
                }
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center p-4 text-text-muted flex flex-col items-center gap-2 select-none animate-pulse">
                <i className="fa-solid fa-video-slash text-[1.8rem] opacity-35" />
                <span className="text-[0.8rem]">{language === 'vi' ? 'Không có video xem trước' : 'No preview video'}</span>
              </div>
            )}
            <div className="absolute top-3.5 left-3.5 bg-black/60 backdrop-blur-md text-[0.68rem] px-2.5 py-0.5 rounded-full border border-white/5 text-text-secondary select-none font-semibold uppercase tracking-[0.5px]">
              LIVE PREVIEW
            </div>
          </div>
        </div>

        {/* Right Side: Configuration settings and preset video list */}
        <div className="flex-1 flex flex-col justify-between">
          <div className="flex flex-col gap-5 select-none">
            <h3 className="font-header text-[1.25rem] font-bold text-white capitalize border-b border-border-color pb-3.5 flex items-center gap-2.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={gift.icon} alt={gift.name} className="w-8.5 h-8.5 object-contain filter drop-shadow-[0_2px_6px_rgba(0,0,0,0.3)]" />
              <span>{gift.name}</span>
            </h3>

            <div className="flex flex-col gap-1 text-[0.85rem]">
              <span className="text-text-secondary font-bold">{t.videosLabel}:</span>
              {gift.videos && gift.videos.length > 0 ? (
                <div className="flex flex-col gap-2 mt-2 max-h-[190px] overflow-y-auto custom-scrollbar pr-1">
                  {gift.videos.map((video) => {
                    const isActive = video === activeVideo;
                    return (
                      <button
                        key={video}
                        onClick={() => setActiveVideo(video)}
                        className={`w-full text-left px-4 py-3 rounded-xl border text-[0.78rem] font-semibold transition-all duration-200 flex items-center justify-between cursor-pointer outline-none active:scale-[0.98] ${isActive
                          ? 'bg-secondary border-secondary text-black shadow-[0_4px_12px_rgba(0,242,254,0.18)] font-bold'
                          : 'bg-black/25 border-border-color text-text-secondary hover:border-white/15 hover:text-white hover:bg-black/35'
                          }`}
                      >
                        <span className="truncate pr-3">{video}</span>
                        {isActive && <span className="text-[0.62rem] font-bold uppercase tracking-[0.5px] px-1.5 py-0.5 rounded bg-black/10 text-black shrink-0">{t.activeBadge}</span>}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <span className="text-text-muted italic text-[0.78rem] mt-1 bg-white/5 border border-white/10 p-4 rounded-xl text-center">{t.noVideos}</span>
              )}
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl font-body text-[0.82rem] font-bold bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-white/20 transition-all duration-200 cursor-pointer outline-none active:scale-[0.96]"
            >
              {t.close}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

// Modal displaying NPC mapping details in read-only format
function NpcPreviewModal({
  gift,
  onClose,
  language,
  t,
}: {
  gift: Gift;
  onClose: () => void;
  language: 'vi' | 'en';
  t: Record<string, string>;
}) {
  const activeVid = gift.activeVideo || (gift.videos && gift.videos[0]) || '';
  const hasVideo = gift.videos && gift.videos.length > 0 && activeVid;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-5 bg-black/75 backdrop-blur-sm animate-[fade-in_0.2s_ease-out]">
      <div className="relative w-full max-w-[680px] bg-bg-surface/95 border border-border-color rounded-2xl shadow-[0_12px_48px_rgba(0,0,0,0.6)] p-6 md:p-8 animate-[fade-in-up_0.3s_cubic-bezier(0.175,0.885,0.32,1.275)] flex flex-col md:flex-row gap-6 backdrop-blur-[24px]">

        {/* Left Side: Video Preview Player */}
        {hasVideo ? (
          <div className="flex flex-col gap-3.5 items-center md:items-start shrink-0">
            <span className="font-header text-[0.92rem] font-bold text-white tracking-[0.5px] uppercase flex items-center gap-2 select-none">
              <i className="fa-solid fa-play text-primary" />
              {language === 'vi' ? 'Trình phát xem trước' : 'Preview Player'}
            </span>
            <div className="relative w-[240px] h-[320px] rounded-2xl overflow-hidden border border-border-color shadow-[0_8px_32px_rgba(0,0,0,0.5)] bg-black/90 flex items-center justify-center">
              <video
                src={`${BACKEND_URL}/media/${activeVid}`}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3.5 left-3.5 bg-black/60 backdrop-blur-md text-[0.62rem] px-2.5 py-0.5 rounded-full border border-white/5 text-primary select-none font-semibold uppercase tracking-[0.5px]">
                NPC DEMO
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3.5 items-center justify-center shrink-0 w-[240px] h-[320px] bg-black/30 border border-border-color rounded-2xl">
            <i className="fa-solid fa-wand-magic-sparkles text-[2.5rem] text-primary animate-pulse" />
            <span className="text-[0.8rem] text-text-muted select-none mt-2 font-semibold">
              {language === 'vi' ? 'Không có video' : 'No video'}
            </span>
          </div>
        )}

        {/* Right Side: Read-only info */}
        <div className="flex-1 flex flex-col justify-between">
          <div className="flex flex-col gap-4">
            <h3 className="font-header text-[1.25rem] font-bold text-white capitalize border-b border-border-color pb-3.5 select-none flex items-center gap-2.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={gift.icon} alt={gift.name} className="w-8.5 h-8.5 object-contain filter drop-shadow-[0_2px_6px_rgba(0,0,0,0.3)]" />
              <span className="truncate">Demo NPC: {gift.name}</span>
            </h3>

            <div className="flex flex-col gap-3.5 text-[0.88rem]">
              <div className="flex justify-between border-b border-border-color/30 pb-2">
                <span className="text-text-muted">{language === 'vi' ? 'ID quà tặng:' : 'Gift ID:'}</span>
                <span className="text-white font-bold">{gift.giftId}</span>
              </div>
              <div className="flex justify-between border-b border-border-color/30 pb-2">
                <span className="text-text-muted">{language === 'vi' ? 'Giá trị xu:' : 'Coins value:'}</span>
                <span className="text-secondary font-bold">⚡ {gift.coins} coins</span>
              </div>
              {hasVideo && (
                <div className="flex justify-between border-b border-border-color/30 pb-2">
                  <span className="text-text-muted">{language === 'vi' ? 'Video chỉ định:' : 'Assigned Video:'}</span>
                  <span className="text-primary font-mono font-bold truncate max-w-[160px]">{activeVid}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl font-body text-[0.82rem] font-bold bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all duration-200 cursor-pointer outline-none active:scale-[0.96]"
            >
              {t.close}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
