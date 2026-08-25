'use client';

import React from 'react';
import { Gift } from '@/types';
import { BACKEND_URL } from '@/lib/constants';

interface NpcPreviewModalProps {
  gift: Gift;
  onClose: () => void;
  language: 'vi' | 'en';
  t: Record<string, string>;
}

export default function NpcPreviewModal({
  gift,
  onClose,
  language,
  t,
}: NpcPreviewModalProps) {
  const activeVid = gift.activeVideo || (gift.videos && gift.videos[0]) || '';
  const hasVideo = gift.videos && gift.videos.length > 0 && activeVid;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-5 bg-black/75 backdrop-blur-sm animate-[fade-in_0.2s_ease-out]">
      <div className="relative w-full max-w-[680px] bg-bg-surface/95 border border-border-color rounded-2xl shadow-[0_12px_48px_rgba(0,0,0,0.6)] p-6 md:p-8 animate-[fade-in-up_0.3s_cubic-bezier(0.175,0.885,0.32,1.275)] flex flex-col md:flex-row gap-6 backdrop-blur-[24px]">

        {/* Left Side: Video Preview Player */}
        {hasVideo ? (
          <div className="flex flex-col gap-3.5 items-center md:items-start shrink-0">
            <span className="font-header text-[0.92rem] font-bold text-white tracking-[0.5px] uppercase flex items-center gap-2 select-none">
              <i className="fa-solid fa-play text-primary" />
              {language === 'vi' ? 'Trình phát xem trước' : 'Preview Player'}
            </span>
            <div className="relative w-[240px] h-[320px] rounded-2xl overflow-hidden border border-border-color shadow-[0_8px_32px_rgba(0,0,0,0.5)] bg-black/90 flex items-center justify-center">
              <video
                src={`${BACKEND_URL}/media/${activeVid}`}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3.5 left-3.5 bg-black/60 backdrop-blur-md text-[0.62rem] px-2.5 py-0.5 rounded-full border border-white/5 text-primary select-none font-semibold uppercase tracking-[0.5px]">
                NPC DEMO
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3.5 items-center justify-center shrink-0 w-[240px] h-[320px] bg-black/30 border border-border-color rounded-2xl">
            <i className="fa-solid fa-wand-magic-sparkles text-[2.5rem] text-primary animate-pulse" />
            <span className="text-[0.8rem] text-text-muted select-none mt-2 font-semibold">
              {language === 'vi' ? 'Không có video' : 'No video'}
            </span>
          </div>
        )}

        {/* Right Side: Read-only info */}
        <div className="flex-1 flex flex-col justify-between">
          <div className="flex flex-col gap-4">
            <h3 className="font-header text-[1.25rem] font-bold text-white capitalize border-b border-border-color pb-3.5 select-none flex items-center gap-2.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={gift.icon} alt={gift.name} className="w-8.5 h-8.5 object-contain filter drop-shadow-[0_2px_6px_rgba(0,0,0,0.3)]" />
              <span className="truncate">Demo NPC: {gift.name}</span>
            </h3>

            <div className="flex flex-col gap-3.5 text-[0.88rem]">
              <div className="flex justify-between border-b border-border-color/30 pb-2">
                <span className="text-text-muted">{language === 'vi' ? 'ID quà tặng:' : 'Gift ID:'}</span>
                <span className="text-white font-bold">{gift.giftId}</span>
              </div>
              <div className="flex justify-between border-b border-border-color/30 pb-2">
                <span className="text-text-muted">{language === 'vi' ? 'Giá trị xu:' : 'Coins value:'}</span>
                <span className="text-secondary font-bold">⚡ {gift.coins} coins</span>
              </div>
              {hasVideo && (
                <div className="flex justify-between border-b border-border-color/30 pb-2">
                  <span className="text-text-muted">{language === 'vi' ? 'Video chỉ định:' : 'Assigned Video:'}</span>
                  <span className="text-primary font-mono font-bold truncate max-w-[160px]">{activeVid}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl font-body text-[0.82rem] font-bold bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all duration-200 cursor-pointer outline-none active:scale-[0.96]"
            >
              {t.close}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
