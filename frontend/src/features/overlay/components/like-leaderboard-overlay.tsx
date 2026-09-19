'use client';
/* eslint-disable @next/next/no-img-element -- Live TikTok avatar URLs are dynamic and rendered directly in the OBS overlay. */

import React, { useEffect, useRef } from 'react';
import { OverlaySettings, LikeLeaderboardItem } from '@/types';
import { formatNumber } from '@/lib/constants';

function HeartIcon({ className = 'w-3.5 h-3.5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  );
}

interface LikeLeaderboardOverlayProps {
  settings: OverlaySettings;
  items: LikeLeaderboardItem[];
}

export default function LikeLeaderboardOverlay({ settings, items }: LikeLeaderboardOverlayProps) {
  const leaderboardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const leaderboard = leaderboardRef.current;
    if (!leaderboard || window.parent === window || !settings.likeLeaderboardEnabled) return;
    const reportBounds = () => {
      window.parent.postMessage(
        { type: 'overlay-preview-target-bounds', target: 'likeLeaderboard', width: leaderboard.offsetWidth, height: leaderboard.offsetHeight },
        window.location.origin,
      );
    };
    const observer = new ResizeObserver(reportBounds);
    observer.observe(leaderboard);
    reportBounds();
    return () => observer.disconnect();
  }, [settings.likeLeaderboardEnabled, settings.likeLeaderboardTitle, items.length]);

  if (!settings.likeLeaderboardEnabled) {
    return null;
  }

  const posX = settings.likeLeaderboardX ?? 78;
  const posY = settings.likeLeaderboardY ?? 15;
  const scale = settings.likeLeaderboardScale ?? 1.0;
  const title = settings.likeLeaderboardTitle || 'BẢNG XẾP HẠNG';

  // Map Top 1, Top 2, Top 3 for Podium layout
  const top1 = items[0] || null;
  const top2 = items[1] || null;
  const top3 = items[2] || null;

  return (
    <div
      ref={leaderboardRef}
      data-overlay-preview-target="likeLeaderboard"
      className="absolute z-20 pointer-events-none select-none"
      style={{
        left: `${posX}%`,
        top: `${posY}%`,
        transform: `scale(${scale})`,
        transformOrigin: 'top left',
      }}
    >
      <div
        className="w-[360px] rounded-3xl p-5 border border-[#ff0050]/30 bg-[rgba(13,15,24,0.85)] backdrop-blur-[24px] shadow-[0_12px_40px_rgba(0,0,0,0.6)] flex flex-col items-center gap-4 text-white overflow-hidden relative"
        style={{
          boxShadow: '0 12px 40px 0 rgba(0,0,0,0.6), inset 0 0 30px rgba(255, 0, 80, 0.1)',
        }}
      >
        {/* Glow Top Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#ff0050] via-[#00f2fe] to-[#ff0050]" />

        {/* Header Title */}
        <div className="flex items-center justify-center gap-2 pt-1">
          <span className="text-lg">🏆</span>
          <h3
            className="font-header font-black text-base tracking-wider uppercase bg-gradient-to-r from-white via-pink-100 to-slate-200 bg-clip-text text-transparent drop-shadow-[0_2px_8px_rgba(255,0,80,0.4)]"
            style={{ fontFamily: 'var(--font-header), Space Grotesk, sans-serif' }}
          >
            {title}
          </h3>
        </div>

        {/* Podium Layout: #2 (Left), #1 (Center), #3 (Right) */}
        <div className="w-full flex items-end justify-center gap-2.5 pt-2 pb-1">
          {/* TOP 2 CARD (LEFT) */}
          <div className="flex-1 flex flex-col items-center justify-between h-[155px] p-3 rounded-2xl border border-pink-500/30 bg-gradient-to-b from-[#1c0c2a]/90 to-[#0e0618]/90 backdrop-blur-md relative overflow-hidden shadow-[0_4px_16px_rgba(0,0,0,0.4)]">
            <span className="text-xs font-black text-pink-400 tracking-wider">#2</span>
            
            <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-pink-400 shadow-[0_0_10px_rgba(244,114,182,0.4)] bg-slate-900 my-1">
              {top2 ? (
                <img
                  src={top2.profilePictureUrl || `https://i.pravatar.cc/100?u=${top2.uniqueId}`}
                  alt={top2.nickname}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://i.pravatar.cc/100';
                  }}
                />
              ) : (
                <div className="w-full h-full bg-slate-800/80 flex items-center justify-center text-slate-500 text-xs font-bold">
                  ?
                </div>
              )}
            </div>

            <div className="w-full flex flex-col items-center gap-0.5 text-center min-w-0">
              <span className="text-[11px] font-bold text-white truncate max-w-full px-1" title={top2?.nickname || '---'}>
                {top2 ? top2.nickname : 'Chờ thả tim...'}
              </span>
              <div className="flex items-center gap-1 text-[11px] font-bold text-pink-400 font-mono">
                <span>{top2 ? formatNumber(top2.totalLikes) : '0'}</span>
                <HeartIcon className="w-3 h-3 fill-pink-500 text-pink-500" />
              </div>
            </div>
          </div>

          {/* TOP 1 CARD (CENTER - MAIN WINNER) */}
          <div className="flex-1 flex flex-col items-center justify-between h-[185px] p-3 rounded-2xl border-2 border-[#ff0050] bg-gradient-to-b from-[#350824]/95 to-[#160312]/95 backdrop-blur-md relative overflow-hidden shadow-[0_0_24px_rgba(255,0,80,0.45)] transform -translate-y-1">
            {/* Crown & #1 Header */}
            <div className="flex flex-col items-center gap-0">
              <span className="text-base leading-none animate-bounce" style={{ animationDuration: '2s' }}>👑</span>
              <span className="text-xs font-black text-[#ff0050] tracking-widest drop-shadow-[0_0_6px_rgba(255,0,80,0.8)]">#1</span>
            </div>

            {/* Avatar */}
            <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-[#ff0050] shadow-[0_0_16px_rgba(255,0,80,0.7)] bg-slate-900 my-0.5">
              {top1 ? (
                <img
                  src={top1.profilePictureUrl || `https://i.pravatar.cc/100?u=${top1.uniqueId}`}
                  alt={top1.nickname}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://i.pravatar.cc/100';
                  }}
                />
              ) : (
                <div className="w-full h-full bg-slate-800/80 flex items-center justify-center text-slate-500 text-xs font-bold">
                  ?
                </div>
              )}
            </div>

            {/* Nickname & Likes */}
            <div className="w-full flex flex-col items-center gap-0.5 text-center min-w-0">
              <span className="text-xs font-black text-white truncate max-w-full px-1 drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]" title={top1?.nickname || '---'}>
                {top1 ? top1.nickname : 'Chờ thả tim...'}
              </span>
              <div className="flex items-center gap-1 text-xs font-extrabold text-[#ff0050] font-mono bg-[#ff0050]/15 px-2 py-0.5 rounded-full border border-[#ff0050]/30 shadow-[0_0_8px_rgba(255,0,80,0.3)]">
                <span>{top1 ? formatNumber(top1.totalLikes) : '0'}</span>
                <HeartIcon className="w-3.5 h-3.5 fill-[#ff0050] text-[#ff0050]" />
              </div>
            </div>
          </div>

          {/* TOP 3 CARD (RIGHT) */}
          <div className="flex-1 flex flex-col items-center justify-between h-[155px] p-3 rounded-2xl border border-purple-500/30 bg-gradient-to-b from-[#1a0a28]/90 to-[#0c0516]/90 backdrop-blur-md relative overflow-hidden shadow-[0_4px_16px_rgba(0,0,0,0.4)]">
            <span className="text-xs font-black text-purple-300 tracking-wider">#3</span>

            <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-purple-400 shadow-[0_0_10px_rgba(192,132,252,0.3)] bg-slate-900 my-1">
              {top3 ? (
                <img
                  src={top3.profilePictureUrl || `https://i.pravatar.cc/100?u=${top3.uniqueId}`}
                  alt={top3.nickname}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://i.pravatar.cc/100';
                  }}
                />
              ) : (
                <div className="w-full h-full bg-slate-800/80 flex items-center justify-center text-slate-500 text-xs font-bold">
                  ?
                </div>
              )}
            </div>

            <div className="w-full flex flex-col items-center gap-0.5 text-center min-w-0">
              <span className="text-[11px] font-bold text-white truncate max-w-full px-1" title={top3?.nickname || '---'}>
                {top3 ? top3.nickname : 'Chờ thả tim...'}
              </span>
              <div className="flex items-center gap-1 text-[11px] font-bold text-purple-300 font-mono">
                <span>{top3 ? formatNumber(top3.totalLikes) : '0'}</span>
                <HeartIcon className="w-3 h-3 fill-purple-400 text-purple-400" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
