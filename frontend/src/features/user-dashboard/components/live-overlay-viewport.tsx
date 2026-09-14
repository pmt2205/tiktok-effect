'use client';

import React, { useEffect, useState } from 'react';
import { useAppSelector } from '@/store/hooks';
import { BACKEND_URL } from '@/lib/constants';

interface LiveOverlayViewportProps {
  enabled?: boolean;
  title?: string;
  disabledMessage?: string;
  className?: string;
}

export default function LiveOverlayViewport({
  enabled = true,
  title,
  disabledMessage,
  className = '',
}: LiveOverlayViewportProps) {
  const selectedStreamer = useAppSelector((state) => state.dashboard.selectedStreamer);
  const user = useAppSelector((state) => state.auth.user);
  const language = useAppSelector((state) => state.dashboard.language) || 'vi';

  const streamerUsername = selectedStreamer || user?.username || '';
  const [overlayToken, setOverlayToken] = useState('');

  useEffect(() => {
    const authToken = localStorage.getItem('auth_token');
    if (!streamerUsername || !authToken) return;
    const controller = new AbortController();
    fetch(`${BACKEND_URL}/api/auth/overlay-token?username=${encodeURIComponent(streamerUsername)}`, {
      headers: { Authorization: `Bearer ${authToken}` },
      signal: controller.signal,
    })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error('Unable to create overlay token')))
      .then((data: { accessToken: string }) => setOverlayToken(data.accessToken))
      .catch((error: unknown) => {
        if (!(error instanceof DOMException && error.name === 'AbortError')) console.error(error);
      });
    return () => controller.abort();
  }, [streamerUsername]);
  const defaultTitle = language === 'vi' ? 'Xem Thử Overlay Live (1080x1920 OBS)' : 'Live OBS Overlay Preview';
  const defaultDisabledText = language === 'vi' ? 'Tính Năng Đang Tắt' : 'Feature Disabled';

  return (
    <div className={`flex min-w-0 flex-col gap-3 bg-black/40 border border-border-color/80 rounded-lg sm:rounded-2xl p-2 sm:p-4 backdrop-blur-md relative overflow-hidden items-center ${className}`}>
      {/* Header Bar */}
      <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2.5 w-full select-none">
        <span className="min-w-0 font-header text-[0.75rem] sm:text-[0.85rem] font-bold text-white flex items-center gap-2">
          <i className="fa-solid fa-desktop text-secondary" />
          <span className="truncate">{title || defaultTitle}</span>
        </span>
        <span className="hidden shrink-0 px-2 py-0.5 rounded-md bg-secondary/15 text-secondary text-[0.62rem] font-bold uppercase tracking-wider border border-secondary/30 min-[380px]:block">
          Live Viewport
        </span>
      </div>

      {/* 9:16 Vertical Stream Frame (Scaled 1080x1920 iframe) */}
      <div className="relative aspect-[9/16] w-full max-w-[270px] rounded-lg sm:rounded-2xl overflow-hidden border-2 border-white/15 bg-black/90 shadow-[0_12px_36px_rgba(0,0,0,0.7)] group select-none flex items-center justify-center">
        {/* Grid pattern simulating OBS viewport background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none z-0" />

        {!enabled ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-xs text-text-muted text-[0.78rem] font-semibold gap-2 z-30">
            <i className="fa-solid fa-eye-slash text-3xl text-white/30" />
            <span>{disabledMessage || defaultDisabledText}</span>
          </div>
        ) : (
          <iframe
            key={`${streamerUsername}-${overlayToken}`}
            src={overlayToken ? `/overlay?token=${encodeURIComponent(overlayToken)}` : 'about:blank'}
            className="w-[1080px] h-[1920px] origin-top-left pointer-events-none transform scale-[0.25] border-none absolute top-0 left-0 z-10"
            title="OBS Overlay Live Viewport"
          />
        )}

        {/* Live Badge */}
        <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-black/75 border border-white/10 text-[0.6rem] font-mono text-secondary flex items-center gap-1.5 z-20 select-none">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          <span>LIVE OBS OVERLAY</span>
        </div>

        {/* Bottom Streamer ID Badge */}
        {streamerUsername && (
          <div className="absolute bottom-2 left-2 right-2 px-2.5 py-1 rounded-md bg-black/80 border border-white/10 text-[0.62rem] font-mono text-text-muted select-none flex items-center justify-between z-20">
            <span className="truncate text-white/80">@{streamerUsername}</span>
            <span className="text-secondary font-bold text-[0.58rem] uppercase">1080x1920 (0.25x)</span>
          </div>
        )}
      </div>
    </div>
  );
}
