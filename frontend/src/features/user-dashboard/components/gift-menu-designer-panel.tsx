'use client';

import React, { useState, useEffect } from 'react';
import Select from '@/components/ui/select';
import { Gift } from '@/types';
import { FRAME_OPTIONS } from '@/lib/constants';

interface GiftMenuDesignerPanelProps {
  language: 'vi' | 'en';
  settings: any;
  customGifts: Gift[];
  npcGifts: Gift[];
  activeTab: 'single' | 'npc';
  savingSettings: boolean;
  onSaveSettings: (updates: Partial<any>) => Promise<void>;
  onSaveGiftText: (giftId: string, text: string, show: boolean) => Promise<void>;
  onSaveNpcGiftText: (giftId: string, text: string, show: boolean) => Promise<void>;
}

export default function GiftMenuDesignerPanel({
  language,
  settings,
  customGifts,
  npcGifts,
  activeTab,
  savingSettings,
  onSaveSettings,
  onSaveGiftText,
  onSaveNpcGiftText,
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

  const COIN_RANGES = [
    { id: 'all', labelVi: 'Tất cả Xu', labelEn: 'All Coins', min: 0, max: Infinity },
    { id: '1-9', labelVi: '1 - 9 Xu', labelEn: '1 - 9 Coins', min: 1, max: 9 },
    { id: '10-99', labelVi: '10 - 99 Xu', labelEn: '10 - 99 Coins', min: 10, max: 99 },
    { id: '100-999', labelVi: '100 - 999 Xu', labelEn: '100 - 999 Coins', min: 100, max: 999 },
    { id: '1000-9999', labelVi: '1,000 - 9,999 Xu', labelEn: '1k - 9.9k Coins', min: 1000, max: 9999 },
    { id: '10000+', labelVi: '≥ 10,000 Xu', labelEn: '10k+ Coins', min: 10000, max: Infinity },
  ];

  const gifts = activeTab === 'npc' ? npcGifts : customGifts;

  // Active gifts in streamer's menu list (menuShow is true OR menuText is set)
  const activeMenuGifts = gifts.filter(
    gift => gift.menuShow === true || (gift.menuText && gift.menuText.trim() !== '')
  );

  // Filter active gifts by search query & coin range for main panel list
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

  // Filter all gifts for the Add Gift Catalog Modal
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

  useEffect(() => {
    setLocalTitle(settings.menuTitle || 'MENU QUÀ TẶNG');
    setLocalX(settings.menuX !== undefined ? settings.menuX : 15);
    setLocalY(settings.menuY !== undefined ? settings.menuY : 20);
    setLocalScale(settings.menuScale !== undefined ? settings.menuScale : 1.0);
    setLocalColumns(settings.menuColumns !== undefined ? settings.menuColumns : 1);
    setLocalScrollThreshold(settings.menuScrollThreshold !== undefined ? settings.menuScrollThreshold : 5);
    setLocalFrameScale(settings.menuFrameScale !== undefined ? settings.menuFrameScale : 1.0);
  }, [settings]);

  useEffect(() => {
    setSearchQuery('');
    setCoinRange('all');
    setPickerSearchQuery('');
    setPickerCoinRange('all');
  }, [activeTab]);

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

  const handleSliderChange = (field: 'x' | 'y' | 'scale' | 'scrollThreshold' | 'frameScale', val: number) => {
    if (field === 'x') {
      setLocalX(val);
    } else if (field === 'y') {
      setLocalY(val);
    } else if (field === 'scale') {
      setLocalScale(val);
    } else if (field === 'scrollThreshold') {
      setLocalScrollThreshold(val);
    } else if (field === 'frameScale') {
      setLocalFrameScale(val);
    }
  };

  const handleSliderRelease = (field: 'x' | 'y' | 'scale' | 'scrollThreshold' | 'frameScale', val: number) => {
    if (field === 'x') {
      onSaveSettings({ menuX: val });
    } else if (field === 'y') {
      onSaveSettings({ menuY: val });
    } else if (field === 'scale') {
      onSaveSettings({ menuScale: val });
    } else if (field === 'scrollThreshold') {
      onSaveSettings({ menuScrollThreshold: val });
    } else if (field === 'frameScale') {
      onSaveSettings({ menuFrameScale: val });
    }
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
    if (activeTab === 'npc') {
      await onSaveNpcGiftText(giftId, text, show);
    } else {
      await onSaveGiftText(giftId, text, show);
    }
    setSavingGiftId(null);
  };

  const handleRemoveFromMenu = async (gift: Gift) => {
    await handleGiftTextChange(gift._id!, '', false);
  };

  const handleAddToMenu = async (gift: Gift) => {
    await handleGiftTextChange(gift._id!, gift.menuText || '', true);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full items-start animate-[fade-in-up_0.4s_ease-out]">
      {/* Column 1: Menu Configurations */}
      <div className="lg:col-span-4 bg-bg-card border border-border-color rounded-2xl p-5 md:p-6 backdrop-blur-[24px] flex flex-col gap-5 glass-shadow w-full animate-[fade-in-up_0.4s_ease-out]">
        <div className="flex flex-col gap-1 border-b border-border-color/30 pb-3">
          <h4 className="font-header text-[0.98rem] font-bold text-white uppercase tracking-[0.5px] flex items-center gap-2">
            <i className="fa-solid fa-gear text-secondary animate-pulse" />
            <span>{language === 'vi' ? 'Thiết lập Giao diện' : 'Appearance Settings'}</span>
          </h4>
          <p className="text-[0.7rem] text-text-muted">
            {language === 'vi' ? 'Tùy chỉnh tiêu đề, kích thước và vị trí bảng quà trên OBS.' : 'Customize title, scale, and layout position on OBS.'}
          </p>
        </div>

        {/* Enable Toggle */}
        <div className="flex justify-between items-center py-2 select-none">
          <div className="flex flex-col gap-0.5">
            <span className="text-[0.85rem] text-text-secondary font-bold">
              {language === 'vi' ? 'Hiển thị Bảng Quà:' : 'Show Gift Menu:'}
            </span>
            <span className="text-[0.68rem] text-text-muted">
              {language === 'vi' ? 'Bật/tắt hiển thị bảng trên stream' : 'Show/hide menu on overlay'}
            </span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer select-none">
            <input
              type="checkbox"
              checked={settings.menuEnabled || false}
              onChange={(e) => handleToggleMenu(e.target.checked)}
              className="peer sr-only"
            />
            <span className="w-10 h-[20px] bg-white/8 rounded-full relative transition-all duration-300 border border-border-color after:absolute after:w-[14px] after:h-[14px] after:rounded-full after:bg-white after:top-[2px] after:left-[2px] after:transition-all after:duration-300 after:ease-out peer-checked:bg-secondary peer-checked:border-transparent peer-checked:shadow-[0_0_8px_var(--color-secondary-glow)] peer-checked:after:translate-x-[20px]" />
          </label>
        </div>

        {/* Menu Title Input */}
        <div className="flex flex-col gap-2">
          <label className="text-[0.8rem] text-text-secondary font-bold select-none">
            {language === 'vi' ? 'Tiêu đề bảng quà:' : 'Menu Title:'}
          </label>
          <input
            type="text"
            value={localTitle}
            onChange={(e) => setLocalTitle(e.target.value)}
            onBlur={handleTitleBlur}
            placeholder={language === 'vi' ? 'MENU QUÀ TẶNG' : 'GIFT EVENT MENU'}
            className="w-full bg-bg-input border border-border-color rounded-md px-3.5 py-2 text-white font-body text-[0.88rem] outline-none transition-all duration-200 placeholder:text-white/20 focus:border-secondary focus:ring-3 focus:ring-secondary-glow/25"
          />
        </div>

        {/* Layout Orientation Toggle */}
        <div className="flex flex-col gap-2">
          <label className="text-[0.8rem] text-text-secondary font-bold select-none">
            {language === 'vi' ? 'Hướng hiển thị bảng quà:' : 'Menu Layout Orientation:'}
          </label>
          <div className="grid grid-cols-2 bg-black/20 border border-border-color rounded-xl p-1 gap-1">
            <button
              type="button"
              onClick={() => handleLayoutChange('vertical')}
              className={`py-1.5 rounded-lg text-[0.78rem] font-bold transition-all duration-150 cursor-pointer outline-none ${(settings.menuLayout || 'vertical') === 'vertical'
                ? 'bg-secondary text-black shadow-[0_2px_6px_var(--color-secondary-glow)]'
                : 'text-text-muted hover:text-white bg-transparent'
                }`}
            >
              {language === 'vi' ? 'Dọc' : 'Vertical'}
            </button>
            <button
              type="button"
              onClick={() => handleLayoutChange('horizontal')}
              className={`py-1.5 rounded-lg text-[0.78rem] font-bold transition-all duration-150 cursor-pointer outline-none ${(settings.menuLayout || 'vertical') === 'horizontal'
                ? 'bg-secondary text-black shadow-[0_2px_6px_var(--color-secondary-glow)]'
                : 'text-text-muted hover:text-white bg-transparent'
                }`}
            >
              {language === 'vi' ? 'Ngang' : 'Horizontal'}
            </button>
          </div>
        </div>

        {/* Columns Toggle (1 vs 2 Columns) */}
        {(settings.menuLayout || 'vertical') === 'vertical' && (
          <div className="flex flex-col gap-2">
            <label className="text-[0.8rem] text-text-secondary font-bold select-none">
              {language === 'vi' ? 'Số cột hiển thị:' : 'Display Columns:'}
            </label>
            <div className="grid grid-cols-2 bg-black/20 border border-border-color rounded-xl p-1 gap-1">
              <button
                type="button"
                onClick={() => handleColumnsChange(1)}
                className={`py-1.5 rounded-lg text-[0.78rem] font-bold transition-all duration-150 cursor-pointer outline-none ${localColumns === 1
                  ? 'bg-secondary text-black shadow-[0_2px_6px_var(--color-secondary-glow)]'
                  : 'text-text-muted hover:text-white bg-transparent'
                  }`}
              >
                1 Cột
              </button>
              <button
                type="button"
                onClick={() => handleColumnsChange(2)}
                className={`py-1.5 rounded-lg text-[0.78rem] font-bold transition-all duration-150 cursor-pointer outline-none ${localColumns === 2
                  ? 'bg-secondary text-black shadow-[0_2px_6px_var(--color-secondary-glow)]'
                  : 'text-text-muted hover:text-white bg-transparent'
                  }`}
              >
                2 Cột
              </button>
            </div>
          </div>
        )}

        {/* Frame Selection */}
        <div className="flex flex-col gap-2.5">
          <label className="text-[0.8rem] text-text-secondary font-bold select-none flex items-center justify-between">
            <span>{language === 'vi' ? 'Khung viền Icon Quà:' : 'Gift Icon Frame:'}</span>
            <span className="text-[0.7rem] text-secondary font-mono">
              {FRAME_OPTIONS.find(f => f.file === (settings.menuFrame || ''))?.[language === 'vi' ? 'nameVi' : 'nameEn'] || (language === 'vi' ? 'Mặc định' : 'Default')}
            </span>
          </label>
          <div className="grid grid-cols-4 gap-2 bg-black/20 border border-border-color rounded-xl p-2 max-h-[180px] overflow-y-auto custom-scrollbar">
            {FRAME_OPTIONS.map((frame) => {
              const isSelected = (settings.menuFrame || '') === frame.file;
              return (
                <button
                  key={frame.id}
                  type="button"
                  onClick={() => handleFrameSelect(frame.file)}
                  className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all duration-200 cursor-pointer outline-none ${
                    isSelected
                      ? 'bg-secondary/20 border-secondary shadow-[0_0_10px_var(--color-secondary-glow)] text-white scale-[1.03]'
                      : 'bg-white/[0.02] border-white/10 hover:border-white/30 text-text-muted hover:text-white'
                  }`}
                  title={language === 'vi' ? frame.nameVi : frame.nameEn}
                >
                  <div className="w-10 h-10 relative flex items-center justify-center">
                    <i className="fa-solid fa-gift text-[1.1rem] text-primary" />
                    {frame.file && (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={`/frame/${frame.file}`}
                        alt={frame.nameVi}
                        className="absolute inset-0 w-full h-full object-contain pointer-events-none transition-transform duration-150"
                        style={{
                          transform: `scale(${isSelected ? localFrameScale : 1.0})`,
                        }}
                      />
                    )}
                  </div>
                  <span className="text-[0.62rem] font-medium leading-tight truncate w-full text-center mt-1">
                    {language === 'vi' ? frame.nameVi : frame.nameEn}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Frame Scale Slider */}
          {settings.menuFrame && (
            <div className="flex flex-col gap-2 mt-1">
              <div className="flex justify-between items-center text-[0.8rem] text-text-secondary font-bold select-none">
                <span>{language === 'vi' ? 'Kích thước Khung (Scale):' : 'Frame Scale:'}</span>
                <span className="text-secondary font-mono font-bold">{localFrameScale.toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2.5"
                step="0.05"
                value={localFrameScale}
                onChange={(e) => handleSliderChange('frameScale', Number(e.target.value))}
                onMouseUp={(e) => handleSliderRelease('frameScale', Number((e.target as HTMLInputElement).value))}
                onTouchEnd={(e) => handleSliderRelease('frameScale', Number((e.target as HTMLInputElement).value))}
                className="w-full accent-secondary cursor-pointer h-1.5 bg-white/10 rounded-lg outline-none"
              />
            </div>
          )}
        </div>

        {/* Scroll Count / Threshold */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center text-[0.8rem] text-text-secondary font-bold select-none">
            <span>{language === 'vi' ? 'Số icon hiển thị trước khi cuộn:' : 'Max icons before scroll:'}</span>
            <span className="text-secondary font-mono font-bold">{localScrollThreshold} icon</span>
          </div>
          <input
            type="range"
            min="1"
            max="20"
            step="1"
            value={localScrollThreshold}
            onChange={(e) => handleSliderChange('scrollThreshold', Number(e.target.value))}
            onMouseUp={(e) => handleSliderRelease('scrollThreshold', Number((e.target as HTMLInputElement).value))}
            onTouchEnd={(e) => handleSliderRelease('scrollThreshold', Number((e.target as HTMLInputElement).value))}
            className="w-full accent-secondary cursor-pointer h-1.5 bg-white/10 rounded-lg outline-none"
          />
          <p className="text-[0.68rem] text-text-muted">
            {language === 'vi'
              ? 'Khi danh sách vượt quá số lượng này, bảng quà sẽ tự động cuộn (dọc hoặc ngang).'
              : 'When items exceed this count, the list will automatically scroll (vertically/horizontally).'}
          </p>
        </div>

        {/* Position X */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center text-[0.8rem] text-text-secondary font-bold select-none">
            <span>{language === 'vi' ? 'Tọa độ X (Ngang):' : 'Position X:'}</span>
            <span className="text-secondary font-mono">{localX}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={localX}
            onChange={(e) => handleSliderChange('x', Number(e.target.value))}
            onMouseUp={(e) => handleSliderRelease('x', Number((e.target as HTMLInputElement).value))}
            onTouchEnd={(e) => handleSliderRelease('x', Number((e.target as HTMLInputElement).value))}
            className="w-full accent-secondary cursor-pointer h-1.5 bg-white/10 rounded-lg outline-none"
          />
        </div>

        {/* Position Y */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center text-[0.8rem] text-text-secondary font-bold select-none">
            <span>{language === 'vi' ? 'Tọa độ Y (Dọc):' : 'Position Y:'}</span>
            <span className="text-secondary font-mono">{localY}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={localY}
            onChange={(e) => handleSliderChange('y', Number(e.target.value))}
            onMouseUp={(e) => handleSliderRelease('y', Number((e.target as HTMLInputElement).value))}
            onTouchEnd={(e) => handleSliderRelease('y', Number((e.target as HTMLInputElement).value))}
            className="w-full accent-secondary cursor-pointer h-1.5 bg-white/10 rounded-lg outline-none"
          />
        </div>

        {/* Scale */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center text-[0.8rem] text-text-secondary font-bold select-none">
            <span>{language === 'vi' ? 'Tỷ lệ Scale (Kích thước):' : 'Menu Scale:'}</span>
            <span className="text-secondary font-mono">{localScale.toFixed(2)}x</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="3.0"
            step="0.05"
            value={localScale}
            onChange={(e) => handleSliderChange('scale', Number(e.target.value))}
            onMouseUp={(e) => handleSliderRelease('scale', Number((e.target as HTMLInputElement).value))}
            onTouchEnd={(e) => handleSliderRelease('scale', Number((e.target as HTMLInputElement).value))}
            className="w-full accent-secondary cursor-pointer h-1.5 bg-white/10 rounded-lg outline-none"
          />
        </div>

        {/* Preview Info Box */}
        <div className="mt-2 p-3 bg-white/[0.02] border border-white/5 rounded-xl text-[0.7rem] text-text-muted select-none flex flex-col gap-1.5">
          <div className="font-semibold text-text-secondary flex items-center gap-1.5">
            <i className="fa-solid fa-circle-info text-secondary" />
            <span>OBS Overlay Tips</span>
          </div>
          <p>
            {language === 'vi'
              ? 'Bảng quà được hiển thị động và lưu tự động. Mọi thay đổi của bạn sẽ cập nhật ngay lập tức trên nguồn Browser Source trong OBS mà không cần reload!'
              : 'The menu updates in real-time. Changes are pushed directly to OBS without reload!'}
          </p>
        </div>
      </div>

      {/* Column 2: Selected Gifts in Menu & Add Gift Action */}
      <div className="lg:col-span-8 bg-bg-card border border-border-color rounded-2xl p-5 md:p-6 backdrop-blur-[24px] flex flex-col gap-5 glass-shadow w-full">
        {/* Top Header & Add Gift Button */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border-color/30 pb-3">
          <div className="flex flex-col gap-1">
            <h4 className="font-header text-[0.98rem] font-bold text-white uppercase tracking-[0.5px] flex items-center gap-2">
              <i className="fa-solid fa-list-check text-secondary animate-pulse" />
              <span>{language === 'vi' ? 'Danh sách Quà trong Menu' : 'Selected Gifts in Menu'}</span>
              <span className="text-[0.75rem] font-mono text-secondary bg-secondary/15 px-2 py-0.5 rounded-full border border-secondary/30 ml-1">
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
            className="shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary to-[#d0003c] text-white font-bold text-[0.82rem] shadow-[0_4px_16px_var(--color-primary-glow)] hover:scale-[1.02] hover:shadow-[0_6px_20px_var(--color-primary-glow)] active:scale-[0.98] transition-all duration-200 cursor-pointer outline-none"
          >
            <i className="fa-solid fa-plus text-[0.9rem]" />
            <span>{language === 'vi' ? 'Thêm quà vào Menu' : '+ Add Gift to Menu'}</span>
          </button>
        </div>

        {/* Search & Coin Range Filter Bar for Active Menu Gifts */}
        {activeMenuGifts.length > 0 && (
          <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-3 w-full bg-black/20 p-3 rounded-2xl border border-border-color/40 backdrop-blur-md relative z-30">
            {/* Text Search Input */}
            <div className="relative w-full xl:max-w-xs shrink-0">
              <input
                type="text"
                placeholder={language === 'vi' ? 'Tìm theo tên hoặc số xu...' : 'Search active gifts...'}
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
            <div className="flex flex-col items-center justify-center py-14 px-4 bg-black/15 border border-dashed border-white/10 rounded-2xl text-center select-none gap-3">
              <div className="w-14 h-14 rounded-full bg-secondary/10 border border-secondary/20 flex items-center justify-center text-secondary text-2xl shadow-[0_0_15px_var(--color-secondary-glow)]">
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
                className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary/20 border border-secondary/40 text-secondary hover:bg-secondary hover:text-black font-bold text-[0.8rem] transition-all duration-200 cursor-pointer outline-none"
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
                  className={`flex flex-col sm:flex-row items-start sm:items-center gap-3.5 p-3 rounded-xl border transition-all duration-200 ${
                    isEnabled
                      ? 'bg-white/[0.02] border-white/10 hover:border-secondary/30'
                      : 'bg-black/20 border-white/5 opacity-60 hover:opacity-80'
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
                      <span className="w-8.5 h-[17px] bg-white/8 rounded-full relative transition-all duration-300 border border-border-color after:absolute after:w-[11px] after:h-[11px] after:rounded-full after:bg-white after:top-[2px] after:left-[2px] after:transition-all after:duration-300 after:ease-out peer-checked:bg-secondary peer-checked:border-transparent peer-checked:after:translate-x-[16px]" />
                    </label>

                    {/* Icon */}
                    <div className="w-10 h-10 shrink-0 bg-black/35 rounded-lg flex items-center justify-center border border-white/5 relative">
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
                        <span className="text-secondary">⚡</span>
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
                      className="w-full bg-bg-input border border-border-color rounded-lg pl-3.5 pr-10 py-2.5 text-white font-body text-[0.85rem] outline-none transition-all duration-200 placeholder:text-white/20 focus:border-secondary focus:ring-3 focus:ring-secondary-glow/25 disabled:opacity-40 disabled:cursor-not-allowed"
                    />
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center justify-center">
                      {isSaving ? (
                        <i className="fa-solid fa-spinner animate-spin text-[0.8rem] text-secondary" />
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

      {/* Add Gift Catalog Modal */}
      {isPickerOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-[fade-in_0.2s_ease-out]">
          <div className="bg-bg-surface border border-border-color rounded-2xl w-full max-w-4xl max-h-[88vh] flex flex-col glass-shadow shadow-2xl overflow-hidden animate-[scale-up_0.25s_ease-out]">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-border-color/30 flex items-center justify-between bg-black/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary text-lg">
                  <i className="fa-solid fa-gift" />
                </div>
                <div className="flex flex-col">
                  <h4 className="font-header text-[1rem] font-bold text-white uppercase tracking-[0.5px]">
                    {language === 'vi' ? 'Kho Quà Tặng (511 món quà)' : 'Gift Catalog (511 items)'}
                  </h4>
                  <p className="text-[0.72rem] text-text-muted">
                    {language === 'vi' ? 'Bấm "+ Thêm" món quà bạn muốn hiển thị trên Bảng Quà stream.' : 'Click "+ Add" gifts to include them in your stream menu.'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsPickerOpen(false)}
                className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-text-muted hover:text-white hover:bg-white/10 transition-all duration-150 cursor-pointer outline-none"
              >
                <i className="fa-solid fa-xmark text-[1rem]" />
              </button>
            </div>

            {/* Modal Filter Bar */}
            <div className="p-4 bg-black/20 border-b border-border-color/30 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 relative z-30">
              {/* Text Search Input */}
              <div className="relative w-full sm:max-w-md shrink-0">
                <input
                  type="text"
                  placeholder={language === 'vi' ? 'Tìm theo tên, ID hoặc số xu...' : 'Search gift name, ID or coins...'}
                  value={pickerSearchQuery}
                  onChange={(e) => setPickerSearchQuery(e.target.value)}
                  className="w-full bg-bg-input border border-border-color rounded-xl pl-9 pr-8 py-2 text-white font-body text-[0.84rem] outline-none transition-all duration-200 placeholder:text-white/25 focus:border-secondary focus:ring-3 focus:ring-secondary-glow/25"
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
            <div className="p-4 overflow-y-auto custom-scrollbar flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 font-body bg-black/10">
              {catalogGifts.length === 0 ? (
                <div className="col-span-full text-center py-16 text-[0.85rem] text-text-muted select-none">
                  {language === 'vi' ? 'Không tìm thấy quà tặng phù hợp trong kho.' : 'No matching gifts found in catalog.'}
                </div>
              ) : (
                catalogGifts.map((gift) => {
                  const isAdded = gift.menuShow === true || (gift.menuText && gift.menuText.trim() !== '');
                  const isSaving = savingGiftId === gift._id;

                  return (
                    <div
                      key={gift._id}
                      className={`flex items-center justify-between gap-3 p-3 rounded-xl border transition-all duration-200 ${
                        isAdded
                          ? 'bg-secondary/10 border-secondary/40 shadow-[0_0_10px_var(--color-secondary-glow)]'
                          : 'bg-white/[0.02] border-white/8 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 shrink-0 bg-black/40 rounded-lg flex items-center justify-center border border-white/5">
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
                          <span className="text-[0.68rem] text-secondary font-mono mt-0.5 flex items-center gap-0.5">
                            ⚡ {gift.coins} xu
                          </span>
                        </div>
                      </div>

                      {isAdded ? (
                        <button
                          type="button"
                          onClick={() => handleRemoveFromMenu(gift)}
                          disabled={isSaving}
                          className="shrink-0 px-2.5 py-1.5 rounded-lg bg-secondary/20 border border-secondary/40 text-secondary hover:bg-primary/20 hover:border-primary/40 hover:text-primary font-bold text-[0.75rem] transition-all duration-150 cursor-pointer outline-none flex items-center gap-1.5"
                        >
                          {isSaving ? (
                            <i className="fa-solid fa-spinner animate-spin" />
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
                          className="shrink-0 px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/15 text-white hover:bg-secondary hover:border-transparent hover:text-black font-bold text-[0.75rem] transition-all duration-150 cursor-pointer outline-none flex items-center gap-1.5"
                        >
                          {isSaving ? (
                            <i className="fa-solid fa-spinner animate-spin text-secondary" />
                          ) : (
                            <>
                              <i className="fa-solid fa-plus" />
                              <span>{language === 'vi' ? 'Thêm' : 'Add'}</span>
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
            <div className="p-4 border-t border-border-color/30 flex items-center justify-between bg-black/30">
              <span className="text-[0.75rem] text-text-muted">
                {language === 'vi'
                  ? `Đã chọn ${activeMenuGifts.length} quà trong Menu`
                  : `${activeMenuGifts.length} gifts selected in menu`}
              </span>
              <button
                type="button"
                onClick={() => setIsPickerOpen(false)}
                className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white font-bold text-[0.82rem] transition-all duration-150 cursor-pointer outline-none"
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
