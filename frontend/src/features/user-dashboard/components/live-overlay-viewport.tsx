'use client';

import React, { ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { useAppSelector } from '@/store/hooks';
import { BACKEND_URL } from '@/lib/constants';
import type { OverlaySettings } from '@/types';

interface LiveOverlayViewportProps {
  enabled?: boolean;
  title?: string;
  disabledMessage?: string;
  className?: string;
  viewportClassName?: string;
  showHeader?: boolean;
  previewSettings?: Partial<OverlaySettings>;
  previewTarget?: 'menu' | 'jar' | 'tree' | 'topGifter' | 'likeLeaderboard';
  interactionLayer?: ReactNode;
}

export default function LiveOverlayViewport({
  enabled = true,
  title,
  disabledMessage,
  className = '',
  viewportClassName = '',
  showHeader = true,
  previewSettings,
  previewTarget = 'menu',
  interactionLayer,
}: LiveOverlayViewportProps) {
  const selectedStreamer = useAppSelector((state) => state.dashboard.selectedStreamer);
  const user = useAppSelector((state) => state.auth.user);
  const language = useAppSelector((state) => state.dashboard.language) || 'vi';

  const streamerUsername = selectedStreamer || user?.username || '';
  const [overlayToken, setOverlayToken] = useState('');
  const [previewTargetBounds, setPreviewTargetBounds] = useState<{ width: number; height: number } | null>(null);
  const [viewportScale, setViewportScale] = useState(0.25);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const previewObjectScale = previewTarget === 'jar'
    ? (previewSettings?.jarScale ?? 1)
    : previewTarget === 'tree'
      ? (previewSettings?.treeScale ?? 1)
      : previewTarget === 'topGifter'
        ? (previewSettings?.topGifterScale ?? 1)
        : previewTarget === 'likeLeaderboard'
          ? (previewSettings?.likeLeaderboardScale ?? 1)
          : (previewSettings?.menuScale ?? 1);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const updateScale = () => setViewportScale(viewport.clientWidth / 1080);
    const observer = new ResizeObserver(updateScale);
    observer.observe(viewport);
    return () => observer.disconnect();
  }, []);

  const syncPreviewSettings = useCallback(() => {
    if (!previewSettings) return;
    iframeRef.current?.contentWindow?.postMessage(
      { type: 'overlay-preview-settings', settings: previewSettings },
      window.location.origin,
    );
  }, [previewSettings]);

  useEffect(() => {
    syncPreviewSettings();
  }, [syncPreviewSettings]);

  useEffect(() => {
    const handleTargetBounds = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || event.source !== iframeRef.current?.contentWindow) return;
      if (event.data?.type === 'overlay-preview-ready') {
        syncPreviewSettings();
        return;
      }
      if (event.data?.type !== 'overlay-preview-target-bounds' || event.data.target !== previewTarget) return;
      setPreviewTargetBounds({ width: event.data.width, height: event.data.height });
    };
    window.addEventListener('message', handleTargetBounds);
    return () => window.removeEventListener('message', handleTargetBounds);
  }, [previewTarget, syncPreviewSettings]);

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
      {showHeader && <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2.5 w-full select-none">
        <span className="min-w-0 font-header text-[0.75rem] sm:text-[0.85rem] font-bold text-white flex items-center gap-2">
          <i className="fa-solid fa-desktop text-secondary" />
          <span className="truncate">{title || defaultTitle}</span>
        </span>
        <span className="hidden shrink-0 px-2 py-0.5 rounded-md bg-secondary/15 text-secondary text-[0.62rem] font-bold uppercase tracking-wider border border-secondary/30 min-[380px]:block">
          Live Viewport
        </span>
      </div>}

      {/* 9:16 Vertical Stream Frame (Scaled 1080x1920 iframe) */}
      <div ref={viewportRef} className={`relative aspect-[9/16] w-full max-w-[270px] rounded-lg sm:rounded-2xl overflow-hidden border-2 border-white/15 bg-black/90 shadow-[0_12px_36px_rgba(0,0,0,0.7)] group select-none flex items-center justify-center ${viewportClassName}`}>
        {/* Grid pattern simulating OBS viewport background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none z-0" />

        {!enabled ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-xs text-text-muted text-[0.78rem] font-semibold gap-2 z-30">
            <i className="fa-solid fa-eye-slash text-3xl text-white/30" />
            <span>{disabledMessage || defaultDisabledText}</span>
          </div>
        ) : (
          <iframe
            ref={iframeRef}
            key={`${streamerUsername}-${overlayToken}`}
            src={overlayToken ? `/overlay?token=${encodeURIComponent(overlayToken)}` : 'about:blank'}
            className="w-[1080px] h-[1920px] origin-top-left pointer-events-none border-none absolute top-0 left-0 z-10"
            style={{ transform: `scale(${viewportScale})` }}
            title="OBS Overlay Live Viewport"
            onLoad={syncPreviewSettings}
          />
        )}

        {enabled && interactionLayer && (
          <div
            className="absolute inset-0 z-30 touch-none"
            data-preview-bounds-ready={previewTargetBounds ? 'true' : 'false'}
            style={{
              '--preview-target-width': previewTargetBounds ? `${previewTargetBounds.width * previewObjectScale * viewportScale}px` : '88px',
              '--preview-target-height': previewTargetBounds ? `${previewTargetBounds.height * previewObjectScale * viewportScale}px` : '112px',
            } as React.CSSProperties}
          >
            {interactionLayer}
          </div>
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
            <span className="text-secondary font-bold text-[0.58rem] uppercase">1080x1920 ({viewportScale.toFixed(2)}x)</span>
          </div>
        )}
      </div>
    </div>
  );
}
