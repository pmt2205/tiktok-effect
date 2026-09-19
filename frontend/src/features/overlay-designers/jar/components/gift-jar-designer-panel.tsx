'use client';
/* eslint-disable @next/next/no-img-element -- Local transparent jar decorations must preserve their exact intrinsic artwork. */

import React, { useState } from 'react';
import { OverlaySettings } from '@/types';
import LiveOverlayViewport from '@/features/user-dashboard/components/live-overlay-viewport';
import OverlayPreviewControls from '@/features/overlay-designers/components/overlay-preview-controls';
import { JAR_DECORATION_OPTIONS, JAR_EFFECT_OPTIONS, JAR_NAME_OPTIONS } from '../lib/jar-options';

interface GiftJarDesignerPanelProps {
  language: 'vi' | 'en';
  settings: OverlaySettings;
  savingSettings: boolean;
  onSaveSettings: (updates: Partial<OverlaySettings>) => Promise<void>;
  onSimulateEvent?: (eventType: string, payload: unknown) => void;
  fullOptions?: boolean;
  canSelectStyles?: boolean;
}

function parseColorToHexAndAlpha(colorStr: string = '#ffffff'): { hex: string; alpha: number } {
  if (!colorStr) return { hex: '#ffffff', alpha: 1 };
  
  const rgbaMatch = colorStr.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([\d.]+))?\s*\)/i);
  if (rgbaMatch) {
    const r = parseInt(rgbaMatch[1]).toString(16).padStart(2, '0');
    const g = parseInt(rgbaMatch[2]).toString(16).padStart(2, '0');
    const b = parseInt(rgbaMatch[3]).toString(16).padStart(2, '0');
    const a = rgbaMatch[4] !== undefined ? parseFloat(rgbaMatch[4]) : 1;
    return { hex: `#${r}${g}${b}`, alpha: isNaN(a) ? 1 : a };
  }

  if (colorStr.startsWith('#') && colorStr.length === 9) {
    const hex = colorStr.slice(0, 7);
    const aHex = colorStr.slice(7, 9);
    const alpha = parseInt(aHex, 16) / 255;
    return { hex, alpha: isNaN(alpha) ? 1 : Math.round(alpha * 100) / 100 };
  }

  if (colorStr.startsWith('#') && colorStr.length === 7) {
    return { hex: colorStr, alpha: 1 };
  }

  return { hex: '#ffffff', alpha: 1 };
}

function hexAndAlphaToRgba(hex: string, alpha: number): string {
  const cleanHex = hex.replace('#', '');
  if (cleanHex.length !== 6) return hex;
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  if (alpha >= 1) return `#${cleanHex}`;
  return `rgba(${r}, ${g}, ${b}, ${alpha.toFixed(2)})`;
}

