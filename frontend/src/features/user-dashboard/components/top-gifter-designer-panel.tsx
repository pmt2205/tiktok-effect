'use client';

import React from 'react';
import { OverlaySettings } from '@/types';
import Button from '@/components/ui/button';
import Select, { SelectOption } from '@/components/ui/select';

import LiveOverlayViewport from './live-overlay-viewport';

interface TopGifterDesignerPanelProps {
  language: 'vi' | 'en';
  settings: OverlaySettings;
  onSaveSettings: (newSettings: Partial<OverlaySettings>) => void;
  onSimulateTopGifter: () => void;
}

const rankOptions: SelectOption[] = [
  { value: '1', label: '👑 Chỉ Top 1 Gifter' },
  { value: '3', label: '🥇 Top 3 Gifters' },
  { value: '5', label: '🏆 Top 5 Gifters' },
  { value: '10', label: '⭐ Top 10 Gifters' },
  { value: '999', label: '🌐 Tất cả Gifters đã tặng quà' },
];

export default function TopGifterDesignerPanel({
  language,
  settings,
  onSaveSettings,
  onSimulateTopGifter,
}: TopGifterDesignerPanelProps) {
  const isEnabled = settings.topGifterEnabled !== false;

  return (
    <div className="flex flex-col gap-6 w-full animate-[fade-in-up_0.4s_ease-out] glass-card p-6 rounded-2xl border border-border-color bg-[#0d0f18]/70 backdrop-blur-2xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border-color/30 pb-4">
        <div>
          <h3 className="font-header text-xl font-extrabold text-white flex items-center gap-2">
            <span className="text-2xl">👑</span>
            <span>
              {language === 'vi'
                ? 'Cấu Hình Thông Báo Top Gifter Vào Phòng'
                : 'Top Gifter Room Entry Alert'}
            </span>
          </h3>
          <p className="text-xs text-text-muted mt-1">
            {language === 'vi'
              ? 'Khi User Top Tặng Quà của phòng livestream tham gia phòng, tự động hiện Avatar nổi bật 4 giây trên màn hình OBS.'
              : 'Automatically display prominent avatar for 4 seconds when a Top Gifter joins the live room.'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Form Controls */}
        <div className="lg:col-span-6 flex flex-col gap-4">
          {/* Toggle Switch */}
          <div className="flex flex-col gap-2 p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-white">
                {language === 'vi' ? 'Bật thông báo Top Gifter' : 'Enable Top Gifter Alert'}
              </span>
              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isEnabled}
                  onChange={(e) => onSaveSettings({ topGifterEnabled: e.target.checked })}
                  className="peer sr-only"
                />
                <span className="w-11 h-6 bg-white/10 rounded-full relative transition-all border border-border-color after:absolute after:w-4 after:h-4 after:rounded-full after:bg-white after:top-[3px] after:left-[3px] after:transition-all peer-checked:bg-primary peer-checked:after:translate-x-5" />
              </label>
            </div>
            <p className="text-xs text-text-muted">
              {language === 'vi'
                ? 'Tự động kích hoạt khung Avatar 4s khi Top Gifter vào phòng'
                : 'Auto trigger 4s avatar overlay when Top Gifter enters'}
            </p>
          </div>

          {/* Sub-settings visible only when Top Gifter is Enabled */}
          {isEnabled && (
            <div className="flex flex-col gap-4 animate-[fade-in-up_0.25s_ease-out]">
              {/* Display Duration */}
              <div className="flex flex-col gap-2 p-4 rounded-xl bg-white/5 border border-white/10">
                <label className="text-sm font-bold text-white">
                  {language === 'vi' ? 'Thời gian hiển thị (Giây):' : 'Display Duration (Sec):'}
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="2"
                    max="10"
                    step="1"
                    value={settings.topGifterDuration !== undefined ? settings.topGifterDuration : 4}
                    onChange={(e) => onSaveSettings({ topGifterDuration: Number(e.target.value) })}
                    className="w-full accent-primary cursor-pointer"
                  />
                  <span className="text-sm font-extrabold text-secondary font-mono w-10 text-center">
                    {settings.topGifterDuration !== undefined ? settings.topGifterDuration : 4}s
                  </span>
                </div>
                <p className="text-xs text-text-muted">
                  {language === 'vi' ? 'Mặc định là 4 giây theo yêu cầu' : 'Default is 4 seconds'}
                </p>
              </div>

              {/* Rank Limit */}
              <div className="flex flex-col gap-2 p-4 rounded-xl bg-white/5 border border-white/10">
                <label className="text-sm font-bold text-white">
                  {language === 'vi' ? 'Giới hạn Xếp Hạng Top:' : 'Top Rank Limit:'}
                </label>
                <Select
                  value={String(settings.topGifterRankLimit !== undefined ? settings.topGifterRankLimit : 5)}
                  options={rankOptions}
                  onChange={(val) => onSaveSettings({ topGifterRankLimit: Number(val) })}
                  className="mb-0"
                />
                <p className="text-xs text-text-muted">
                  {language === 'vi'
                    ? 'Chỉ hiện thông báo cho User nằm trong vị trí Top chọn'
                    : 'Only trigger for users within designated rank'}
                </p>
              </div>

              {/* Quick Action Test Button */}
              <div className="flex flex-col gap-2 p-4 rounded-xl bg-white/5 border border-white/10">
                <span className="text-sm font-bold text-white">
                  {language === 'vi' ? 'Hành động thử nghiệm:' : 'Test Action:'}
                </span>
                <Button
                  onClick={onSimulateTopGifter}
                  className="w-full bg-gradient-to-r from-[#ff0050] to-[#d0003c] text-white shadow-[0_4px_16px_var(--primary-glow)] hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 py-2.5"
                >
                  <i className="fa-solid fa-play" />
                  <span>
                    {language === 'vi'
                      ? 'Bắn thử Top Gifter vào phòng (4s)'
                      : 'Test Top Gifter Join (4s)'}
                  </span>
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Live OBS Viewport */}
        <div className="lg:col-span-6">
          <LiveOverlayViewport enabled={isEnabled} />
        </div>
      </div>
    </div>
  );
}
