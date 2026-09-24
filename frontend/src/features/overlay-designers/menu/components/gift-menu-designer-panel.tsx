'use client';

import React, { useState } from 'react';
import Select from '@/components/ui/select';
import LoadingIndicator from '@/components/ui/loading-indicator';
import { Gift, OverlaySettings } from '@/types';
import { COIN_RANGES } from '@/features/gift-catalog';
import LiveOverlayViewport from '@/features/user-dashboard/components/live-overlay-viewport';
import { FRAME_OPTIONS } from '../lib/frame-options';
import OverlayPreviewControls from '@/features/overlay-designers/components/overlay-preview-controls';

interface GiftMenuDesignerPanelProps {
  language: 'vi' | 'en';
  settings: OverlaySettings;
  customGifts: Gift[];
  npcGifts: Gift[];
  activeTab: 'single' | 'npc';
  onSaveSettings: (updates: Partial<OverlaySettings>) => Promise<void>;
  onSaveGiftText: (giftId: string, text: string, show: boolean) => Promise<void>;
  onSaveNpcGiftText: (giftId: string, text: string, show: boolean) => Promise<void>;
  maxMenuGifts?: number;
}

export default function GiftMenuDesignerPanel({
  language,
  settings,
  customGifts,
  npcGifts,
  activeTab,
  onSaveSettings,
  onSaveGiftText,
  onSaveNpcGiftText,
  maxMenuGifts = 5,
}: GiftMenuDesignerPanelProps) {
  const [localTitle, setLocalTitle] = useState(settings.menuTitle || 'MENU QUÀ TẶNG');
  const [localX, setLocalX] = useState(settings.menuX !== undefined ? settings.menuX : 15);
  const [localY, setLocalY] = useState(settings.menuY !== undefined ? settings.menuY : 20);
  const [localScale, setLocalScale] = useState(settings.menuScale !== undefined ? settings.menuScale : 1.0);
  const [localColumns, setLocalColumns] = useState(settings.menuColumns !== undefined ? settings.menuColumns : 1);
  const [localScrollThreshold, setLocalScrollThreshold] = useState(settings.menuScrollThreshold !== undefined ? settings.menuScrollThreshold : 5);
  const [localFrameScale, setLocalFrameScale] = useState(settings.menuFrameScale !== undefined ? settings.menuFrameScale : 1.0);
  const [savingGiftId, setSavingGiftId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [coinRange, setCoinRange] = useState<string>('all');
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [pickerSearchQuery, setPickerSearchQuery] = useState('');
  const [pickerCoinRange, setPickerCoinRange] = useState<string>('all');

  const gifts = activeTab === 'npc' ? npcGifts : customGifts;

  const allActiveMenuGifts = gifts.filter(
    gift => gift.menuShow !== false && (gift.menuShow === true || Boolean(gift.menuText && gift.menuText.trim() !== ''))
  );
  const activeMenuGifts = allActiveMenuGifts.slice(0, maxMenuGifts);
  const menuLimitReached = Number.isFinite(maxMenuGifts) && activeMenuGifts.length >= maxMenuGifts;

  const filteredActiveGifts = activeMenuGifts.filter(gift => {
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

  const catalogGifts = gifts.filter(gift => {
    const q = pickerSearchQuery.toLowerCase().trim();
    if (q) {
      const matchName = gift.name.toLowerCase().includes(q);
      const matchCoins = gift.coins.toString().includes(q);
      const matchId = gift.giftId ? gift.giftId.toString().includes(q) : false;
      if (!matchName && !matchCoins && !matchId) return false;
    }
    if (pickerCoinRange !== 'all') {
      const range = COIN_RANGES.find((r) => r.id === pickerCoinRange);
      if (range && (gift.coins < range.min || gift.coins > range.max)) {
        return false;
      }
    }
    return true;
  });

  const handleToggleMenu = (enabled: boolean) => {
    onSaveSettings({ menuEnabled: enabled });
  };

  const handleTitleBlur = () => {
    if (localTitle !== settings.menuTitle) {
      onSaveSettings({ menuTitle: localTitle });
    }
  };

  const handleFrameSelect = (frameFile: string) => {
    onSaveSettings({ menuFrame: frameFile });
  };

  const handleSliderChange = (field: 'scrollThreshold' | 'frameScale', val: number) => {
    if (field === 'scrollThreshold') setLocalScrollThreshold(val);
    else if (field === 'frameScale') setLocalFrameScale(val);
  };

  const handleSliderRelease = (field: 'scrollThreshold' | 'frameScale', val: number) => {
    if (field === 'scrollThreshold') onSaveSettings({ menuScrollThreshold: val });
    else if (field === 'frameScale') onSaveSettings({ menuFrameScale: val });
  };

  const handleColumnsChange = (cols: number) => {
    setLocalColumns(cols);
    onSaveSettings({ menuColumns: cols });
  };

  const handleLayoutChange = (layout: 'vertical' | 'horizontal') => {
    onSaveSettings({ menuLayout: layout });
  };

  const handleGiftTextChange = async (giftId: string, text: string, show: boolean) => {
    setSavingGiftId(giftId);
    try {
      const newShow = text.trim() !== '' ? show : false;
      if (activeTab === 'npc') {
        await onSaveNpcGiftText(giftId, text, newShow);
      } else {
        await onSaveGiftText(giftId, text, newShow);
      }
    } finally {
      setSavingGiftId(null);
    }
  };

  const handleAddToMenu = async (gift: Gift) => {
    if (menuLimitReached) return;
    setSavingGiftId(gift._id!);
    try {
      const saveFn = activeTab === 'npc' ? onSaveNpcGiftText : onSaveGiftText;
      await saveFn(gift._id!, gift.menuText || gift.name, true);
    } finally {
      setSavingGiftId(null);
    }
  };

  const handleRemoveFromMenu = async (gift: Gift) => {
    setSavingGiftId(gift._id!);
    try {
      const saveFn = activeTab === 'npc' ? onSaveNpcGiftText : onSaveGiftText;
      await saveFn(gift._id!, '', false);
    } finally {
      setSavingGiftId(null);
    }
  };

  const isMenuEnabled = settings.menuEnabled !== false;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[minmax(360px,480px)_minmax(0,1fr)] gap-5 w-full items-start animate-[fade-in-up_0.4s_ease-out]">
      {/* Left Column: UI Customization Settings */}
      <div className="order-2 bg-bg-card border border-border-color rounded-2xl p-4 backdrop-blur-[24px] flex flex-col gap-4 glass-shadow w-full">
        <div className="flex flex-col gap-1 border-b border-border-color/30 pb-3">
          <h3 className="font-header text-[1rem] font-bold text-white uppercase tracking-[0.5px] flex items-center gap-2">
            <i className="fa-solid fa-layer-group text-primary animate-pulse" />
            <span>{language === 'vi' ? 'Thiết lập giao diện Bảng Quà' : 'Gift Menu UI Customization'}</span>
          </h3>
          <p className="text-[0.72rem] text-text-muted">
            {language === 'vi'
              ? 'Tùy chỉnh tiêu đề, kích thước và vị trí bảng quà trên OBS.'
              : 'Customize title, size and position of gift menu on OBS.'}
          </p>
        </div>

        {/* Master Enable Menu Overlay Toggle */}
        <div className="flex items-center justify-between gap-3 p-3.5 bg-bg-input border border-border-color rounded-xl select-none">
          <div className="flex flex-col">
            <span className="text-[0.85rem] font-bold text-white">
              {language === 'vi' ? 'Hiển thị Bảng Quà:' : 'Show Gift Menu:'}
            </span>
            <span className="text-[0.68rem] text-text-muted">
              {language === 'vi' ? 'Bật/tắt hiển thị bảng trên stream' : 'Toggle menu visibility on stream'}
            </span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isMenuEnabled}
              onChange={(e) => handleToggleMenu(e.target.checked)}
              className="peer sr-only"
            />
            <span className="w-11 h-6 bg-white/10 rounded-full relative transition-all duration-300 border border-border-color after:absolute after:w-4 after:h-4 after:rounded-full after:bg-white after:top-[3px] after:left-[3px] after:transition-all after:duration-300 after:ease-out peer-checked:bg-primary peer-checked:border-transparent peer-checked:shadow-[0_0_8px_var(--color-primary-glow)] peer-checked:after:translate-x-[20px]" />
          </label>
        </div>

        {/* Sub-settings visible only when Menu is Enabled */}
        {isMenuEnabled && (
          <div className="flex flex-col gap-4 animate-[fade-in-up_0.25s_ease-out]">
            {/* Menu Title Input */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[0.78rem] font-bold text-text-secondary">
                {language === 'vi' ? 'Tiêu đề bảng quà:' : 'Menu Title:'}
              </label>
              <input
                type="text"
                value={localTitle}
                onChange={(e) => setLocalTitle(e.target.value)}
                onBlur={handleTitleBlur}
                placeholder="MENU QUÀ TẶNG"
                className="w-full bg-bg-input border border-border-color rounded-xl px-3.5 py-2.5 text-white font-body text-[0.85rem] outline-none transition-all duration-200 focus:border-primary focus:ring-3 focus:ring-primary-glow/25"
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {/* Layout Direction Selector (Vertical vs Horizontal) */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[0.78rem] font-bold text-text-secondary">
                {language === 'vi' ? 'Hướng hiển thị bảng quà:' : 'Layout Orientation:'}
              </label>
              <div className="grid grid-cols-2 gap-2 p-1 bg-bg-input border border-border-color rounded-xl">
                <button
                  type="button"
                  onClick={() => handleLayoutChange('vertical')}
                  className={`py-2 rounded-lg font-bold text-[0.8rem] transition-all duration-200 cursor-pointer ${
                    (settings.menuLayout || 'vertical') === 'vertical'
                      ? 'bg-primary text-white shadow-[0_2px_10px_var(--color-primary-glow)]'
                      : 'text-text-muted hover:text-white'
                  }`}
                >
                  {language === 'vi' ? 'Dọc' : 'Vertical'}
                </button>
                <button
                  type="button"
                  onClick={() => handleLayoutChange('horizontal')}
                  className={`py-2 rounded-lg font-bold text-[0.8rem] transition-all duration-200 cursor-pointer ${
                    settings.menuLayout === 'horizontal'
                      ? 'bg-primary text-white shadow-[0_2px_10px_var(--color-primary-glow)]'
                      : 'text-text-muted hover:text-white'
                  }`}
                >
                  {language === 'vi' ? 'Ngang' : 'Horizontal'}
                </button>
              </div>
            </div>

            {/* Column Display Selector (1 Column vs 2 Columns) */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[0.78rem] font-bold text-text-secondary">
                {language === 'vi' ? 'Số cột hiển thị:' : 'Grid Columns:'}
              </label>
              <div className="grid grid-cols-2 gap-2 p-1 bg-bg-input border border-border-color rounded-xl">
                <button
                  type="button"
                  onClick={() => handleColumnsChange(1)}
                  className={`py-2 rounded-lg font-bold text-[0.8rem] transition-all duration-200 cursor-pointer ${
                    localColumns === 1
                      ? 'bg-primary text-white shadow-[0_2px_10px_var(--color-primary-glow)]'
                      : 'text-text-muted hover:text-white'
                  }`}
                >
                  {language === 'vi' ? '1 Cột' : '1 Column'}
                </button>
                <button
                  type="button"
                  onClick={() => handleColumnsChange(2)}
                  className={`py-2 rounded-lg font-bold text-[0.8rem] transition-all duration-200 cursor-pointer ${
                    localColumns === 2
                      ? 'bg-primary text-white shadow-[0_2px_10px_var(--color-primary-glow)]'
                      : 'text-text-muted hover:text-white'
                  }`}
                >
                  {language === 'vi' ? '2 Cột' : '2 Columns'}
                </button>
              </div>
            </div>

            </div>

            {/* Icon Frame Selection Grid */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-[0.78rem] font-bold text-text-secondary">
                  {language === 'vi' ? 'Khung viền Icon Quà:' : 'Gift Icon Frame:'}
                </label>
                <div className="flex gap-2 text-[0.72rem]">
                  <button
                    type="button"
                    onClick={() => handleFrameSelect('none')}
                    className={`transition-colors cursor-pointer ${
                      (settings.menuFrame || 'none') === 'none'
                        ? 'text-primary font-bold underline'
                        : 'text-text-muted hover:text-white'
                    }`}
                  >
                    {language === 'vi' ? 'Không dùng' : 'None'}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2 max-h-44 overflow-y-auto custom-scrollbar p-2 bg-bg-input border border-border-color rounded-xl">
                {FRAME_OPTIONS.map((frame) => {
                  const isSelected = (settings.menuFrame || 'none') === frame.file;
                  return (
                    <button
                      key={frame.file}
                      type="button"
                      onClick={() => handleFrameSelect(frame.file)}
                      className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? 'bg-primary/15 border-primary shadow-[0_0_12px_var(--color-primary-glow)] text-primary font-bold'
                          : 'bg-bg-surface border-border-color hover:border-primary/40 text-text-muted hover:text-white'
                      }`}
                    >
                      <div className="w-10 h-10 flex items-center justify-center relative mb-1">
                        {frame.file ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={`/frame/${frame.file}`}
                            alt={language === 'vi' ? frame.nameVi : frame.nameEn}
                            className="w-8 h-8 object-contain"
                          />
                        ) : (
                          <i className="fa-solid fa-ban text-[1rem] text-text-muted" />
                        )}
                      </div>
                      <span className="text-[0.65rem] truncate max-w-full">
                        {language === 'vi' ? frame.nameVi : frame.nameEn}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Scroll Threshold Slider */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-[0.78rem]">
                <label className="font-bold text-text-secondary">
                  {language === 'vi' ? 'Số icon hiển thị trước khi cuộn:' : 'Max Visible Items Before Scroll:'}
                </label>
                <span className="font-mono text-primary font-bold">{localScrollThreshold} icon</span>
              </div>
              <input
                type="range"
                min={3}
                max={15}
                step={1}
                value={localScrollThreshold}
                onChange={(e) => handleSliderChange('scrollThreshold', parseInt(e.target.value))}
                onMouseUp={(e) => handleSliderRelease('scrollThreshold', parseInt((e.target as HTMLInputElement).value))}
                onTouchEnd={(e) => handleSliderRelease('scrollThreshold', parseInt((e.target as HTMLInputElement).value))}
                className="w-full accent-primary cursor-pointer h-1.5 bg-white/10 rounded-lg"
              />
              <p className="text-[0.68rem] text-text-muted">
                {language === 'vi'
                  ? 'Khi danh sách vượt quá số lượng này, bảng quà sẽ tự động cuộn (dọc hoặc ngang).'
                  : 'Auto scrolls when active gifts count exceeds this value.'}
              </p>
            </div>

            {/* Frame Scale Slider */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-[0.78rem]">
                <label className="font-bold text-text-secondary">
                  {language === 'vi' ? 'Kích thước Khung Frame:' : 'Frame Scale:'}
                </label>
                <span className="font-mono text-primary font-bold">{localFrameScale.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min={0.5}
                max={2.0}
                step={0.1}
                value={localFrameScale}
                onChange={(e) => handleSliderChange('frameScale', parseFloat(e.target.value))}
                onMouseUp={(e) => handleSliderRelease('frameScale', parseFloat((e.target as HTMLInputElement).value))}
                onTouchEnd={(e) => handleSliderRelease('frameScale', parseFloat((e.target as HTMLInputElement).value))}
                className="w-full accent-primary cursor-pointer h-1.5 bg-white/10 rounded-lg"
              />
            </div>
          </div>
        )}
      </div>

      {/* Right Column: Live Viewport Preview & Selected Gifts in Menu List */}
      <div className="contents">
        {/* Live Overlay Viewport */}
        <LiveOverlayViewport
          enabled={isMenuEnabled}
          showHeader={false}
          className="order-1 lg:row-span-2 !border-0 !bg-transparent !p-0 !backdrop-blur-none"
          viewportClassName="max-w-[420px] xl:max-w-[480px]"
          previewSettings={{ ...settings, menuX: localX, menuY: localY, menuScale: localScale }}
          interactionLayer={(
            <OverlayPreviewControls
              x={localX}
              y={localY}
              scale={localScale}
              target="menu"
              settingKeys={{ x: 'menuX', y: 'menuY', scale: 'menuScale' }}
              label={language === 'vi' ? 'Kéo để di chuyển' : 'Drag to move'}
              onChange={(next) => {
                setLocalX(next.x);
                setLocalY(next.y);
                setLocalScale(next.scale);
              }}
              onCommit={(next) => {
                void onSaveSettings({ menuX: next.x, menuY: next.y, menuScale: next.scale });
              }}
            />
          )}
        />

        {/* Selected Gifts Panel */}
        <div className="order-3 bg-bg-card border border-border-color rounded-2xl p-4 backdrop-blur-[24px] flex flex-col gap-4 glass-shadow w-full">
          {/* Top Header & Add Gift Button */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-border-color/30 pb-3">
            <div className="flex flex-col gap-1">
              <h4 className="font-header text-[0.98rem] font-bold text-white uppercase tracking-[0.5px] flex items-center gap-2">
                <i className="fa-solid fa-list-check text-primary animate-pulse" />
                <span>{language === 'vi' ? 'Danh sách Quà trong Menu' : 'Selected Gifts in Menu'}</span>
                <span className="text-[0.75rem] font-mono text-primary bg-primary/15 px-2 py-0.5 rounded-full border border-primary/30 ml-1">
                  {activeMenuGifts.length}
                </span>
              </h4>
              <p className="text-[0.7rem] text-text-muted">
                {language === 'vi'
                  ? 'Các món quà streamer đã chọn hiển thị trên bảng quà OBS. Nhập yêu cầu hành động tương ứng bên cạnh.'
                  : 'Gifts selected to show on your OBS menu. Write stream challenges/actions for each.'}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsPickerOpen(true)}
              className="w-full sm:w-auto shrink-0 justify-center inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-bold text-[0.82rem] shadow-[0_4px_16px_var(--color-primary-glow)] hover:scale-[1.02] hover:shadow-[0_6px_20px_var(--color-primary-glow)] active:scale-[0.98] transition-all duration-200 cursor-pointer outline-none"
            >
              <i className="fa-solid fa-plus text-[0.9rem]" />
              <span>{language === 'vi' ? 'Thêm quà vào Menu' : '+ Add Gift to Menu'}</span>
            </button>
          </div>

          {/* Search & Coin Range Filter Bar for Active Menu Gifts */}
          {activeMenuGifts.length > 0 && (
            <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-3 w-full bg-bg-input p-3 rounded-2xl border border-border-color backdrop-blur-md relative z-30">
              {/* Text Search Input */}
              <div className="relative w-full xl:max-w-xs shrink-0">
                <input
                  type="text"
                  placeholder={language === 'vi' ? 'Tìm theo tên hoặc số xu...' : 'Search active gifts...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-bg-surface border border-border-color rounded-xl pl-9 pr-8 py-2 text-white font-body text-[0.82rem] outline-none transition-all duration-200 placeholder:text-text-muted/50 focus:border-primary focus:ring-3 focus:ring-primary-glow/25"
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
          )}

          {/* Active Gifts List or Empty State */}
          <div className="flex flex-col gap-3.5 max-h-[520px] overflow-y-auto custom-scrollbar pr-1 font-body">
            {activeMenuGifts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-14 px-4 bg-bg-input border border-dashed border-border-color rounded-2xl text-center select-none gap-3">
                <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-2xl shadow-[0_0_15px_var(--color-primary-glow)]">
                  <i className="fa-solid fa-gift" />
                </div>
                <div className="flex flex-col gap-1 max-w-sm">
                  <h5 className="font-header text-[0.95rem] font-bold text-white uppercase tracking-[0.5px]">
                    {language === 'vi' ? 'Chưa có món quà nào trong Menu' : 'No Gifts in Menu Yet'}
                  </h5>
                  <p className="text-[0.75rem] text-text-muted leading-relaxed">
                    {language === 'vi'
                      ? 'Bấm nút "Thêm quà vào Menu" bên dưới để tìm và chọn các món quà bạn muốn hiển thị cho người xem.'
                      : 'Click "Add Gift to Menu" to pick gifts to showcase on your stream menu.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPickerOpen(true)}
                  className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/15 border border-primary/40 text-primary hover:bg-primary hover:text-white font-bold text-[0.8rem] transition-all duration-200 cursor-pointer outline-none shadow-sm"
                >
                  <i className="fa-solid fa-plus text-[0.85rem]" />
                  <span>{language === 'vi' ? 'Bắt đầu chọn quà' : 'Start Pick Gifts'}</span>
                </button>
              </div>
            ) : filteredActiveGifts.length === 0 ? (
              <div className="text-center py-12 text-[0.85rem] text-text-muted select-none">
                {language === 'vi' ? 'Không tìm thấy quà tặng phù hợp trong menu.' : 'No matching active gifts found.'}
              </div>
            ) : (
              filteredActiveGifts.map((gift) => {
                const isEnabled = gift.menuShow !== false;
                const isSaving = savingGiftId === gift._id;

                return (
                  <div
                    key={gift._id}
                    className={`flex flex-col xl:flex-row items-start xl:items-center gap-3 p-3 rounded-xl border transition-all duration-200 ${
                      isEnabled
                        ? 'bg-bg-surface border-border-color hover:border-primary/40'
                        : 'bg-bg-input border-border-color/50 opacity-60 hover:opacity-80'
                    }`}
                  >
                    {/* Left row: Toggle ON/OFF + Icon + Name + Coins */}
                    <div className="flex items-center gap-3.5 shrink-0 select-none">
                      {/* Toggle ON/OFF */}
                      <label className="relative inline-flex items-center cursor-pointer select-none" title={isEnabled ? (language === 'vi' ? 'Tắt hiển thị quà này' : 'Disable this gift') : (language === 'vi' ? 'Bật hiển thị quà này' : 'Enable this gift')}>
                        <input
                          type="checkbox"
                          checked={isEnabled}
                          onChange={(e) => handleGiftTextChange(gift._id!, gift.menuText || '', e.target.checked)}
                          className="peer sr-only"
                        />
                        <span className="w-8.5 h-[17px] bg-white/10 rounded-full relative transition-all duration-300 border border-border-color after:absolute after:w-[11px] after:h-[11px] after:rounded-full after:bg-white after:top-[2px] after:left-[2px] after:transition-all after:duration-300 after:ease-out peer-checked:bg-primary peer-checked:border-transparent peer-checked:after:translate-x-[16px]" />
                      </label>

                      {/* Icon */}
                      <div className="w-10 h-10 shrink-0 bg-bg-input rounded-lg flex items-center justify-center border border-border-color relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={gift.icon || 'https://sf16-website-nos.sofproxy.com/obj/tiktok-web-tx/tiktok/web/gift/rose.png'}
                          alt={gift.name}
                          className="w-7 h-7 object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://sf16-website-nos.sofproxy.com/obj/tiktok-web-tx/tiktok/web/gift/rose.png';
                          }}
                        />
                      </div>

                      {/* Name & Coins */}
                      <div className="flex flex-col justify-center min-w-[100px]">
                        <span className="text-[0.82rem] font-bold text-white leading-tight truncate max-w-[120px]">{gift.name}</span>
                        <span className="text-[0.65rem] text-text-secondary mt-0.5 flex items-center gap-0.5">
                          <span className="text-primary">⚡</span>
                          {gift.coins} coins
                        </span>
                      </div>
                    </div>

                    {/* Middle: Action Text Input */}
                    <div className="flex-1 w-full relative flex items-center">
                      <input
                        type="text"
                        defaultValue={gift.menuText || ''}
                        placeholder={language === 'vi' ? 'Ví dụ: Hát 1 bài, Múa quạt, Chạy bo...' : 'Example: Sing a song, Dance, Scream...'}
                        onBlur={(e) => handleGiftTextChange(gift._id!, e.target.value, isEnabled)}
                        disabled={!isEnabled}
                        className="w-full bg-bg-input border border-border-color rounded-lg pl-3.5 pr-10 py-2.5 text-white font-body text-[0.85rem] outline-none transition-all duration-200 placeholder:text-text-muted/40 focus:border-primary focus:ring-3 focus:ring-primary-glow/25 disabled:opacity-40 disabled:cursor-not-allowed"
                      />
                      <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center justify-center">
                        {isSaving ? (
                          <LoadingIndicator size="sm" />
                        ) : gift.menuText ? (
                          <i className="fa-solid fa-circle-check text-[0.8rem] text-success" />
                        ) : (
                          <i className="fa-solid fa-circle-question text-[0.8rem] text-text-muted opacity-50" />
                        )}
                      </div>
                    </div>

                    {/* Right: Delete / Remove Button */}
                    <button
                      type="button"
                      onClick={() => handleRemoveFromMenu(gift)}
                      title={language === 'vi' ? 'Xóa khỏi Menu' : 'Remove from Menu'}
                      className="shrink-0 p-2 text-text-muted hover:text-primary hover:bg-primary/10 rounded-lg transition-all duration-150 cursor-pointer outline-none"
                    >
                      <i className="fa-solid fa-trash-can text-[0.85rem]" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Add Gift Catalog Modal for Menu */}
      {isPickerOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-[fade-in_0.2s_ease-out]">
          <div className="bg-bg-surface border border-border-color rounded-2xl w-full max-w-4xl max-h-[88vh] flex flex-col glass-shadow shadow-2xl overflow-hidden animate-[scale-up_0.25s_ease-out]">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-border-color flex items-center justify-between bg-bg-card">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary text-lg">
                  <i className="fa-solid fa-gift" />
                </div>
                <div className="flex flex-col">
                  <h4 className="font-header text-[1rem] font-bold text-white uppercase tracking-[0.5px]">
                    {language === 'vi' ? `Kho Quà Tặng (${gifts.length} món quà)` : `Gift Catalog (${gifts.length} items)`}
                  </h4>
                  <p className="text-[0.72rem] text-text-muted">
                    {language === 'vi' ? 'Bấm "+ Thêm" món quà bạn muốn hiển thị trên Bảng Quà stream.' : 'Click "+ Add" gifts to include them in your stream menu.'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsPickerOpen(false)}
                className="w-8 h-8 rounded-lg bg-bg-input border border-border-color flex items-center justify-center text-text-muted hover:text-white hover:bg-primary/20 transition-all duration-150 cursor-pointer outline-none"
              >
                <i className="fa-solid fa-xmark text-[1rem]" />
              </button>
            </div>

            {/* Modal Filter Bar */}
            <div className="p-4 bg-bg-input border-b border-border-color flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 relative z-30">
              {/* Text Search Input */}
              <div className="relative w-full sm:max-w-md shrink-0">
                <input
                  type="text"
                  placeholder={language === 'vi' ? 'Tìm theo tên, ID hoặc số xu...' : 'Search gift name, ID or coins...'}
                  value={pickerSearchQuery}
                  onChange={(e) => setPickerSearchQuery(e.target.value)}
                  className="w-full bg-bg-surface border border-border-color rounded-xl pl-9 pr-8 py-2 text-white font-body text-[0.84rem] outline-none transition-all duration-200 placeholder:text-text-muted/50 focus:border-primary focus:ring-3 focus:ring-primary-glow/25"
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-[0.8rem]">
                  <i className="fa-solid fa-magnifying-glass" />
                </div>
                {pickerSearchQuery && (
                  <button
                    onClick={() => setPickerSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-white text-[0.8rem] cursor-pointer outline-none"
                  >
                    <i className="fa-solid fa-xmark" />
                  </button>
                )}
              </div>

              {/* Coin Range Filter Dropdown */}
              <div className="w-full sm:w-56 shrink-0">
                <Select
                  value={pickerCoinRange}
                  options={COIN_RANGES.map((r) => ({
                    value: r.id,
                    label: language === 'vi' ? `🪙 ${r.labelVi}` : `🪙 ${r.labelEn}`,
                  }))}
                  onChange={setPickerCoinRange}
                  className="mb-0"
                />
              </div>
            </div>

            {/* Modal Gifts Catalog Grid */}
            <div className="p-4 overflow-y-auto custom-scrollbar flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 font-body bg-bg-surface">
              {catalogGifts.length === 0 ? (
                <div className="col-span-full text-center py-16 text-[0.85rem] text-text-muted select-none">
                  {language === 'vi' ? 'Không tìm thấy quà tặng phù hợp trong kho.' : 'No matching gifts found in catalog.'}
                </div>
              ) : (
                catalogGifts.map((gift) => {
                  const isAdded = gift.menuShow !== false && (gift.menuShow === true || Boolean(gift.menuText && gift.menuText.trim() !== ''));
                  const isSaving = savingGiftId === gift._id;

                  return (
                    <div
                      key={gift._id}
                      className={`flex items-center justify-between gap-3 p-3 rounded-xl border transition-all duration-200 ${
                        isAdded
                          ? 'bg-primary/10 border-primary/40 shadow-[0_0_10px_var(--color-primary-glow)]'
                          : 'bg-bg-input border-border-color hover:border-primary/40'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 shrink-0 bg-bg-surface rounded-lg flex items-center justify-center border border-border-color">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={gift.icon || 'https://sf16-website-nos.sofproxy.com/obj/tiktok-web-tx/tiktok/web/gift/rose.png'}
                            alt={gift.name}
                            className="w-7 h-7 object-contain"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://sf16-website-nos.sofproxy.com/obj/tiktok-web-tx/tiktok/web/gift/rose.png';
                            }}
                          />
                        </div>
                        <div className="flex flex-col justify-center min-w-0">
                          <span className="text-[0.82rem] font-bold text-white leading-tight truncate">{gift.name}</span>
                          <span className="text-[0.68rem] text-primary font-mono mt-0.5 flex items-center gap-0.5">
                            ⚡ {gift.coins} xu
                          </span>
                        </div>
                      </div>

                      {isAdded ? (
                        <button
                          type="button"
                          onClick={() => handleRemoveFromMenu(gift)}
                          disabled={isSaving || menuLimitReached}
                          className="shrink-0 px-2.5 py-1.5 rounded-lg bg-primary/20 border border-primary/40 text-primary hover:bg-primary hover:text-white font-bold text-[0.75rem] transition-all duration-150 cursor-pointer outline-none flex items-center gap-1.5"
                        >
                          {isSaving ? (
                            <LoadingIndicator size="sm" />
                          ) : (
                            <>
                              <i className="fa-solid fa-check" />
                              <span>{language === 'vi' ? 'Đã thêm' : 'Added'}</span>
                            </>
                          )}
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleAddToMenu(gift)}
                          disabled={isSaving}
                          className="shrink-0 px-2.5 py-1.5 rounded-lg bg-bg-surface border border-border-color text-white hover:bg-primary hover:border-transparent font-bold text-[0.75rem] transition-all duration-150 cursor-pointer outline-none flex items-center gap-1.5"
                        >
                          {isSaving ? (
                            <LoadingIndicator size="sm" />
                          ) : (
                            <>
                              <i className="fa-solid fa-plus" />
                              <span>{menuLimitReached ? (language === 'vi' ? 'Đã đủ' : 'Limit') : (language === 'vi' ? 'Thêm' : 'Add')}</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-border-color flex items-center justify-between bg-bg-card">
              <span className="text-[0.75rem] text-text-muted">
                {language === 'vi'
                  ? `Đã chọn ${activeMenuGifts.length} quà trong Menu`
                  : `${activeMenuGifts.length} gifts selected in menu`}
              </span>
              <button
                type="button"
                onClick={() => setIsPickerOpen(false)}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-bold text-[0.82rem] transition-all duration-150 cursor-pointer outline-none shadow-md hover:scale-[1.02]"
              >
                {language === 'vi' ? 'Hoàn tất' : 'Done'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
