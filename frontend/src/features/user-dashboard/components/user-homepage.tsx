import React, { useRef, useEffect } from 'react';
import { useUserEffects } from '../hooks/use-user-effects';
import { Gift } from '@/types';
import { BACKEND_URL } from '@/lib/constants';
import ConnectionPanel from '@/features/admin-dashboard/components/connection-panel';
import LogsPanel from '@/features/admin-dashboard/components/logs-panel';

export default function UserHomepage({
  onConnect,
  onDisconnect,
}: {
  onConnect: (username: string) => void;
  onDisconnect: () => void;
}) {
  const {
    language,
    customGifts,
    selectedGift,
    activeVideo,
    openPreview,
    closePreview,
    selectVideo,
    t,
  } = useUserEffects();

  return (
    <div className="w-full max-w-[1360px] mx-auto px-4 py-4 md:px-6 animate-[fade-in-up_0.6s_ease-out]" id="effects-section">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_2.4fr] gap-8 items-start">
        {/* Left Column: Stream Connector, Gift Jar & Live Chat Logs Feed */}
        <div className="flex flex-col gap-6">
          <ConnectionPanel onConnect={onConnect} onDisconnect={onDisconnect} t={t} />
          <LogsPanel t={t} />
        </div>

        {/* Right Column: Dynamic Gifts Catalog */}
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-5">
            {customGifts.map((gift) => {
              const hasVideos = gift.videos && gift.videos.length > 0;
              
              return (
                <div
                  key={gift.giftId}
                  onClick={() => openPreview(gift)}
                  className="aspect-[9/16] w-full max-w-[210px] mx-auto rounded-xl overflow-hidden relative group cursor-pointer border border-border-color bg-[#0c0f18]/80 backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.3)] transition-all duration-300 hover:border-secondary hover:shadow-[0_0_15px_var(--color-secondary-glow)] hover:-translate-y-1"
                >
                  {/* Top Row: Coin Count Badge */}
                  <div className="absolute top-3 right-3 z-10 px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/5 text-[0.7rem] font-semibold text-secondary flex items-center gap-1 select-none">
                    <span>⚡</span>
                    <span>{gift.coins} {t.coins}</span>
                  </div>

                  {/* Decorative star background */}
                  <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.06)_1px,_transparent_1.5px)] bg-[size:16px_16px] bg-[position:0_0] z-0 pointer-events-none" />

                  {/* Card Center: Gift Image Floating */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-4 z-10">
                    <div className="relative w-18 h-18 mb-4 transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6 flex items-center justify-center select-none filter drop-shadow-[0_0_8px_rgba(0,242,254,0.15)]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={gift.icon} alt={gift.name} className="w-full h-full object-contain animate-gift-bob" />
                    </div>
                  </div>

                  {/* Card Bottom: Gift Name Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10 flex flex-col items-center">
                    <span className="font-header text-[0.9rem] font-bold text-white tracking-[0.5px] uppercase select-none text-center truncate w-full">
                      {gift.name}
                    </span>
                    
                    {/* Active effect badge */}
                    {hasVideos ? (
                      <span className="text-[0.62rem] text-secondary font-semibold mt-1 px-1.5 py-0.5 rounded-sm bg-secondary/10 border border-secondary/15 truncate max-w-full">
                        {language === 'vi' ? 'Đang dùng: ' : 'Active: '}
                        {gift.activeVideo || gift.videos[0]}
                      </span>
                    ) : (
                      <span className="text-[0.62rem] text-text-muted mt-1 px-1.5 py-0.5 rounded-sm bg-white/5 border border-white/10 select-none">
                        {t.noMapping}
                      </span>
                    )}
                  </div>

                  {/* Hover Slide Up Play Overlay */}
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-black shadow-[0_0_12px_var(--color-secondary-glow)] transform scale-90 group-hover:scale-100 transition-transform duration-300">
                      <i className="fa-solid fa-play text-[0.9rem] ml-0.5" />
                    </div>
                    <span className="text-[0.7rem] font-bold tracking-[1.5px] text-white uppercase">{t.preview}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Video Presets Modal */}
      {selectedGift && (
        <VideoPresetsModal 
          gift={selectedGift} 
          activeVideo={activeVideo}
          setActiveVideo={selectVideo}
          onClose={closePreview} 
          language={language}
          t={t}
        />
      )}
    </div>
  );
}

