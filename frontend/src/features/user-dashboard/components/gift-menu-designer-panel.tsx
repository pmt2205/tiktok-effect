'use client';

import React, { useState, useEffect } from 'react';
import Select from '@/components/ui/select';
import { Gift } from '@/types';

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
  const [savingGiftId, setSavingGiftId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const gifts = activeTab === 'npc' ? npcGifts : customGifts;

  const filteredGifts = gifts.filter(gift => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return gift.name.toLowerCase().includes(q) || gift.coins.toString().includes(q);
  });

  useEffect(() => {
    setLocalTitle(settings.menuTitle || 'MENU QUÀ TẶNG');
    setLocalX(settings.menuX !== undefined ? settings.menuX : 15);
    setLocalY(settings.menuY !== undefined ? settings.menuY : 20);
    setLocalScale(settings.menuScale !== undefined ? settings.menuScale : 1.0);
    setLocalColumns(settings.menuColumns !== undefined ? settings.menuColumns : 1);
  }, [settings]);

  useEffect(() => {
    setSearchQuery('');
  }, [activeTab]);

  const handleToggleMenu = (enabled: boolean) => {
    onSaveSettings({ menuEnabled: enabled });
  };

  const handleTitleBlur = () => {
    if (localTitle !== settings.menuTitle) {
      onSaveSettings({ menuTitle: localTitle });
    }
  };

  const handleSliderChange = (field: 'x' | 'y' | 'scale', val: number) => {
    if (field === 'x') {
      setLocalX(val);
    } else if (field === 'y') {
      setLocalY(val);
    } else if (field === 'scale') {
      setLocalScale(val);
    }
  };

  const handleSliderRelease = (field: 'x' | 'y' | 'scale', val: number) => {
    if (field === 'x') {
      onSaveSettings({ menuX: val });
    } else if (field === 'y') {
      onSaveSettings({ menuY: val });
    } else if (field === 'scale') {
      onSaveSettings({ menuScale: val });
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

      {/* Column 2: Gifts List & Action Input */}
      <div className="lg:col-span-8 bg-bg-card border border-border-color rounded-2xl p-5 md:p-6 backdrop-blur-[24px] flex flex-col gap-5 glass-shadow w-full">
        <div className="flex flex-col gap-1 border-b border-border-color/30 pb-3">
          <h4 className="font-header text-[0.98rem] font-bold text-white uppercase tracking-[0.5px] flex items-center gap-2">
            <i className="fa-solid fa-gift text-primary animate-pulse" />
            <span>{language === 'vi' ? 'Nội dung hành động tương ứng' : 'Gift Action Content'}</span>
          </h4>
          <p className="text-[0.7rem] text-text-muted">
            {language === 'vi' ? 'Bật hiển thị món quà và nhập mô tả yêu cầu hành động tương ứng bên cạnh.' : 'Select which gifts to show and write the corresponding stream challenge/action.'}
          </p>
        </div>

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

        {/* Gifts Table/Grid */}
        <div className="flex flex-col gap-3.5 max-h-[520px] overflow-y-auto custom-scrollbar pr-1 font-body">
          {filteredGifts.length === 0 ? (
            <div className="text-center py-12 text-[0.85rem] text-text-muted select-none">
              {language === 'vi' ? 'Không tìm thấy quà tặng phù hợp.' : 'No matching gifts found.'}
            </div>
          ) : (
            filteredGifts.map((gift) => {
              const isSelected = gift.menuShow !== false;
              const isSaving = savingGiftId === gift._id;

              return (
                <div
                  key={gift._id}
                  className={`flex flex-col sm:flex-row items-start sm:items-center gap-3.5 p-3 rounded-xl border transition-all duration-200 ${isSelected
                    ? 'bg-white/[0.02] border-white/8 hover:border-secondary/20'
                    : 'bg-black/10 border-white/5 opacity-55 hover:opacity-75'
                    }`}
                >
                  {/* Left row: Checkbox + Icon + Coins */}
                  <div className="flex items-center gap-3.5 shrink-0 select-none">
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => handleGiftTextChange(gift._id!, gift.menuText || '', e.target.checked)}
                        className="peer sr-only"
                      />
                      <span className="w-8.5 h-[17px] bg-white/8 rounded-full relative transition-all duration-300 border border-border-color after:absolute after:w-[11px] after:h-[11px] after:rounded-full after:bg-white after:top-[2px] after:left-[2px] after:transition-all after:duration-300 after:ease-out peer-checked:bg-secondary peer-checked:border-transparent peer-checked:after:translate-x-[16px]" />
                    </label>

                    <div className="w-10 h-10 shrink-0 bg-black/35 rounded-lg flex items-center justify-center border border-white/5 relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={gift.icon} alt={gift.name} className="w-7 h-7 object-contain" />
                    </div>

                    <div className="flex flex-col justify-center min-w-[100px]">
                      <span className="text-[0.82rem] font-bold text-white leading-tight truncate max-w-[120px]">{gift.name}</span>
                      <span className="text-[0.65rem] text-text-secondary mt-0.5 flex items-center gap-0.5">
                        <span className="text-secondary">⚡</span>
                        {gift.coins} coins
                      </span>
                    </div>
                  </div>

                  {/* Right row: Input Text Description */}
                  <div className="flex-1 w-full relative flex items-center">
                    <input
                      type="text"
                      defaultValue={gift.menuText || ''}
                      placeholder={language === 'vi' ? 'Ví dụ: Hát 1 bài, Múa quạt, Chạy bo...' : 'Example: Sing a song, Dance, Scream...'}
                      onBlur={(e) => handleGiftTextChange(gift._id!, e.target.value, isSelected)}
                      disabled={!isSelected}
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
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
