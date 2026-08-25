'use client';

import React from 'react';
import { Gift } from '@/types';
import { BACKEND_URL } from '@/lib/constants';

interface VideoPresetsModalProps {
  gift: Gift;
  activeVideo: string;
  setActiveVideo: (video: string) => void;
  onClose: () => void;
  language: 'vi' | 'en';
  t: Record<string, string>;
}

export default function VideoPresetsModal({
  gift,
  activeVideo,
  setActiveVideo,
  onClose,
  language,
  t,
}: VideoPresetsModalProps) {
  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-5 bg-black/75 backdrop-blur-sm animate-[fade-in_0.2s_ease-out]">
      <div className="relative w-full max-w-[760px] bg-bg-surface/95 border border-border-color rounded-2xl shadow-[0_12px_48px_rgba(0,0,0,0.6)] p-6 md:p-8 animate-[fade-in-up_0.3s_cubic-bezier(0.175,0.885,0.32,1.275)] flex flex-col md:flex-row gap-6 backdrop-blur-[24px]">

        {/* Left Side: Simulation canvas player */}
        <div className="flex flex-col gap-3.5 items-center md:items-start shrink-0">
          <span className="font-header text-[0.92rem] font-bold text-white tracking-[0.5px] uppercase flex items-center gap-2 select-none">
            <i className="fa-solid fa-play text-secondary" />
            {t.previewPlayerTitle}
          </span>
          <div className="relative w-[280px] h-[360px] rounded-2xl overflow-hidden border border-border-color shadow-[0_8px_32px_rgba(0,0,0,0.5)] bg-black/90 flex items-center justify-center">
            {activeVideo ? (
              <video
                key={activeVideo}
                src={
                  activeVideo.startsWith('http://') || activeVideo.startsWith('https://')
                    ? activeVideo
                    : `${BACKEND_URL}/media/${activeVideo}`
                }
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center p-4 text-text-muted flex flex-col items-center gap-2 select-none animate-pulse">
                <i className="fa-solid fa-video-slash text-[1.8rem] opacity-35" />
                <span className="text-[0.8rem]">{language === 'vi' ? 'Không có video xem trước' : 'No preview video'}</span>
              </div>
            )}
            <div className="absolute top-3.5 left-3.5 bg-black/60 backdrop-blur-md text-[0.68rem] px-2.5 py-0.5 rounded-full border border-white/5 text-text-secondary select-none font-semibold uppercase tracking-[0.5px]">
              LIVE PREVIEW
            </div>
          </div>
        </div>

        {/* Right Side: Configuration settings and preset video list */}
        <div className="flex-1 flex flex-col justify-between">
          <div className="flex flex-col gap-5 select-none">
            <h3 className="font-header text-[1.25rem] font-bold text-white capitalize border-b border-border-color pb-3.5 flex items-center gap-2.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={gift.icon} alt={gift.name} className="w-8.5 h-8.5 object-contain filter drop-shadow-[0_2px_6px_rgba(0,0,0,0.3)]" />
              <span>{gift.name}</span>
            </h3>

            <div className="flex flex-col gap-1 text-[0.85rem]">
              <span className="text-text-secondary font-bold">{t.videosLabel}:</span>
              {gift.videos && gift.videos.length > 0 ? (
                <div className="flex flex-col gap-2 mt-2 max-h-[190px] overflow-y-auto custom-scrollbar pr-1">
                  {gift.videos.map((video) => {
                    const isActive = video === activeVideo;
                    return (
                      <button
                        key={video}
                        onClick={() => setActiveVideo(video)}
                        className={`w-full text-left px-4 py-3 rounded-xl border text-[0.78rem] font-semibold transition-all duration-200 flex items-center justify-between cursor-pointer outline-none active:scale-[0.98] ${isActive
                          ? 'bg-secondary border-secondary text-black shadow-[0_4px_12px_rgba(0,242,254,0.18)] font-bold'
                          : 'bg-black/25 border-border-color text-text-secondary hover:border-white/15 hover:text-white hover:bg-black/35'
                          }`}
                      >
                        <span className="truncate pr-3">{video}</span>
                        {isActive && <span className="text-[0.62rem] font-bold uppercase tracking-[0.5px] px-1.5 py-0.5 rounded bg-black/10 text-black shrink-0">{t.activeBadge}</span>}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <span className="text-text-muted italic text-[0.78rem] mt-1 bg-white/5 border border-white/10 p-4 rounded-xl text-center">{t.noVideos}</span>
              )}
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl font-body text-[0.82rem] font-bold bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-white/20 transition-all duration-200 cursor-pointer outline-none active:scale-[0.96]"
            >
              {t.close}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