export default function GiftJarDesignerPanel({
  language,
  settings,
  savingSettings,
  onSaveSettings,
  onSimulateEvent,
  fullOptions = false,
}: GiftJarDesignerPanelProps) {
  const [localX, setLocalX] = useState(settings.jarX !== undefined ? settings.jarX : 75);
  const [localY, setLocalY] = useState(settings.jarY !== undefined ? settings.jarY : 50);
  const [localScale, setLocalScale] = useState(settings.jarScale !== undefined ? settings.jarScale : 1.0);
  const [localGiftSize, setLocalGiftSize] = useState(settings.jarGiftSize !== undefined ? settings.jarGiftSize : 1.0);
  const [localFallSpeed, setLocalFallSpeed] = useState(settings.jarFallSpeed !== undefined ? settings.jarFallSpeed : 1.0);
  const [localDanceScale, setLocalDanceScale] = useState(settings.jarDanceScale !== undefined ? settings.jarDanceScale : 1.0);
  const [localDanceOffsetX, setLocalDanceOffsetX] = useState(settings.jarDanceOffsetX !== undefined ? settings.jarDanceOffsetX : 185);
  const [localNameScale, setLocalNameScale] = useState(settings.jarNameScale !== undefined ? settings.jarNameScale : 0.55);
  const [localNameX, setLocalNameX] = useState(settings.jarNameX !== undefined ? settings.jarNameX : 0);
  const [localNameY, setLocalNameY] = useState(settings.jarNameY !== undefined ? settings.jarNameY : -54);
  const [localEffectScale, setLocalEffectScale] = useState(settings.jarEffectScale !== undefined ? settings.jarEffectScale : 1.0);
  const [localEffectX, setLocalEffectX] = useState(settings.jarEffectX ?? 0);
  const [localEffectY, setLocalEffectY] = useState(settings.jarEffectY ?? 0);
  const [localEffectDelay, setLocalEffectDelay] = useState(settings.jarEffectDelay ?? 0);

  const currentJarColor = settings.jarColor || '#ffffff';
  const { hex: parsedHex, alpha: parsedAlpha } = parseColorToHexAndAlpha(currentJarColor);
  const [localColorInput, setLocalColorInput] = useState(currentJarColor);
  const [localAlpha, setLocalAlpha] = useState(parsedAlpha);

  const handleHexChange = (newHex: string) => {
    const newColor = hexAndAlphaToRgba(newHex, localAlpha);
    setLocalColorInput(newColor);
    onSaveSettings({ jarColor: newColor });
  };

  const handleAlphaChange = (newAlpha: number) => {
    setLocalAlpha(newAlpha);
    const newColor = hexAndAlphaToRgba(parsedHex, newAlpha);
    setLocalColorInput(newColor);
  };

  const handleAlphaRelease = (newAlpha: number) => {
    const newColor = hexAndAlphaToRgba(parsedHex, newAlpha);
    onSaveSettings({ jarColor: newColor });
  };

  const handleDirectColorInput = (inputVal: string) => {
    setLocalColorInput(inputVal);
    const { alpha } = parseColorToHexAndAlpha(inputVal);
    setLocalAlpha(alpha);
    onSaveSettings({ jarColor: inputVal });
  };

  const handleToggleJar = (enabled: boolean) => {
    onSaveSettings({ jarEnabled: enabled });
  };

  const handleSliderChange = (field: 'giftSize' | 'fallSpeed', val: number) => {
    if (field === 'giftSize') {
      setLocalGiftSize(val);
    } else if (field === 'fallSpeed') {
      setLocalFallSpeed(val);
    }
  };

  const handleSliderRelease = (field: 'giftSize' | 'fallSpeed', val: number) => {
    if (field === 'giftSize') {
      onSaveSettings({ jarGiftSize: val });
    } else if (field === 'fallSpeed') {
      onSaveSettings({ jarFallSpeed: val });
    }
  };

  const handleClearJar = () => {
    onSaveSettings({ jarClearedAt: Date.now() });
  };

  const handleSimulateDrop = (count: number) => {
    if (!onSimulateEvent) return;
    onSimulateEvent('gift', {
      nickname: 'Simulated Fan',
      uniqueId: 'simulated_fan',
      giftName: 'Rose',
      repeatCount: count,
      diamondCount: count,
      giftPictureUrl: 'https://sf16-website-nos.sofproxy.com/obj/tiktok-web-tx/tiktok/web/gift/rose.png',
      profilePictureUrl: 'https://i.pravatar.cc/100',
    });
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(360px,480px)_minmax(0,1fr)] w-full items-start animate-[fade-in-up_0.4s_ease-out]">
      {/* Left Column: Settings Form */}
      <div className="order-2 min-w-0 bg-bg-card border border-border-color rounded-2xl p-5 md:p-6 backdrop-blur-[24px] flex flex-col gap-5 glass-shadow w-full">
        <div className="flex flex-col gap-1 border-b border-border-color/30 pb-3">
          <h4 className="font-header text-[0.98rem] font-bold text-white uppercase tracking-[0.5px] flex items-center gap-2">
            <i className="fa-solid fa-jar text-primary animate-pulse" />
            <span>{language === 'vi' ? 'Thiết lập Hũ Quà' : 'Gift Jar Settings'}</span>
          </h4>
          <p className="text-[0.7rem] text-text-muted">
            {language === 'vi' ? 'Tùy chỉnh hũ quà rơi tích lũy của người xem trên OBS.' : 'Customize your interactive viewer gift jar on OBS.'}
          </p>
        </div>
        <div className="flex justify-between items-center py-2 select-none">
          <div className="flex flex-col gap-0.5">
            <span className="text-[0.85rem] text-text-secondary font-bold">
              {language === 'vi' ? 'Hiển thị Hũ Quà:' : 'Show Gift Jar:'}
            </span>
            <span className="text-[0.68rem] text-text-muted">
              {language === 'vi' ? 'Bật/tắt hũ quà trên màn hình livestream' : 'Enable/disable hũ quà on overlay'}
            </span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer select-none">
            <input 
              type="checkbox" 
              checked={settings.jarEnabled || false} 
              onChange={(e) => handleToggleJar(e.target.checked)} 
              className="peer sr-only"
              disabled={savingSettings}
            />
            <span className="w-10 h-[20px] bg-white/10 rounded-full relative transition-all duration-300 border border-border-color after:absolute after:w-[14px] after:h-[14px] after:rounded-full after:bg-white after:top-[2px] after:left-[2px] after:transition-all after:duration-300 after:ease-out peer-checked:bg-primary peer-checked:border-transparent peer-checked:shadow-[0_0_8px_var(--color-primary-glow)] peer-checked:after:translate-x-[20px] peer-disabled:opacity-40" />
          </label>
        </div>

        {/* Sub-settings visible only when Jar is Enabled */}
        {settings.jarEnabled && (
          <div className="flex flex-col gap-5 animate-[fade-in-up_0.25s_ease-out]">
            {/* Gift Size Slider */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center text-[0.8rem] text-text-secondary font-bold select-none">
                <span>{language === 'vi' ? 'Kích thước quà:' : 'Gift Icon Size:'}</span>
                <span className="text-primary font-mono font-bold">{localGiftSize.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.1"
                value={localGiftSize}
                onChange={(e) => handleSliderChange('giftSize', Number(e.target.value))}
                onMouseUp={(e) => handleSliderRelease('giftSize', Number((e.target as HTMLInputElement).value))}
                onTouchEnd={(e) => handleSliderRelease('giftSize', Number((e.target as HTMLInputElement).value))}
                disabled={savingSettings}
                className="w-full accent-primary cursor-pointer h-1.5 bg-white/10 rounded-lg outline-none disabled:opacity-40 disabled:cursor-not-allowed"
              />
            </div>

            {/* Fall Speed Slider */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center text-[0.8rem] text-text-secondary font-bold select-none">
                <span>{language === 'vi' ? 'Tốc độ rơi:' : 'Fall Speed:'}</span>
                <span className="text-primary font-mono font-bold">{localFallSpeed.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="3.0"
                step="0.1"
                value={localFallSpeed}
                onChange={(e) => handleSliderChange('fallSpeed', Number(e.target.value))}
                onMouseUp={(e) => handleSliderRelease('fallSpeed', Number((e.target as HTMLInputElement).value))}
                onTouchEnd={(e) => handleSliderRelease('fallSpeed', Number((e.target as HTMLInputElement).value))}
                disabled={savingSettings}
                className="w-full accent-primary cursor-pointer h-1.5 bg-white/10 rounded-lg outline-none disabled:opacity-40 disabled:cursor-not-allowed"
              />
            </div>

            {/* Colors Selection & Opacity (RGBA) */}
              <div className="flex flex-col gap-3 pt-2 border-t border-border-color/20 animate-[fade-in-up_0.2s_ease-out]">
                <div className="flex justify-between items-center text-[0.82rem] text-text-secondary font-bold select-none">
                  <span>{language === 'vi' ? 'Màu sắc & Độ trong suốt (RGBA):' : 'Jar Color & Transparency (RGBA):'}</span>
                  <span className="text-primary font-mono text-[0.76rem] font-bold">{localColorInput}</span>
                </div>

                <div className="flex items-center gap-3">
                  {/* Color Picker square */}
                  <div className="relative w-11 h-10 border border-border-color rounded-xl overflow-hidden cursor-pointer bg-bg-surface flex items-center justify-center transition-all duration-200 focus-within:border-primary shrink-0">
                    <input
                      type="color"
                      value={parsedHex}
                      onChange={(e) => handleHexChange(e.target.value)}
                      disabled={savingSettings}
                      className="absolute inset-0 w-[200%] h-[200%] -translate-x-[25%] -translate-y-[25%] cursor-pointer border-none p-0 bg-transparent outline-none disabled:opacity-40 disabled:cursor-not-allowed"
                    />
                  </div>

                  {/* Direct text input for HEX / RGBA */}
                  <input
                    type="text"
                    value={localColorInput}
                    onChange={(e) => handleDirectColorInput(e.target.value)}
                    placeholder="rgba(255, 0, 80, 0.8) or #ff0050"
                    disabled={savingSettings || !fullOptions}
                    className="px-3 py-2 bg-bg-input border border-border-color rounded-xl text-[0.75rem] font-mono text-white placeholder:text-text-muted/50 focus:border-primary focus:ring-3 focus:ring-primary-glow/25 outline-none transition-all duration-200 grow disabled:opacity-40"
                  />
                </div>

                {/* Opacity / Alpha Slider */}
                <div className="flex flex-col gap-1.5 pt-1">
                  <div className="flex justify-between items-center text-[0.78rem] text-text-muted select-none">
                    <span>{language === 'vi' ? 'Độ đậm màu (Opacity):' : 'Color Opacity:'}</span>
                    <span className="text-primary font-mono text-[0.74rem] font-bold">{Math.round(localAlpha * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={Math.round(localAlpha * 100)}
                    onChange={(e) => handleAlphaChange(Number(e.target.value) / 100)}
                    onMouseUp={(e) => handleAlphaRelease(Number((e.target as HTMLInputElement).value) / 100)}
                    onTouchEnd={(e) => handleAlphaRelease(Number((e.target as HTMLInputElement).value) / 100)}
                    disabled={savingSettings || !fullOptions}
                    className="w-full accent-primary cursor-pointer h-1.5 bg-white/10 rounded-lg outline-none disabled:opacity-40 disabled:cursor-not-allowed"
                  />
                </div>

              </div>

            {/* Pro Max ornament layer for the standard jar. */}
            <div className="flex flex-col gap-3 pt-3 border-t border-border-color/20">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <span className="flex items-center gap-2 text-[0.82rem] text-text-secondary font-bold select-none">
                    {language === 'vi' ? 'Viền trang trí' : 'Jar decoration'}
                    <span className="rounded-sm bg-primary/15 px-1.5 py-0.5 text-[0.58rem] font-extrabold text-primary">PRO MAX</span>
                  </span>
                  <p className="mt-1 text-[0.68rem] text-text-muted">
                    {language === 'vi' ? 'Gắn viền trang trí độc lập lên hũ thường.' : 'Attach an independent ornament layer to the standard jar.'}
                  </p>
                </div>
                <label className="relative inline-flex shrink-0 cursor-pointer items-center">
                  <input
                    type="checkbox"
                    className="peer sr-only"
                    disabled={savingSettings || !fullOptions}
                    checked={fullOptions && Boolean(settings.jarDecorationEnabled)}
                    onChange={(event) => onSaveSettings({
                      jarType: 'standard',
                      jarDecorationEnabled: event.target.checked,
                      jarDecoration: settings.jarDecoration || JAR_DECORATION_OPTIONS[0].id,
                      ...(event.target.checked && !settings.jarDecoration ? { jarColor: 'rgba(244, 155, 187, 0.85)' } : {}),
                    })}
                  />
                  <span className="relative h-[20px] w-10 rounded-full border border-border-color bg-white/10 transition-all duration-300 after:absolute after:left-[2px] after:top-[2px] after:h-[14px] after:w-[14px] after:rounded-full after:bg-white after:transition-all peer-checked:border-transparent peer-checked:bg-primary peer-checked:shadow-[0_0_8px_var(--color-primary-glow)] peer-checked:after:translate-x-[20px] peer-disabled:cursor-not-allowed peer-disabled:opacity-40" />
                </label>
              </div>

              {fullOptions && settings.jarDecorationEnabled && (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {JAR_DECORATION_OPTIONS.map((option) => {
                    const isSelected = (settings.jarDecoration || JAR_DECORATION_OPTIONS[0].id) === option.id;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => onSaveSettings({
                          jarType: 'standard',
                          jarDecoration: option.id,
                          ...(option.id === 'pro_1' ? { jarColor: 'rgba(244, 155, 187, 0.85)' } : {}),
                        })}
                        disabled={savingSettings}
                        className={`flex flex-col items-center rounded-xl border p-1.5 transition-all duration-200 outline-none disabled:cursor-not-allowed disabled:opacity-40 ${isSelected ? 'border-primary bg-primary/15 text-white shadow-[0_0_12px_var(--color-primary-glow)]' : 'border-border-color bg-bg-surface text-text-muted hover:bg-bg-input hover:text-white'}`}
                      >
                        <img src={option.preview} alt={language === 'vi' ? option.nameVi : option.nameEn} className="h-14 w-full object-contain pointer-events-none drop-shadow" />
                        <span className="mt-1 w-full truncate text-center text-[0.65rem] font-bold">{language === 'vi' ? option.nameVi : option.nameEn}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Pro Max chroma-key effect surrounding the jar */}
            <div className="flex flex-col gap-3 border-t border-border-color/20 pt-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <span className="flex items-center gap-2 text-[0.85rem] font-bold text-text-secondary">
                    <i className="fa-solid fa-wand-magic-sparkles text-primary" />
                    {language === 'vi' ? 'Hiệu ứng quanh hũ' : 'Jar surround effect'}
                    <span className="rounded-sm bg-primary/15 px-1.5 py-0.5 text-[0.58rem] font-extrabold text-primary">PRO MAX</span>
                  </span>
                  <p className="mt-1 text-[0.68rem] text-text-muted">
                    {language === 'vi' ? 'Video hiệu ứng được tự động xóa phông xanh và bám theo hũ.' : 'The video is chroma-keyed and follows the jar.'}
                  </p>
                </div>
                <label className="relative inline-flex shrink-0 cursor-pointer items-center">
                  <input
                    type="checkbox"
                    className="peer sr-only"
                    disabled={savingSettings || !fullOptions}
                    checked={fullOptions && Boolean(settings.jarEffectEnabled)}
                    onChange={(event) => onSaveSettings({
                      jarEffectEnabled: event.target.checked,
                      jarEffectVideo: settings.jarEffectVideo || JAR_EFFECT_OPTIONS[0].src,
                    })}
                  />
                  <span className="relative h-[20px] w-10 rounded-full border border-border-color bg-white/10 transition-all duration-300 after:absolute after:left-[2px] after:top-[2px] after:h-[14px] after:w-[14px] after:rounded-full after:bg-white after:transition-all peer-checked:border-transparent peer-checked:bg-primary peer-checked:shadow-[0_0_8px_var(--color-primary-glow)] peer-checked:after:translate-x-[20px] peer-disabled:cursor-not-allowed peer-disabled:opacity-40" />
                </label>
              </div>

              {fullOptions && settings.jarEffectEnabled && (
                <div className="flex flex-col gap-3 rounded-xl border border-border-color bg-bg-input p-3">
                  <div className="grid grid-cols-2 gap-2">
                    {JAR_EFFECT_OPTIONS.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        disabled={savingSettings}
                        onClick={() => onSaveSettings({ jarEffectVideo: option.src })}
                        className={`rounded-xl border px-3 py-2 text-[0.72rem] font-bold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-40 ${
                          (settings.jarEffectVideo || JAR_EFFECT_OPTIONS[0].src) === option.src
                            ? 'border-primary bg-primary/15 text-primary shadow-[0_0_10px_var(--color-primary-glow)]'
                            : 'border-border-color bg-bg-surface text-text-secondary hover:border-primary/40 hover:text-white'
                        }`}
                      >
                        <i className="fa-solid fa-film mr-2" />
                        {language === 'vi' ? option.labelVi : option.labelEn}
                      </button>
                    ))}
                  </div>
                  <label className="flex flex-col gap-1.5">
                    <span className="flex justify-between text-[0.76rem] font-bold text-text-secondary">
                      <span>{language === 'vi' ? 'Kích thước hiệu ứng' : 'Effect scale'}</span>
                      <span className="font-mono font-bold text-primary">{localEffectScale.toFixed(2)}x</span>
                    </span>
                    <input
                      type="range"
                      min="0.1"
                      max="2"
                      step="0.05"
                      value={localEffectScale}
                      disabled={savingSettings}
                      onChange={(event) => setLocalEffectScale(Number(event.target.value))}
                      onMouseUp={(event) => onSaveSettings({ jarEffectScale: Number((event.target as HTMLInputElement).value) })}
                      onTouchEnd={(event) => onSaveSettings({ jarEffectScale: Number((event.target as HTMLInputElement).value) })}
                      className="h-1.5 w-full cursor-pointer accent-primary disabled:cursor-not-allowed disabled:opacity-40"
                    />
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="flex flex-col gap-1.5">
                      <span className="flex justify-between text-[0.76rem] font-bold text-text-secondary">
                        <span>{language === 'vi' ? 'Căn ngang' : 'Horizontal'}</span>
                        <span className="font-mono text-primary">{localEffectX}px</span>
                      </span>
                      <input
                        type="range"
                        min="-300"
                        max="300"
                        step="2"
                        value={localEffectX}
                        disabled={savingSettings}
                        onChange={(event) => setLocalEffectX(Number(event.target.value))}
                        onMouseUp={(event) => onSaveSettings({ jarEffectX: Number((event.target as HTMLInputElement).value) })}
                        onTouchEnd={(event) => onSaveSettings({ jarEffectX: Number((event.target as HTMLInputElement).value) })}
                        className="h-1.5 w-full cursor-pointer accent-primary disabled:cursor-not-allowed disabled:opacity-40"
                      />
                    </label>
                    <label className="flex flex-col gap-1.5">
                      <span className="flex justify-between text-[0.76rem] font-bold text-text-secondary">
                        <span>{language === 'vi' ? 'Căn dọc' : 'Vertical'}</span>
                        <span className="font-mono text-primary">{localEffectY}px</span>
                      </span>
                      <input
                        type="range"
                        min="-300"
                        max="300"
                        step="2"
                        value={localEffectY}
                        disabled={savingSettings}
                        onChange={(event) => setLocalEffectY(Number(event.target.value))}
                        onMouseUp={(event) => onSaveSettings({ jarEffectY: Number((event.target as HTMLInputElement).value) })}
                        onTouchEnd={(event) => onSaveSettings({ jarEffectY: Number((event.target as HTMLInputElement).value) })}
                        className="h-1.5 w-full cursor-pointer accent-primary disabled:cursor-not-allowed disabled:opacity-40"
                      />
                    </label>
                  </div>
                  <label className="flex flex-col gap-1.5 border-t border-border-color/20 pt-3">
                    <span className="flex justify-between text-[0.76rem] font-bold text-text-secondary">
                      <span>{language === 'vi' ? 'Thời gian nghỉ giữa các lần chạy' : 'Interval between plays'}</span>
                      <span className="font-mono text-primary">{localEffectDelay}s</span>
                    </span>
                    <input
                      type="range"
                      min="0"
                      max="60"
                      step="1"
                      value={localEffectDelay}
                      disabled={savingSettings}
                      onChange={(event) => setLocalEffectDelay(Number(event.target.value))}
                      onMouseUp={(event) => onSaveSettings({ jarEffectDelay: Number((event.target as HTMLInputElement).value) })}
                      onTouchEnd={(event) => onSaveSettings({ jarEffectDelay: Number((event.target as HTMLInputElement).value) })}
                      className="h-1.5 w-full cursor-pointer accent-primary disabled:cursor-not-allowed disabled:opacity-40"
                    />
                    <span className="text-[0.66rem] text-text-muted">
                      {language === 'vi' ? 'Hiệu ứng chạy hết một lần, ẩn đi rồi chờ đủ số giây này để chạy lại.' : 'After one full play, the effect hides and waits this many seconds before replaying.'}
                    </span>
                  </label>
                </div>
              )}
            </div>

            {/* Pro Max jar name plate */}
            <div className="flex flex-col gap-3 border-t border-border-color/20 pt-3">
              <div className="flex items-center justify-between gap-3">
                <div><span className="flex items-center gap-2 text-[0.85rem] font-bold text-text-secondary"><i className="fa-solid fa-signature text-primary" />{language === 'vi' ? 'Bảng tên trên miệng hũ' : 'Upper rim name plate'}<span className="rounded-sm bg-primary/15 px-1.5 py-0.5 text-[0.58rem] font-extrabold text-primary">PRO MAX</span></span><p className="mt-1 text-[0.68rem] text-text-muted">{language === 'vi' ? 'Gắn bảng tên trang trí vào viền trên của hũ.' : 'Attach a decorative name plate to the upper jar rim.'}</p></div>
                <label className="relative inline-flex shrink-0 items-center cursor-pointer"><input type="checkbox" className="peer sr-only" disabled={savingSettings || !fullOptions} checked={fullOptions && Boolean(settings.jarNameEnabled)} onChange={(event) => onSaveSettings({ jarNameEnabled: event.target.checked, jarNameImage: settings.jarNameImage || JAR_NAME_OPTIONS[0].src })} /><span className="relative h-[20px] w-10 rounded-full border border-border-color bg-white/10 transition-all duration-300 after:absolute after:left-[2px] after:top-[2px] after:h-[14px] after:w-[14px] after:rounded-full after:bg-white after:transition-all peer-checked:border-transparent peer-checked:bg-primary peer-checked:shadow-[0_0_8px_var(--color-primary-glow)] peer-checked:after:translate-x-[20px] peer-disabled:opacity-40" /></label>
              </div>

              {fullOptions && settings.jarNameEnabled && <div className="flex flex-col gap-3 rounded-xl border border-border-color bg-bg-input p-3">
                <div className="grid grid-cols-2 gap-2">{JAR_NAME_OPTIONS.map((option) => <button key={option.id} type="button" disabled={savingSettings} onClick={() => onSaveSettings({ jarNameImage: option.src })} className={`relative overflow-hidden rounded-md border p-2 transition-all duration-200 ${settings.jarNameImage === option.src ? 'border-primary bg-primary/10 text-primary' : 'border-border-color bg-bg-surface hover:border-primary/40'}`}><img src={option.src} alt={option.label} className="h-16 w-full object-contain" /><span className="mt-1 block truncate text-[0.68rem] font-bold text-white">{option.label}</span></button>)}</div>
                <label className="flex flex-col gap-1.5"><span className="flex justify-between text-[0.76rem] font-bold text-text-secondary"><span>{language === 'vi' ? 'Kích thước' : 'Scale'}</span><span className="font-mono text-primary font-bold">{localNameScale.toFixed(2)}x</span></span><input type="range" min="0.2" max="1.5" step="0.05" value={localNameScale} disabled={savingSettings} onChange={(event) => setLocalNameScale(Number(event.target.value))} onMouseUp={(event) => onSaveSettings({ jarNameScale: Number((event.target as HTMLInputElement).value) })} onTouchEnd={(event) => onSaveSettings({ jarNameScale: Number((event.target as HTMLInputElement).value) })} className="h-1.5 w-full cursor-pointer accent-primary" /></label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="flex flex-col gap-1.5"><span className="flex justify-between text-[0.76rem] font-bold text-text-secondary"><span>X</span><span className="font-mono text-primary font-bold">{localNameX}px</span></span><input type="range" min="-220" max="220" step="2" value={localNameX} disabled={savingSettings} onChange={(event) => setLocalNameX(Number(event.target.value))} onMouseUp={(event) => onSaveSettings({ jarNameX: Number((event.target as HTMLInputElement).value) })} onTouchEnd={(event) => onSaveSettings({ jarNameX: Number((event.target as HTMLInputElement).value) })} className="h-1.5 w-full cursor-pointer accent-primary" /></label>
                  <label className="flex flex-col gap-1.5"><span className="flex justify-between text-[0.76rem] font-bold text-text-secondary"><span>Y</span><span className="font-mono text-primary font-bold">{localNameY}px</span></span><input type="range" min="-180" max="160" step="2" value={localNameY} disabled={savingSettings} onChange={(event) => setLocalNameY(Number(event.target.value))} onMouseUp={(event) => onSaveSettings({ jarNameY: Number((event.target as HTMLInputElement).value) })} onTouchEnd={(event) => onSaveSettings({ jarNameY: Number((event.target as HTMLInputElement).value) })} className="h-1.5 w-full cursor-pointer accent-primary" /></label>
                </div>
              </div>}
            </div>

            {/* Dance Mascot Decoration Settings */}
            <div className="flex flex-col gap-3 pt-3 border-t border-border-color/20 animate-[fade-in-up_0.2s_ease-out]">
              <div className="flex justify-between items-center select-none">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[0.85rem] text-text-secondary font-bold flex items-center gap-1.5">
                    <i className="fa-solid fa-person-dancing text-primary" />
                    {language === 'vi' ? 'Nhân vật Nhảy Trang Trí:' : 'Dance Mascot Decoration:'}
                  </span>
                  <span className="text-[0.68rem] text-text-muted">
                    {language === 'vi' ? 'Hiển thị video nhảy (Capybara) đã xóa phông xanh bên cạnh hũ' : 'Display chroma-keyed dance video next to the jar'}
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer select-none">
                  <input 
                    type="checkbox" 
                    checked={fullOptions && settings.jarDanceEnabled !== false} 
                    onChange={(e) => onSaveSettings({ jarDanceEnabled: e.target.checked })} 
                    className="peer sr-only"
                    disabled={savingSettings || !fullOptions}
                  />
                  <span className="w-10 h-[20px] bg-white/10 rounded-full relative transition-all duration-300 border border-border-color after:absolute after:w-[14px] after:h-[14px] after:rounded-full after:bg-white after:top-[2px] after:left-[2px] after:transition-all after:duration-300 after:ease-out peer-checked:bg-primary peer-checked:border-transparent peer-checked:shadow-[0_0_8px_var(--color-primary-glow)] peer-checked:after:translate-x-[20px] peer-disabled:opacity-40" />
                </label>
              </div>

              {settings.jarDanceEnabled !== false && (
                <div className="flex flex-col gap-3 pl-2">
                  {/* Position selector: Left vs Right */}
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[0.78rem] text-text-muted font-bold select-none">
                      {language === 'vi' ? 'Vị trí nhảy:' : 'Dance Position:'}
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => onSaveSettings({ jarDancePosition: 'left' })}
                        disabled={savingSettings}
                        className={`py-1.5 rounded-xl text-[0.72rem] font-bold cursor-pointer transition-all duration-200 border outline-none disabled:opacity-40 ${
                          (settings.jarDancePosition || 'left') === 'left'
                            ? 'bg-primary/15 text-primary border-primary shadow-[0_0_8px_var(--color-primary-glow)]'
                            : 'bg-bg-surface text-text-secondary border-border-color hover:bg-bg-input'
                        }`}
                      >
                        <i className="fa-solid fa-arrow-left mr-1.5" />
                        {language === 'vi' ? 'Bên Trái Hũ' : 'Left Side'}
                      </button>
                      <button
                        type="button"
                        onClick={() => onSaveSettings({ jarDancePosition: 'right' })}
                        disabled={savingSettings}
                        className={`py-1.5 rounded-xl text-[0.72rem] font-bold cursor-pointer transition-all duration-200 border outline-none disabled:opacity-40 ${
                          settings.jarDancePosition === 'right'
                            ? 'bg-primary/15 text-primary border-primary shadow-[0_0_8px_var(--color-primary-glow)]'
                            : 'bg-bg-surface text-text-secondary border-border-color hover:bg-bg-input'
                        }`}
                      >
                        {language === 'vi' ? 'Bên Phải Hũ' : 'Right Side'}
                        <i className="fa-solid fa-arrow-right ml-1.5" />
                      </button>
                    </div>
                  </div>

                  {/* Dance Mascot Scale Slider */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center text-[0.78rem] text-text-muted select-none">
                      <span>{language === 'vi' ? 'Kích thước nhân vật:' : 'Mascot Scale:'}</span>
                      <span className="text-primary font-mono font-bold">{localDanceScale.toFixed(1)}x</span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="2.0"
                      step="0.1"
                      value={localDanceScale}
                      onChange={(e) => setLocalDanceScale(Number(e.target.value))}
                      onMouseUp={(e) => onSaveSettings({ jarDanceScale: Number((e.target as HTMLInputElement).value) })}
                      onTouchEnd={(e) => onSaveSettings({ jarDanceScale: Number((e.target as HTMLInputElement).value) })}
                      disabled={savingSettings}
                      className="w-full accent-primary cursor-pointer h-1.5 bg-white/10 rounded-lg outline-none disabled:opacity-40 disabled:cursor-not-allowed"
                    />
                  </div>

                  {/* Distance to Jar Slider (Near/Far) */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center text-[0.78rem] text-text-muted select-none">
                      <span>{language === 'vi' ? 'Khoảng cách tới Hũ (Gần/Xa):' : 'Distance to Jar (Near/Far):'}</span>
                      <span className="text-primary font-mono font-bold">{localDanceOffsetX}px</span>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="400"
                      step="5"
                      value={localDanceOffsetX}
                      onChange={(e) => setLocalDanceOffsetX(Number(e.target.value))}
                      onMouseUp={(e) => onSaveSettings({ jarDanceOffsetX: Number((e.target as HTMLInputElement).value) })}
                      onTouchEnd={(e) => onSaveSettings({ jarDanceOffsetX: Number((e.target as HTMLInputElement).value) })}
                      disabled={savingSettings}
                      className="w-full accent-primary cursor-pointer h-1.5 bg-white/10 rounded-lg outline-none disabled:opacity-40 disabled:cursor-not-allowed"
                    />
                  </div>

                  {/* Source info */}
                  <div className="flex items-center justify-between p-2 bg-bg-input rounded-xl border border-border-color text-[0.7rem] text-text-muted">
                    <span className="flex items-center gap-1.5 truncate">
                      <i className="fa-solid fa-film text-primary" />
                      <span className="truncate">Capybara Dance (capy_dance.mp4)</span>
                    </span>
                    <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-md text-[0.62rem] font-mono shrink-0">
                      Auto Chroma Key
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Left Column: Interactive Preview & Actions */}
      <div className="contents">
        {/* Standalone Live Overlay Viewport */}
        <LiveOverlayViewport
          enabled={settings.jarEnabled || false}
          showHeader={false}
          className="order-1 lg:row-span-2 !border-0 !bg-transparent !p-0 !backdrop-blur-none"
          viewportClassName="max-w-[420px] xl:max-w-[480px]"
          previewTarget="jar"
          previewSettings={{
            ...settings,
            jarX: localX,
            jarY: localY,
            jarScale: localScale,
            jarEffectScale: localEffectScale,
            jarEffectX: localEffectX,
            jarEffectY: localEffectY,
            jarEffectDelay: localEffectDelay,
          }}
          interactionLayer={(
            <OverlayPreviewControls
              x={localX}
              y={localY}
              scale={localScale}
              target="jar"
              settingKeys={{ x: 'jarX', y: 'jarY', scale: 'jarScale' }}
              label={language === 'vi' ? 'Kéo để di chuyển' : 'Drag to move'}
              disabled={savingSettings}
              maxScale={2.5}
              onChange={(next) => {
                setLocalX(next.x);
                setLocalY(next.y);
                setLocalScale(next.scale);
              }}
              onCommit={(next) => {
                void onSaveSettings({ jarX: next.x, jarY: next.y, jarScale: next.scale });
              }}
            />
          )}
        />

        {settings.jarEnabled && (
          <div className="order-3 bg-bg-card border border-border-color rounded-2xl p-5 backdrop-blur-[24px] flex flex-col gap-5 glass-shadow w-full animate-[fade-in-up_0.25s_ease-out]">
            <div className="flex flex-col gap-1 border-b border-border-color/30 pb-3">
              <h4 className="font-header text-[0.98rem] font-bold text-white uppercase tracking-[0.5px] flex items-center gap-2">
                <i className="fa-solid fa-broom text-primary animate-pulse" />
                <span>{language === 'vi' ? 'Hành động nhanh' : 'Quick Actions'}</span>
              </h4>
              <p className="text-[0.7rem] text-text-muted">
                {language === 'vi' ? 'Thực hiện dọn hũ hoặc kiểm tra hoạt động hũ quà.' : 'Reset the hũ quà container state in real-time.'}
              </p>
            </div>

            {/* Clear Jar Button */}
            <div className="flex flex-col gap-3">
              <span className="text-[0.82rem] text-text-secondary font-bold select-none">
                {language === 'vi' ? 'Dọn dẹp hũ quà:' : 'Reset Jar state:'}
              </span>
              <button
                type="button"
                onClick={handleClearJar}
                disabled={savingSettings}
                className="w-full py-2.5 rounded-xl text-[0.8rem] font-bold tracking-[0.5px] uppercase cursor-pointer outline-none bg-gradient-to-r from-primary to-accent text-white hover:shadow-[0_4px_16px_var(--color-primary-glow)] hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none disabled:scale-100"
              >
                <i className="fa-solid fa-trash-can mr-2" />
                {language === 'vi' ? 'Làm trống hũ quà' : 'Empty the Jar'}
              </button>
            </div>

            {/* Simulate Drop Button */}
            {onSimulateEvent && (
              <div className="flex flex-col gap-3">
                <span className="text-[0.82rem] text-text-secondary font-bold select-none">
                  {language === 'vi' ? 'Chạy thử hũ quà:' : 'Test falling physics:'}
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleSimulateDrop(1)}
                    disabled={savingSettings}
                    className="py-2.5 rounded-xl text-[0.78rem] font-bold tracking-[0.5px] uppercase cursor-pointer outline-none bg-primary text-white hover:shadow-[0_4px_12px_var(--color-primary-glow)] hover:scale-[1.01] active:scale-[0.99] transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none disabled:scale-100"
                  >
                    <i className="fa-solid fa-gift mr-1.5" />
                    {language === 'vi' ? 'Rơi 1 Quà' : 'Drop 1 Gift'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSimulateDrop(5)}
                    disabled={savingSettings}
                    className="py-2.5 rounded-xl text-[0.78rem] font-bold tracking-[0.5px] uppercase cursor-pointer outline-none bg-gradient-to-r from-primary to-accent text-white hover:shadow-[0_4px_12px_var(--color-primary-glow)] hover:scale-[1.01] active:scale-[0.99] transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none disabled:scale-100"
                  >
                    <i className="fa-solid fa-gifts mr-1.5" />
                    {language === 'vi' ? 'Rơi Combo x5' : 'Drop Combo x5'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
