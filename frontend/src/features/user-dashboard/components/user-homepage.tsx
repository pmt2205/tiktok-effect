'use client';
/* eslint-disable @next/next/no-img-element -- Gift icons are dynamic remote media selected by the streamer. */

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import ConnectionPanel from '@/features/admin-dashboard/components/connection-panel';
import { useUserEffects } from '@/features/user-dashboard/hooks/use-user-effects';
import { useNpcCatalog } from '@/features/user-dashboard/hooks/use-npc-catalog';
import { GiftCatalogCard, GiftCatalogToolbar, SingleGiftPickerModal, useGiftCatalogFilter } from '@/features/gift-catalog';
import { Gift, OverlaySettings } from '@/types';
import { BACKEND_URL } from '@/lib/constants';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setSettings, setCustomGifts, setLikeLeaderboard } from '@/features/admin-dashboard/store/dashboard-slice';
import { useToast } from '@/hooks/use-toast';
import Select from '@/components/ui/select';
import SettingsDraftBoundary from './settings-draft-boundary';
import StreamSetupPanel from './stream-setup-panel';
import { UserSubTab } from '@/components/layout/user-sidebar';
import { getSubscriptionPlan } from '@/lib/subscription-plans';

const VideoPresetsModal = dynamic(() => import('./video-presets-modal'));
const NpcPreviewModal = dynamic(() => import('./npc-preview-modal'));
const GiftMenuDesignerPanel = dynamic(() => import('@/features/overlay-designers/menu/components/gift-menu-designer-panel'));
const GiftJarDesignerPanel = dynamic(() => import('@/features/overlay-designers/jar/components/gift-jar-designer-panel'));
const GiftTreeDesignerPanel = dynamic(() => import('@/features/overlay-designers/tree/components/gift-tree-designer-panel'));
const TtsDesignerPanel = dynamic(() => import('@/features/overlay-designers/tts/components/tts-designer-panel'));
const TopGifterDesignerPanel = dynamic(() => import('@/features/overlay-designers/top-gifter/components/top-gifter-designer-panel'));
const LikeLeaderboardDesignerPanel = dynamic(() => import('@/features/overlay-designers/like-leaderboard/components/like-leaderboard-designer-panel'));