// Modal displaying all configured videos with a mock interactive canvas player
function VideoPresetsModal({
  gift,
  activeVideo,
  setActiveVideo,
  onClose,
  language,
  t,
}: {
  gift: Gift;
  activeVideo: string;
  setActiveVideo: (video: string) => void;
  onClose: () => void;
  language: 'vi' | 'en';
  t: Record<string, string>;
}) {
  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-5 bg-black/75 backdrop-blur-sm animate-[fade-in_0.2s_ease-out]">
      <div className="relative w-full max-w-[760px] bg-bg-surface border border-border-color rounded-2xl shadow-[0_12px_48px_rgba(0,0,0,0.6)] p-6 md:p-8 animate-[fade-in-up_0.3s_cubic-bezier(0.175,0.885,0.32,1.275)] flex flex-col md:flex-row gap-6">
        
        {/* Left Side: Simulation canvas player */}
        <div className="flex flex-col gap-3.5 items-center md:items-start shrink-0">
          <span className="font-header text-[0.92rem] font-bold text-white tracking-[0.5px] uppercase flex items-center gap-2 select-none">
            <i className="fa-solid fa-play text-secondary" />
            {t.previewPlayerTitle}
          </span>
          <div className="relative w-[280px] h-[360px] rounded-xl overflow-hidden border border-border-color shadow-[0_0_15px_rgba(0,0,0,0.4)] bg-black/80 flex items-center justify-center">
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
              <div className="text-center p-4 text-text-muted flex flex-col items-center gap-2 select-none">
                <i className="fa-solid fa-video-slash text-[1.6rem] opacity-35" />
                <span className="text-[0.8rem]">{language === 'vi' ? 'Không có video xem trước' : 'No preview video'}</span>
              </div>
            )}
            <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-[0.68rem] px-2.5 py-0.5 rounded-full border border-white/5 text-text-secondary select-none font-semibold uppercase">
              LIVE PREVIEW
            </div>
          </div>
        </div>

        {/* Right Side: Configuration settings and preset video list */}
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <h3 className="font-header text-[1.35rem] font-bold text-white capitalize mb-2 border-b border-border-color pb-3 select-none flex items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={gift.icon} alt={gift.name} className="w-8 h-8 object-contain" />
              <span>{gift.name}</span>
            </h3>

            {/* Config parameters */}
            <div className="flex flex-col gap-2.5 bg-black/15 border border-border-color rounded-md p-3.5 mt-3">
              <span className="font-header text-[0.75rem] font-bold tracking-[1.5px] uppercase text-text-muted select-none">{t.activeConfig}</span>
              <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-[0.82rem] font-body mt-1">
                <span className="text-text-secondary">{t.effectType}:</span>
                <span className="text-secondary font-semibold">
                  Green Screen Video (MP4)
                </span>
                <span className="text-text-secondary">{t.status}:</span>
                <span className="text-success font-semibold flex items-center gap-1.5 select-none">
                  <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                  ACTIVE
                </span>
              </div>
            </div>

            {/* Uploaded Videos list */}
            <div className="mt-5">
              <span className="font-header text-[0.75rem] font-bold tracking-[1.5px] uppercase text-text-muted select-none block mb-2">{t.presetVideos}</span>
              <div className="flex flex-col gap-2 max-h-[160px] overflow-y-auto pr-1 custom-scrollbar">
                {gift.videos && gift.videos.length > 0 ? (
                  gift.videos.map((video) => {
                    const isActive = activeVideo === video;
                    return (
                      <div 
                        key={video}
                        onClick={() => setActiveVideo(video)}
                        className={`flex justify-between items-center p-2.5 rounded-sm border cursor-pointer transition-all duration-150 ${
                          isActive 
                            ? 'border-secondary/50 bg-secondary/8 text-secondary shadow-[0_0_8px_rgba(0,242,254,0.12)]' 
                            : 'border-border-color bg-black/20 text-text-secondary hover:border-white/12'
                        }`}
                      >
                        <div className="flex items-center gap-2 max-w-[220px] truncate">
                          <i className={`fa-solid ${isActive ? 'fa-circle-check text-secondary' : 'fa-film text-text-muted'} text-[0.85rem]`} />
                          <span className={`text-[0.82rem] truncate ${isActive ? 'font-semibold' : ''}`}>{video}</span>
                        </div>
                        <span className={`text-[0.62rem] select-none ${isActive ? 'text-secondary/80 font-semibold' : 'text-text-muted'}`}>
                          {isActive ? (language === 'vi' ? 'Đang dùng' : 'Active') : 'MP4 Video'}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <span className="text-[0.82rem] text-text-muted italic select-none">
                    {t.noMapping}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Close button */}
          <div className="mt-6 flex justify-end">
            <button 
              onClick={onClose}
              className="px-5 py-2.5 rounded-md font-body text-[0.82rem] font-semibold bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-white/20 transition-all duration-200 cursor-pointer outline-none active:scale-95"
            >
              {t.close}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
