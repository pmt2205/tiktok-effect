'use client';
/* eslint-disable @next/next/no-img-element -- Live TikTok avatar URLs are dynamic and rendered directly in the OBS overlay. */

import React, { useEffect, useState, useRef } from 'react';
import { TopGifterJoinEvent, OverlaySettings } from '@/types';

interface TopGifterOverlayProps {
  eventsQueue: TopGifterJoinEvent[];
  onEventFinished: (uniqueId: string) => void;
  settings: OverlaySettings;
}

export default function TopGifterOverlay({ eventsQueue, onEventFinished, settings }: TopGifterOverlayProps) {
  const [activeEvent, setActiveEvent] = useState<TopGifterJoinEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const onEventFinishedRef = useRef(onEventFinished);
  const alertRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    onEventFinishedRef.current = onEventFinished;
  }, [onEventFinished]);

  useEffect(() => {
    const alert = alertRef.current;
    if (!alert || window.parent === window) return;
    const reportBounds = () => {
      window.parent.postMessage(
        { type: 'overlay-preview-target-bounds', target: 'topGifter', width: alert.offsetWidth, height: alert.offsetHeight },
        window.location.origin,
      );
    };
    const observer = new ResizeObserver(reportBounds);
    observer.observe(alert);
    reportBounds();
    return () => observer.disconnect();
  }, [activeEvent]);

  // 1. Pick next event from queue when idle
  useEffect(() => {
    if (!activeEvent && eventsQueue.length > 0) {
      const next = eventsQueue[0];
      const activation = setTimeout(() => {
        setActiveEvent(next);
        setIsVisible(true);
      }, 0);
      return () => clearTimeout(activation);
    }
  }, [eventsQueue, activeEvent]);

  // 2. Start timer when activeEvent is set
  useEffect(() => {
    if (!activeEvent) return;

    const displayDuration = (settings.topGifterDuration !== undefined && settings.topGifterDuration > 0)
      ? settings.topGifterDuration
      : 4;
    const durationMs = displayDuration * 1000;
    const currentUniqueId = activeEvent.uniqueId;

    const timer = setTimeout(() => {
      setIsVisible(false);
      const finishTimer = setTimeout(() => {
        setActiveEvent(null);
        onEventFinishedRef.current(currentUniqueId);
      }, 400); // smooth fade out transition
      return () => clearTimeout(finishTimer);
    }, durationMs);

    return () => clearTimeout(timer);
  }, [activeEvent, settings.topGifterDuration]);

  if (!activeEvent || settings.topGifterEnabled === false) return null;

  const avatarSrc = activeEvent.profilePictureUrl || 'https://www.tiktok.com/favicon.ico';
  const rankText = activeEvent.rank > 0 ? `TOP ${activeEvent.rank} GIFTER` : 'VIP GIFTER';

  return (
    <div
      ref={alertRef}
      data-overlay-preview-target="topGifter"
      className="absolute z-50 pointer-events-none"
      style={{
        left: `${settings.topGifterX ?? 28}%`,
        top: `${settings.topGifterY ?? 2}%`,
        transform: `scale(${settings.topGifterScale ?? 1})`,
        transformOrigin: 'top left',
      }}
    >
      <div className={`relative flex items-center gap-4 px-6 py-4 rounded-2xl bg-[#0d0f18]/85 backdrop-blur-2xl border border-[#00f2fe]/40 shadow-[0_0_35px_rgba(0,242,254,0.3)] overflow-hidden transition-all duration-500 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
        {/* Neon Accent Glow Line */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#ff0050] via-[#00f2fe] to-[#ff0050]" />

        {/* Glowing Circular Avatar with Crown */}
        <div className="relative flex-shrink-0">
          <div className="absolute -top-4 -left-1 text-2xl z-10 filter drop-shadow-[0_2px_8px_rgba(255,215,0,0.8)] animate-bounce">
            👑
          </div>
          <div className="w-16 h-16 rounded-full p-[2px] bg-gradient-to-tr from-[#ff0050] to-[#00f2fe] shadow-[0_0_20px_rgba(255,0,80,0.5)]">
            <img
              src={avatarSrc}
              alt={activeEvent.nickname}
              className="w-full h-full object-cover rounded-full bg-[#07080d]"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://i.pravatar.cc/150?u=' + activeEvent.uniqueId;
              }}
            />
          </div>
        </div>

        {/* User Info & Badge */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-gradient-to-r from-[#ff0050] to-[#d0003c] text-white tracking-wider uppercase shadow-[0_2px_10px_rgba(255,0,80,0.4)]">
              {rankText}
            </span>
            {activeEvent.totalDiamonds > 0 && (
              <span className="text-xs text-[#00f2fe] font-mono font-semibold flex items-center gap-1">
                💎 {activeEvent.totalDiamonds.toLocaleString()} xu
              </span>
            )}
          </div>
          <h4 className="font-header text-lg font-extrabold text-white tracking-wide mt-1 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            {activeEvent.nickname}
          </h4>
          <p className="text-xs text-gray-300 font-medium">
            Vừa tham gia livestream! 🎉
          </p>
        </div>
      </div>
    </div>
  );
}