export default function UserHomepage({
  activeSubTab = 'overview',
  onConnect,
  onDisconnect,
  onSimulateEvent,
  socketConnected,
}: {
  activeSubTab?: UserSubTab;
  onConnect: (username: string) => void;
  onDisconnect: () => void;
  onSimulateEvent?: (eventType: string, payload: unknown) => void;
  socketConnected: boolean;
}) {
  const dispatch = useAppDispatch();
  const settings = useAppSelector((state) => state.dashboard.settings);
  const authUser = useAppSelector((state) => state.auth.user);
  const subscriptionTier = authUser?.role === 'admin' ? 'promax' : authUser?.subscriptionTier || settings.subscriptionTier || 'free';
  const subscriptionPlan = getSubscriptionPlan(subscriptionTier);
  const likeLeaderboard = useAppSelector((state) => state.dashboard.likeLeaderboard);
  const allowNpc = settings.allowNpc || false;
  const toast = useToast();

  const activeTab = settings.liveMode === 'npc' ? 'npc' : 'single';

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
  const npcCategory = settings.activeNpcCategory || 'anime';
  const [selectedNpcGift, setSelectedNpcGift] = useState<Gift | null>(null);
  const [giftPickerOpen, setGiftPickerOpen] = useState(false);
  const [savingGiftSelection, setSavingGiftSelection] = useState(false);

  // Keep an optimistic selection only while its save request is in flight.
  const configuredMode = settings.liveMode === 'npc' ? 'npc' : 'single';
  const configuredCategory = settings.activeNpcCategory || 'anime';
  const [pendingMode, setPendingMode] = useState<'single' | 'npc'>(configuredMode);
  const [pendingCategory, setPendingCategory] = useState(configuredCategory);
  const [savingSettings, setSavingSettings] = useState(false);

  const displayedMode = savingSettings ? pendingMode : configuredMode;
  const displayedCategory = savingSettings ? pendingCategory : configuredCategory;
  const { categories, gifts: npcGifts, isLoading: npcLoading, saveMenuText: handleSaveNpcGiftMenuText } = useNpcCatalog({ enabled: allowNpc, category: npcCategory, allowedCategories: settings.allowedNpcCategories });

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
    handleSaveSettings(mode, displayedCategory);
  };

  const handleCategoryChange = (cat: string) => {
    if (savingSettings) return;
    setPendingCategory(cat);
    handleSaveSettings(displayedMode, cat);
  };

  const handleSaveMenuSettings = async (updates: Partial<OverlaySettings>) => {
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

  const handleToggleVideo = (enabled: boolean) => {
    handleSaveMenuSettings({ videoEnabled: enabled });
  };

  const handleToggleSound = (enabled: boolean) => {
    handleSaveMenuSettings({ soundEnabled: enabled });
  };

  const handleSaveSingleGiftSelection = async (singleGiftIds: number[]) => {
    setSavingGiftSelection(true);
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${BACKEND_URL}/api/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ singleGiftIds }),
      });
      if (!res.ok) throw new Error(`Failed to save gift selection (${res.status})`);
      dispatch(setSettings(await res.json()));
      setGiftPickerOpen(false);
      toast.success(language === 'vi' ? 'Đã lưu danh sách quà Live Đơn.' : 'Single Live gifts saved.');
    } catch (error) {
      console.error('Failed to save Single Live gifts:', error);
      toast.error(language === 'vi' ? 'Không thể lưu danh sách quà.' : 'Could not save gift selection.');
    } finally {
      setSavingGiftSelection(false);
    }
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

  const { coinRanges: COIN_RANGES, searchQuery, setSearchQuery, coinRange, setCoinRange, filteredCustomGifts, filteredNpcGifts } = useGiftCatalogFilter(customGifts, npcGifts);
  const singleGiftIds = settings.singleGiftIds || [];
  const selectedSingleGifts = filteredCustomGifts.filter((gift) => singleGiftIds.includes(gift.giftId));

  return (
    <div className="flex flex-col gap-5 p-3 min-[380px]:p-4 sm:gap-6 sm:p-5 md:p-8 w-full animate-[fade-in-up_0.6s_ease-out] relative z-10">
      {/* 1. OVERVIEW TAB: CONNECTION & LIVE MODE SETTINGS */}
      {activeSubTab === 'overview' && (
        <div className="flex flex-col gap-8 w-full">
          <StreamSetupPanel socketConnected={socketConnected} />
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
                          displayedMode === 'single'
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
                          displayedMode === 'npc'
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
                  {displayedMode === 'npc' && categories.length > 0 && (
                    <Select
                      label={language === 'vi' ? 'Chủ đề NPC được chỉ định:' : 'Active NPC Theme:'}
                      value={displayedCategory}
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
            {activeTab === 'single' && (
              <button type="button" onClick={() => setGiftPickerOpen(true)} className="shrink-0 rounded-md bg-gradient-to-r from-primary to-secondary px-4 py-2.5 text-sm font-bold text-white shadow-[0_0_15px_var(--color-primary-glow)] transition-all duration-200 hover:-translate-y-0.5">
                <i className="fa-solid fa-list-check mr-2" />
                {language === 'vi' ? `Chọn quà (${singleGiftIds.length}/${Number.isFinite(subscriptionPlan.giftLimit) ? subscriptionPlan.giftLimit : '∞'})` : `Choose gifts (${singleGiftIds.length}/${Number.isFinite(subscriptionPlan.giftLimit) ? subscriptionPlan.giftLimit : '∞'})`}
              </button>
            )}
          </div>

          <div className="flex flex-col gap-5 w-full animate-[fade-in-up_0.4s_ease-out]">
            <GiftCatalogToolbar language={language} searchQuery={searchQuery} onSearchChange={setSearchQuery} coinRange={coinRange} coinRanges={COIN_RANGES} onCoinRangeChange={setCoinRange} videoEnabled={settings.videoEnabled !== false} soundEnabled={settings.soundEnabled !== false} disabled={savingSettings} onVideoChange={handleToggleVideo} onSoundChange={handleToggleSound} />

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
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                  {filteredNpcGifts.map((gift) => <GiftCatalogCard key={gift._id} gift={gift} accent="primary" mappedLabel={t.noMapping} previewLabel={language === 'vi' ? 'Xem demo' : 'Preview'} onPreview={() => setSelectedNpcGift(gift)} />)}
                </div>
              )
            ) : selectedSingleGifts.length === 0 ? (
              <div className="text-center py-16 text-[0.85rem] text-text-muted select-none">
                <i className="fa-solid fa-gift mb-3 block text-3xl text-secondary" />
                <p>{singleGiftIds.length === 0 ? (language === 'vi' ? 'Bạn chưa chọn quà cho Live Đơn.' : 'No gifts selected for Single Live.') : (language === 'vi' ? 'Không tìm thấy quà phù hợp với bộ lọc.' : 'No selected gifts match the filters.')}</p>
                {singleGiftIds.length === 0 && <button type="button" onClick={() => setGiftPickerOpen(true)} className="mt-4 rounded-md border border-secondary bg-secondary/10 px-4 py-2 font-bold text-secondary transition-all duration-200 hover:bg-secondary hover:text-black">{language === 'vi' ? `Chọn ${Number.isFinite(subscriptionPlan.giftLimit) ? `tối đa ${subscriptionPlan.giftLimit}` : 'không giới hạn'} quà` : `Choose ${Number.isFinite(subscriptionPlan.giftLimit) ? `up to ${subscriptionPlan.giftLimit}` : 'unlimited'} gifts`}</button>}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {selectedSingleGifts.map((gift) => {
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
        <SettingsDraftBoundary revision={[activeTab, settings.menuTitle, settings.menuX, settings.menuY, settings.menuScale, settings.menuColumns, settings.menuScrollThreshold, settings.menuFrameScale].join('|')}>
          <GiftMenuDesignerPanel
          language={language}
          settings={settings}
          customGifts={customGifts}
          npcGifts={npcGifts}
          activeTab={activeTab}
          onSaveSettings={handleSaveMenuSettings}
          onSaveGiftText={handleSaveGiftMenuText}
          onSaveNpcGiftText={handleSaveNpcGiftMenuText}
          maxMenuGifts={subscriptionPlan.menuGiftLimit}
          />
        </SettingsDraftBoundary>
      )}
      {activeSubTab === 'jar' && (
        <SettingsDraftBoundary revision={[settings.jarX, settings.jarY, settings.jarScale, settings.jarGiftSize, settings.jarFallSpeed, settings.jarDecorationEnabled, settings.jarDecoration, settings.jarDanceScale, settings.jarDanceOffsetX, settings.jarColor, settings.jarNameEnabled, settings.jarNameImage, settings.jarNameScale, settings.jarNameX, settings.jarNameY, settings.jarEffectEnabled, settings.jarEffectVideo, settings.jarEffectScale, settings.jarEffectX, settings.jarEffectY, settings.jarEffectDelay].join('|')}>
          <GiftJarDesignerPanel
          language={language}
          settings={settings}
          savingSettings={savingSettings}
          onSaveSettings={handleSaveMenuSettings}
          onSimulateEvent={onSimulateEvent}
          fullOptions={subscriptionPlan.fullJar}
          canSelectStyles={subscriptionPlan.jarStyles}
          />
        </SettingsDraftBoundary>
      )}
      {activeSubTab === 'tree' && subscriptionPlan.treeAccess && (
        <SettingsDraftBoundary revision={[settings.treeX, settings.treeY, settings.treeScale, settings.treeGiftSize].join('|')}>
          <GiftTreeDesignerPanel
          language={language}
          settings={settings}
          savingSettings={savingSettings}
          onSaveSettings={handleSaveMenuSettings}
          onSimulateEvent={onSimulateEvent}
          fullOptions={subscriptionPlan.fullTree}
          />
        </SettingsDraftBoundary>
      )}
      {activeSubTab === 'tree' && !subscriptionPlan.treeAccess && (
        <div className="glass-card mx-auto flex max-w-xl flex-col items-center gap-3 rounded-lg p-8 text-center"><i className="fa-solid fa-lock text-3xl text-primary" /><h2 className="font-header text-xl font-bold text-white">{language === 'vi' ? 'Cây Quà dành cho gói Pro' : 'Gift Tree requires Pro'}</h2><p className="text-sm text-text-muted">{language === 'vi' ? 'Gói miễn phí không hỗ trợ Cây Quà. Nâng cấp Pro hoặc Pro Max để sử dụng.' : 'The Free plan does not include Gift Tree. Upgrade to Pro or Pro Max to use it.'}</p></div>
      )}
      {activeSubTab === 'tts' && subscriptionPlan.premiumFeatures && (
        <SettingsDraftBoundary revision={[settings.ttsEnabled, settings.ttsVoice, settings.ttsRate, settings.ttsPitch, settings.ttsVolume, settings.ttsTemplate, settings.ttsMaxChars, settings.ttsFilterEmoji, settings.ttsFilterBadWords].join('|')}>
          <TtsDesignerPanel
          language={language}
          settings={settings}
          savingSettings={savingSettings}
          onSaveSettings={handleSaveMenuSettings}
          onSimulateEvent={onSimulateEvent}
          />
        </SettingsDraftBoundary>
      )}
      {activeSubTab === 'topgifter' && subscriptionPlan.premiumFeatures && (
        <TopGifterDesignerPanel
          language={language}
          settings={settings}
          onSaveSettings={handleSaveMenuSettings}
          onSimulateTopGifter={handleSimulateTopGifter}
        />
      )}
      {activeSubTab === 'likeleaderboard' && subscriptionPlan.premiumFeatures && (
        <LikeLeaderboardDesignerPanel
          language={language}
          settings={settings}
          likeLeaderboard={likeLeaderboard}
          onSaveSettings={handleSaveMenuSettings}
          onSimulateLike={handleSimulateLike}
          onResetLikeLeaderboard={handleResetLikeLeaderboard}
        />
      )}

      {(['tts', 'topgifter', 'likeleaderboard'] as UserSubTab[]).includes(activeSubTab) && !subscriptionPlan.premiumFeatures && (
        <div className="glass-card mx-auto flex max-w-xl flex-col items-center gap-3 rounded-lg p-8 text-center"><i className="fa-solid fa-lock text-3xl text-primary" /><h2 className="font-header text-xl font-bold text-white">{language === 'vi' ? 'Tính năng dành cho Pro Max' : 'Pro Max feature'}</h2><p className="text-sm text-text-muted">{language === 'vi' ? 'Nâng cấp Pro Max 299.000đ để dùng TTS, BXH Tap Tay và Top Gifter vào live.' : 'Upgrade to Pro Max for TTS, Like Leaderboard and Top Gifter alerts.'}</p></div>
      )}

      {giftPickerOpen && (
        <SingleGiftPickerModal
          gifts={customGifts}
          selectedIds={singleGiftIds}
          language={language}
          maxGifts={subscriptionPlan.giftLimit}
          saving={savingGiftSelection}
          onClose={() => !savingGiftSelection && setGiftPickerOpen(false)}
          onSave={handleSaveSingleGiftSelection}
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
