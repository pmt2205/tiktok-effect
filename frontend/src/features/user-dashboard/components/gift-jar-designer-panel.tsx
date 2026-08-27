'use client';

import React, { useState, useEffect } from 'react';

interface GiftJarDesignerPanelProps {
  language: 'vi' | 'en';
  settings: any;
  savingSettings: boolean;
  onSaveSettings: (updates: Partial<any>) => Promise<void>;
  onSimulateEvent?: (eventType: string, payload: any) => void;
}

export default function GiftJarDesignerPanel({
  language,
  settings,
  savingSettings,
  onSaveSettings,
  onSimulateEvent,
}: GiftJarDesignerPanelProps) {
  const [localX, setLocalX] = useState(settings.jarX !== undefined ? settings.jarX : 75);
  const [localY, setLocalY] = useState(settings.jarY !== undefined ? settings.jarY : 50);
  const [localScale, setLocalScale] = useState(settings.jarScale !== undefined ? settings.jarScale : 1.0);
  const [localGiftSize, setLocalGiftSize] = useState(settings.jarGiftSize !== undefined ? settings.jarGiftSize : 1.0);
  const [localFallSpeed, setLocalFallSpeed] = useState(settings.jarFallSpeed !== undefined ? settings.jarFallSpeed : 1.0);

  useEffect(() => {
    setLocalX(settings.jarX !== undefined ? settings.jarX : 75);
    setLocalY(settings.jarY !== undefined ? settings.jarY : 50);
    setLocalScale(settings.jarScale !== undefined ? settings.jarScale : 1.0);
    setLocalGiftSize(settings.jarGiftSize !== undefined ? settings.jarGiftSize : 1.0);
    setLocalFallSpeed(settings.jarFallSpeed !== undefined ? settings.jarFallSpeed : 1.0);
  }, [settings]);

  const handleToggleJar = (enabled: boolean) => {
    onSaveSettings({ jarEnabled: enabled });
  };

  const handleSliderChange = (field: 'x' | 'y' | 'scale' | 'giftSize' | 'fallSpeed', val: number) => {
    if (field === 'x') {
      setLocalX(val);
    } else if (field === 'y') {
      setLocalY(val);
    } else if (field === 'scale') {
      setLocalScale(val);
    } else if (field === 'giftSize') {
      setLocalGiftSize(val);
    } else if (field === 'fallSpeed') {
      setLocalFallSpeed(val);
    }
  };

  const handleSliderRelease = (field: 'x' | 'y' | 'scale' | 'giftSize' | 'fallSpeed', val: number) => {
    if (field === 'x') {
      onSaveSettings({ jarX: val });
    } else if (field === 'y') {
      onSaveSettings({ jarY: val });
    } else if (field === 'scale') {
      onSaveSettings({ jarScale: val });
    } else if (field === 'giftSize') {
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
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full items-start animate-[fade-in-up_0.4s_ease-out]">
      {/* Left Column: Settings Form */}
      <div className="lg:col-span-6 bg-bg-card border border-border-color rounded-2xl p-5 md:p-6 backdrop-blur-[24px] flex flex-col gap-5 glass-shadow w-full">
        <div className="flex flex-col gap-1 border-b border-border-color/30 pb-3">
          <h4 className="font-header text-[0.98rem] font-bold text-white uppercase tracking-[0.5px] flex items-center gap-2">
            <i className="fa-solid fa-cookie-bite text-secondary animate-pulse" />
            <span>{language === 'vi' ? 'Thiết lập Hũ Quà' : 'Gift Jar Settings'}</span>
          </h4>
          <p className="text-[0.7rem] text-text-muted">
            {language === 'vi' ? 'Tùy chỉnh hũ quà rơi tích lũy của người xem trên OBS.' : 'Customize your interactive viewer gift jar on OBS.'}
          </p>
        </div>

        {/* Enable Toggle */}
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
            <span className="w-10 h-[20px] bg-white/8 rounded-full relative transition-all duration-300 border border-border-color after:absolute after:w-[14px] after:h-[14px] after:rounded-full after:bg-white after:top-[2px] after:left-[2px] after:transition-all after:duration-300 after:ease-out peer-checked:bg-secondary peer-checked:border-transparent peer-checked:shadow-[0_0_8px_var(--color-secondary-glow)] peer-checked:after:translate-x-[20px] peer-disabled:opacity-40" />
          </label>
        </div>

        {/* Position X Slider */}
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
            disabled={!settings.jarEnabled || savingSettings}
            className="w-full accent-secondary cursor-pointer h-1.5 bg-white/10 rounded-lg outline-none disabled:opacity-40 disabled:cursor-not-allowed"
          />
        </div>

        {/* Position Y Slider */}
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
            disabled={!settings.jarEnabled || savingSettings}
            className="w-full accent-secondary cursor-pointer h-1.5 bg-white/10 rounded-lg outline-none disabled:opacity-40 disabled:cursor-not-allowed"
          />
        </div>

        {/* Scale Slider */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center text-[0.8rem] text-text-secondary font-bold select-none">
            <span>{language === 'vi' ? 'Kích thước hũ:' : 'Jar Scale:'}</span>
            <span className="text-secondary font-mono">{localScale.toFixed(1)}x</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="2.0"
            step="0.1"
            value={localScale}
            onChange={(e) => handleSliderChange('scale', Number(e.target.value))}
            onMouseUp={(e) => handleSliderRelease('scale', Number((e.target as HTMLInputElement).value))}
            onTouchEnd={(e) => handleSliderRelease('scale', Number((e.target as HTMLInputElement).value))}
            disabled={!settings.jarEnabled || savingSettings}
            className="w-full accent-secondary cursor-pointer h-1.5 bg-white/10 rounded-lg outline-none disabled:opacity-40 disabled:cursor-not-allowed"
          />
        </div>

        {/* Gift Size Slider */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center text-[0.8rem] text-text-secondary font-bold select-none">
            <span>{language === 'vi' ? 'Kích thước quà:' : 'Gift Icon Size:'}</span>
            <span className="text-secondary font-mono">{localGiftSize.toFixed(1)}x</span>
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
            disabled={!settings.jarEnabled || savingSettings}
            className="w-full accent-secondary cursor-pointer h-1.5 bg-white/10 rounded-lg outline-none disabled:opacity-40 disabled:cursor-not-allowed"
          />
        </div>

        {/* Fall Speed Slider */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center text-[0.8rem] text-text-secondary font-bold select-none">
            <span>{language === 'vi' ? 'Tốc độ rơi:' : 'Fall Speed:'}</span>
            <span className="text-secondary font-mono">{localFallSpeed.toFixed(1)}x</span>
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
            disabled={!settings.jarEnabled || savingSettings}
            className="w-full accent-secondary cursor-pointer h-1.5 bg-white/10 rounded-lg outline-none disabled:opacity-40 disabled:cursor-not-allowed"
          />
        </div>

        {/* Jar Type Selection */}
        <div className="flex flex-col gap-2 pt-2 border-t border-border-color/20">
          <span className="text-[0.82rem] text-text-secondary font-bold select-none">
            {language === 'vi' ? 'Kiểu hũ quà:' : 'Jar Style:'}
          </span>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => onSaveSettings({ jarType: 'standard' })}
              disabled={!settings.jarEnabled || savingSettings}
              className={`py-2 rounded-xl text-[0.78rem] font-bold cursor-pointer transition-all duration-200 border outline-none disabled:opacity-40 disabled:cursor-not-allowed ${
                (settings.jarType || 'standard') === 'standard'
                  ? 'bg-secondary text-black border-transparent shadow-[0_0_12px_var(--color-secondary-glow)]'
                  : 'bg-white/5 text-text-secondary border-border-color hover:bg-white/10'
              }`}
            >
              {language === 'vi' ? 'Hũ Thường' : 'Standard'}
            </button>
            <button
              type="button"
              onClick={() => onSaveSettings({ jarType: 'pro' })}
              disabled={!settings.jarEnabled || savingSettings}
              className={`py-2 rounded-xl text-[0.78rem] font-bold cursor-pointer transition-all duration-200 border outline-none disabled:opacity-40 disabled:cursor-not-allowed ${
                settings.jarType === 'pro'
                  ? 'bg-secondary text-black border-transparent shadow-[0_0_12px_var(--color-secondary-glow)]'
                  : 'bg-white/5 text-text-secondary border-border-color hover:bg-white/10'
              }`}
            >
              {language === 'vi' ? 'Hũ Cao Cấp (Pro)' : 'Pro Jar'}
            </button>
          </div>
        </div>

        {/* Pro Colors Selection */}
        {settings.jarType === 'pro' && (
          <div className="flex flex-col gap-2 pt-1 animate-[fade-in-up_0.2s_ease-out]">
            <div className="flex justify-between items-center text-[0.82rem] text-text-secondary font-bold select-none">
              <span>{language === 'vi' ? 'Tự chọn màu sắc Hũ Pro:' : 'Custom Pro Jar Color:'}</span>
              <span className="text-secondary font-mono uppercase text-[0.76rem]">{settings.jarColor || '#ffffff'}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-10 border border-border-color rounded-xl overflow-hidden cursor-pointer bg-white/5 flex items-center justify-center transition-all duration-200 focus-within:border-secondary">
                <input
                  type="color"
                  value={settings.jarColor || '#ffffff'}
                  onChange={(e) => onSaveSettings({ jarColor: e.target.value })}
                  disabled={!settings.jarEnabled || savingSettings}
                  className="absolute inset-0 w-[200%] h-[200%] -translate-x-[25%] -translate-y-[25%] cursor-pointer border-none p-0 bg-transparent outline-none disabled:opacity-40 disabled:cursor-not-allowed"
                />
              </div>
              
              {/* Preset quick colors */}
              <div className="flex gap-1.5 grow justify-between">
                {[
                  { value: '#e2b3a3', label: language === 'vi' ? 'Hồng Vàng' : 'Rose Gold' },
                  { value: '#f49bbb', label: language === 'vi' ? 'Hồng Đậm' : 'Pink' },
                  { value: '#ffffff', label: language === 'vi' ? 'Bạc/Trắng' : 'Silver' },
                  { value: '#00f2fe', label: language === 'vi' ? 'Xanh Neon' : 'Neon' },
                  { value: '#ff0050', label: language === 'vi' ? 'Đỏ TikTok' : 'Red' },
                ].map((preset) => (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => onSaveSettings({ jarColor: preset.value })}
                    disabled={!settings.jarEnabled || savingSettings}
                    className={`px-2 py-1.5 bg-white/5 hover:bg-white/10 text-white/80 rounded-lg text-[0.62rem] font-bold border transition-all duration-150 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                      settings.jarColor === preset.value
                        ? 'border-secondary text-secondary shadow-[0_0_8px_var(--color-secondary-glow)]'
                        : 'border-border-color'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Right Column: Actions & Tips */}
      <div className="lg:col-span-6 bg-bg-card border border-border-color rounded-2xl p-5 md:p-6 backdrop-blur-[24px] flex flex-col gap-5 glass-shadow w-full">
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
            disabled={!settings.jarEnabled || savingSettings}
            className="w-full py-2.5 rounded-xl text-[0.8rem] font-bold tracking-[0.5px] uppercase cursor-pointer outline-none bg-gradient-to-r from-primary to-[#d0003c] text-white hover:shadow-[0_4px_16px_var(--color-primary-glow)] hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none disabled:scale-100"
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
                disabled={!settings.jarEnabled || savingSettings}
                className="py-2.5 rounded-xl text-[0.78rem] font-bold tracking-[0.5px] uppercase cursor-pointer outline-none bg-secondary text-black hover:shadow-[0_4px_12px_var(--color-secondary-glow)] hover:scale-[1.01] active:scale-[0.99] transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none disabled:scale-100"
              >
                <i className="fa-solid fa-gift mr-1.5" />
                {language === 'vi' ? 'Rơi 1 Quà' : 'Drop 1 Gift'}
              </button>
              <button
                type="button"
                onClick={() => handleSimulateDrop(5)}
                disabled={!settings.jarEnabled || savingSettings}
                className="py-2.5 rounded-xl text-[0.78rem] font-bold tracking-[0.5px] uppercase cursor-pointer outline-none bg-gradient-to-r from-secondary to-[#00f2fe] text-black hover:shadow-[0_4px_12px_var(--color-secondary-glow)] hover:scale-[1.01] active:scale-[0.99] transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none disabled:scale-100"
              >
                <i className="fa-solid fa-gifts mr-1.5" />
                {language === 'vi' ? 'Rơi Combo x5' : 'Drop Combo x5'}
              </button>
            </div>
          </div>
        )}

        {/* Tips Box */}
        <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl text-[0.72rem] text-text-muted select-none flex flex-col gap-2 mt-2">
          <div className="font-bold text-text-secondary flex items-center gap-1.5">
            <i className="fa-solid fa-circle-info text-secondary" />
            <span>Interactive Gift Jar Tips</span>
          </div>
          <ul className="list-disc pl-4 flex flex-col gap-1.5">
            <li>
              {language === 'vi'
                ? 'Khi người xem tặng quà trên live, các icon quà sẽ rơi tự động từ trên cao vào lọ.'
                : 'Falling gift icons drop into the jar automatically from the top of the overlay.'}
            </li>
            <li>
              {language === 'vi'
                ? 'Các món quà sẽ va chạm vật lý và chồng lên nhau. Sau 20 giây, quà cũ nhất ở đáy lọ sẽ tự tan biến để tối ưu hiệu năng.'
                : 'Gifts physically stack up. Older ones automatically fade away after 20s to maintain performance.'}
            </li>
            <li>
              {language === 'vi'
                ? 'Bạn có thể làm trống hũ quà trên livestream bất kỳ lúc nào bằng nút "Làm trống hũ quà".'
                : 'Click "Empty the Jar" to sweep out all falling particles currently in the container.'}
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
