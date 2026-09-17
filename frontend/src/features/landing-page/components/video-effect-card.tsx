'use client';

import { useRef, useState } from 'react';
import ChromaKeyVideo from './chroma-key-video';
import type { LandingVideo } from '../types';

// Interactive Vertical Video Effect Card Component (Clean Vertical Box, No Text)
export default function VideoEffectCard({
  item,
  onOpenModal,
}: {
  item: LandingVideo;
  onOpenModal: (item: LandingVideo) => void;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleMouseEnter = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {});
    }
  };

  const handleMouseLeave = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  return (
    <article
      onClick={() => onOpenModal(item)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="glass-card group relative overflow-hidden rounded-2xl border border-border-color bg-bg-surface transition-all duration-300 hover:-translate-y-1.5 hover:border-secondary/70 hover:shadow-[0_12px_32px_var(--color-secondary-glow)] cursor-pointer"
    >
      {/* Clean Vertical Box (Aspect 9:16) — No text underneath */}
      <div className="relative aspect-[9/16] w-full overflow-hidden bg-black/90 group">
        {item.src.includes('capy_dance') ? (
          <ChromaKeyVideo src={item.src} className="h-full w-full object-cover" />
        ) : (
          <video
            ref={videoRef}
            src={item.src}
            poster={item.poster}
            preload="metadata"
            loop
            muted
            playsInline
            className="h-full w-full object-cover filter drop-shadow-md"
          />
        )}

        {/* Hover Auto-Play Overlay Badge */}
        {!isPlaying && !item.src.includes('capy_dance') && (
          <div className="absolute inset-0 flex items-center justify-center bg-[linear-gradient(180deg,rgba(7,8,13,0.08),rgba(7,8,13,0.45))] transition-opacity duration-300 group-hover:bg-black/10">
            <div className="keep-white flex h-10 w-10 items-center justify-center rounded-full bg-secondary/90 text-black shadow-lg backdrop-blur-md group-hover:scale-110 transition-transform">
              <i className="fa-solid fa-play text-xs ml-0.5" />
            </div>
          </div>
        )}

        {/* Top-left subtle badge tag */}
        <span className="keep-white absolute top-2 left-2 rounded-md bg-black/60 px-2 py-0.5 font-mono text-[0.65rem] font-extrabold text-secondary backdrop-blur-md border border-white/10">
          {item.badge}
        </span>

        {/* Expand icon on hover bottom right */}
        <div className="absolute bottom-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 backdrop-blur-md transition-opacity">
          <i className="fa-solid fa-expand text-xs" />
        </div>
      </div>
    </article>
  );
}
