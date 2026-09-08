'use client';

import React from 'react';
import { OverlaySettings, LikeLeaderboardItem } from '@/types';
import Button from '@/components/ui/button';
import LikeLeaderboardOverlay from '@/features/overlay/components/like-leaderboard-overlay';
import LiveOverlayViewport from './live-overlay-viewport';

interface LikeLeaderboardDesignerPanelProps {
  language: 'vi' | 'en';
  settings: OverlaySettings;
  likeLeaderboard: LikeLeaderboardItem[];
  onSaveSettings: (newSettings: Partial<OverlaySettings>) => void;
  onSimulateLike: () => void;
  onResetLikeLeaderboard: () => void;
}

export default function LikeLeaderboardDesignerPanel({
  language,
  settings,
  likeLeaderboard,
  onSaveSettings,
  onSimulateLike,
  onResetLikeLeaderboard,
}: LikeLeaderboardDesignerPanelProps) {
  const isEnabled =
    settings.likeLeaderboardEnabled !== false &&
    (settings.likeLeaderboardEnabled as any) !== 'false';

  return (
    <div className="flex flex-col gap-6 w-full animate-[fade-in-up_0.4s_ease-out] glass-card p-6 rounded-2xl border border-border-color bg-[#0d0f18]/70 backdrop-blur-2xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border-color/30 pb-4">
        <div>
          <h3 className="font-header text-xl font-extrabold text-white flex items-center gap-2">
            <span className="text-2xl animate-pulse">❤️</span>
            <span>
              {language === 'vi'
                ? 'Cấu Hình Bảng Xếp Hạng Tap Tay (Tym Live)'
                : 'Like Leaderboard Settings'}
            </span>
          </h3>
          <p className="text-xs text-text-muted mt-1">
            {language === 'vi'
              ? 'Bảng xếp hạng cập nhật thời gian thực những người thả tim nhiều nhất phiên livestream (Top 1, Top 2, Top 3).'
              : 'Real-time live session tap like leaderboard tracking top 1, 2, 3 active likers.'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Controls */}
        <div className="lg:col-span-6 flex flex-col gap-4">
          {/* Toggle Switch */}
          <div className="flex flex-col gap-2 p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-white">
                {language === 'vi' ? 'Bật BXH Tap Tay' : 'Enable Like Leaderboard'}
              </span>
              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isEnabled}
                  onChange={(e) => onSaveSettings({ likeLeaderboardEnabled: e.target.checked })}
                  className="peer sr-only"
                />
                <span className="w-11 h-6 bg-white/10 rounded-full relative transition-all border border-border-color after:absolute after:w-4 after:h-4 after:rounded-full after:bg-white after:top-[3px] after:left-[3px] after:transition-all peer-checked:bg-secondary peer-checked:after:translate-x-5" />
              </label>
            </div>
            <p className="text-xs text-text-muted">
              {language === 'vi'
                ? 'Hiển thị khung BXH Tap Tay mờ thời gian thực trên Overlay OBS'
                : 'Display real-time glassmorphic like leaderboard overlay'}
            </p>
          </div>

          {/* Sub-settings visible only when Leaderboard is Enabled */}
          {isEnabled && (
            <div className="flex flex-col gap-4 animate-[fade-in-up_0.25s_ease-out]">
              {/* Leaderboard Title */}
              <div className="flex flex-col gap-2 p-4 rounded-xl bg-white/5 border border-white/10">
                <label className="text-sm font-bold text-white">
                  {language === 'vi' ? 'Tiêu đề BXH:' : 'Leaderboard Title:'}
                </label>
                <input
                  type="text"
                  value={settings.likeLeaderboardTitle || 'BẢNG XẾP HẠNG'}
                  onChange={(e) => onSaveSettings({ likeLeaderboardTitle: e.target.value })}
                  placeholder="BẢNG XẾP HẠNG"
                  className="bg-bg-input border border-border-color rounded-xl px-3 py-2 text-sm text-white font-body outline-none focus:border-secondary"
                />
                <p className="text-xs text-text-muted">
                  {language === 'vi'
                    ? 'Tiêu đề hiển thị ở đầu bảng xếp hạng'
                    : 'Title text shown at the top of leaderboard'}
                </p>
              </div>

              {/* Scale Slider */}
              <div className="flex flex-col gap-2 p-4 rounded-xl bg-white/5 border border-white/10">
                <label className="text-sm font-bold text-white">
                  {language === 'vi' ? 'Kích thước / Tỷ lệ (Scale):' : 'Leaderboard Scale:'}
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0.5"
                    max="1.8"
                    step="0.1"
                    value={settings.likeLeaderboardScale !== undefined ? settings.likeLeaderboardScale : 1.0}
                    onChange={(e) => onSaveSettings({ likeLeaderboardScale: Number(e.target.value) })}
                    className="w-full accent-secondary cursor-pointer"
                  />
                  <span className="text-sm font-extrabold text-secondary font-mono w-12 text-center">
                    {settings.likeLeaderboardScale !== undefined ? settings.likeLeaderboardScale : 1.0}x
                  </span>
                </div>
                <p className="text-xs text-text-muted">
                  {language === 'vi' ? 'Phóng to hoặc thu nhỏ khung BXH' : 'Adjust overlay component size'}
                </p>
              </div>

              {/* X Position Slider */}
              <div className="flex flex-col gap-2 p-4 rounded-xl bg-white/5 border border-white/10">
                <label className="text-sm font-bold text-white">
                  {language === 'vi' ? 'Vị trí Ngang X (%):' : 'X Position (%):'}
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max="90"
                    step="1"
                    value={settings.likeLeaderboardX !== undefined ? settings.likeLeaderboardX : 78}
                    onChange={(e) => onSaveSettings({ likeLeaderboardX: Number(e.target.value) })}
                    className="w-full accent-secondary cursor-pointer"
                  />
                  <span className="text-sm font-extrabold text-secondary font-mono w-12 text-center">
                    {settings.likeLeaderboardX !== undefined ? settings.likeLeaderboardX : 78}%
                  </span>
                </div>
                <p className="text-xs text-text-muted">
                  {language === 'vi' ? 'Khoảng cách từ lề trái màn hình' : 'Distance from left screen edge'}
                </p>
              </div>

              {/* Y Position Slider */}
              <div className="flex flex-col gap-2 p-4 rounded-xl bg-white/5 border border-white/10">
                <label className="text-sm font-bold text-white">
                  {language === 'vi' ? 'Vị trí Dọc Y (%):' : 'Y Position (%):'}
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max="90"
                    step="1"
                    value={settings.likeLeaderboardY !== undefined ? settings.likeLeaderboardY : 15}
                    onChange={(e) => onSaveSettings({ likeLeaderboardY: Number(e.target.value) })}
                    className="w-full accent-secondary cursor-pointer"
                  />
                  <span className="text-sm font-extrabold text-[#00f2fe] font-mono w-12 text-center">
                    {settings.likeLeaderboardY !== undefined ? settings.likeLeaderboardY : 15}%
                  </span>
                </div>
                <p className="text-xs text-text-muted">
                  {language === 'vi' ? 'Khoảng cách từ lề trên màn hình' : 'Distance from top screen edge'}
                </p>
              </div>

              {/* Quick Actions */}
              <div className="flex flex-col gap-2 p-4 rounded-xl bg-white/5 border border-white/10">
                <span className="text-sm font-bold text-white">
                  {language === 'vi' ? 'Hành động nhanh:' : 'Quick Actions:'}
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={onSimulateLike}
                    className="bg-gradient-to-r from-[#ff0050] to-[#d0003c] text-white shadow-[0_4px_16px_var(--primary-glow)] hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 py-2"
                  >
                    <i className="fa-solid fa-heart animate-bounce" />
                    <span>
                      {language === 'vi' ? 'Thả Tim Thử (+Tym)' : 'Simulate Like'}
                    </span>
                  </Button>
                  <Button
                    onClick={onResetLikeLeaderboard}
                    className="bg-white/10 hover:bg-white/20 text-gray-200 border border-white/15 active:scale-[0.98] transition-all flex items-center justify-center gap-2 py-2"
                  >
                    <i className="fa-solid fa-rotate-left" />
                    <span>{language === 'vi' ? 'Đặt lại BXH' : 'Reset Leaderboard'}</span>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Live OBS Viewport */}
        <div className="lg:col-span-6 flex flex-col gap-4">
          <LiveOverlayViewport enabled={isEnabled} />
          
          {/* Component Live Demo Preview */}
          {isEnabled && (
            <div className="relative w-full rounded-2xl bg-black/40 border border-secondary/30 p-4 flex flex-col gap-3 overflow-hidden animate-[fade-in-up_0.25s_ease-out]">
              <div className="flex justify-between items-center text-xs font-bold text-secondary uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  <i className="fa-solid fa-eye animate-pulse text-[#ff0050]" />
                  <span>
                    {language === 'vi' ? 'Xem Trước Component Podium Top 1-3' : 'Podium 1-3 Component View'}
                  </span>
                </span>
              </div>
              <div className="relative min-h-[220px] bg-[#07080d]/80 rounded-xl border border-white/10 p-4 flex items-center justify-center overflow-hidden">
                <LikeLeaderboardOverlay
                  items={likeLeaderboard}
                  settings={{
                    ...settings,
                    likeLeaderboardX: 0,
                    likeLeaderboardY: 0,
                    likeLeaderboardEnabled: true,
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
