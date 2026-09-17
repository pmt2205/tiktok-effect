'use client';

import React, { useState } from 'react';
import { OverlaySettings, LikeLeaderboardItem } from '@/types';
import Button from '@/components/ui/button';
import LikeLeaderboardOverlay from '@/features/overlay/components/like-leaderboard-overlay';
import LiveOverlayViewport from '@/features/user-dashboard/components/live-overlay-viewport';
import OverlayPreviewControls from '@/features/overlay-designers/components/overlay-preview-controls';

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
  const isEnabled = settings.likeLeaderboardEnabled !== false;
  const [localX, setLocalX] = useState(settings.likeLeaderboardX ?? 78);
  const [localY, setLocalY] = useState(settings.likeLeaderboardY ?? 15);
  const [localScale, setLocalScale] = useState(settings.likeLeaderboardScale ?? 1);

  return (
    <div className="flex flex-col gap-6 w-full animate-[fade-in-up_0.4s_ease-out] glass-card p-6 rounded-2xl border border-border-color bg-bg-card backdrop-blur-2xl">
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

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(360px,480px)_minmax(0,1fr)] items-start">
        {/* Left Column: Controls */}
        <div className="order-2 min-w-0 flex flex-col gap-4">
          {/* Toggle Switch */}
          <div className="flex flex-col gap-2 p-4 rounded-xl bg-bg-input border border-border-color">
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
                <span className="w-11 h-6 bg-white/10 rounded-full relative transition-all border border-border-color after:absolute after:w-4 after:h-4 after:rounded-full after:bg-white after:top-[3px] after:left-[3px] after:transition-all peer-checked:bg-primary peer-checked:after:translate-x-5" />
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
              <div className="flex flex-col gap-2 p-4 rounded-xl bg-bg-input border border-border-color">
                <label className="text-sm font-bold text-white">
                  {language === 'vi' ? 'Tiêu đề BXH:' : 'Leaderboard Title:'}
                </label>
                <input
                  type="text"
                  value={settings.likeLeaderboardTitle || 'BẢNG XẾP HẠNG'}
                  onChange={(e) => onSaveSettings({ likeLeaderboardTitle: e.target.value })}
                  placeholder="BẢNG XẾP HẠNG"
                  className="bg-bg-surface border border-border-color rounded-xl px-3 py-2 text-sm text-white font-body outline-none focus:border-primary"
                />
                <p className="text-xs text-text-muted">
                  {language === 'vi'
                    ? 'Tiêu đề hiển thị ở đầu bảng xếp hạng'
                    : 'Title text shown at the top of leaderboard'}
                </p>
              </div>

              {/* Quick Actions */}
              <div className="flex flex-col gap-2 p-4 rounded-xl bg-bg-input border border-border-color">
                <span className="text-sm font-bold text-white">
                  {language === 'vi' ? 'Hành động nhanh:' : 'Quick Actions:'}
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={onSimulateLike}
                    className="bg-gradient-to-r from-primary to-accent text-white shadow-[0_4px_16px_var(--primary-glow)] hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 py-2"
                  >
                    <i className="fa-solid fa-heart animate-bounce" />
                    <span>
                      {language === 'vi' ? 'Thả Tim Thử (+Tym)' : 'Simulate Like'}
                    </span>
                  </Button>
                  <Button
                    onClick={onResetLikeLeaderboard}
                    className="bg-bg-surface hover:bg-bg-card border border-border-color text-text-main active:scale-[0.98] transition-all flex items-center justify-center gap-2 py-2"
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
        <div className="contents">
          <LiveOverlayViewport
            enabled={isEnabled}
            showHeader={false}
            className="order-1 lg:row-span-2 !border-0 !bg-transparent !p-0 !backdrop-blur-none"
            viewportClassName="max-w-[420px] xl:max-w-[480px]"
            previewTarget="likeLeaderboard"
            previewSettings={{ ...settings, likeLeaderboardX: localX, likeLeaderboardY: localY, likeLeaderboardScale: localScale }}
            interactionLayer={(
              <OverlayPreviewControls
                x={localX}
                y={localY}
                scale={localScale}
                target="likeLeaderboard"
                settingKeys={{ x: 'likeLeaderboardX', y: 'likeLeaderboardY', scale: 'likeLeaderboardScale' }}
                label={language === 'vi' ? 'Kéo để di chuyển' : 'Drag to move'}
                maxScale={2.5}
                onChange={(next) => {
                  setLocalX(next.x);
                  setLocalY(next.y);
                  setLocalScale(next.scale);
                }}
                onCommit={(next) => onSaveSettings({ likeLeaderboardX: next.x, likeLeaderboardY: next.y, likeLeaderboardScale: next.scale })}
              />
            )}
          />
          
          {/* Component Live Demo Preview */}
          {isEnabled && (
            <div className="order-3 relative w-full rounded-2xl bg-bg-surface border border-primary/30 p-4 flex flex-col gap-3 overflow-hidden animate-[fade-in-up_0.25s_ease-out]">
              <div className="flex justify-between items-center text-xs font-bold text-primary uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  <i className="fa-solid fa-eye animate-pulse text-primary" />
                  <span>
                    {language === 'vi' ? 'Xem Trước Component Podium Top 1-3' : 'Podium 1-3 Component View'}
                  </span>
                </span>
              </div>
              <div className="relative min-h-[220px] bg-bg-input rounded-xl border border-border-color p-4 flex items-center justify-center overflow-hidden">
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
