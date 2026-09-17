'use client';

import { useEffect, useRef } from 'react';

// Real-Time Green Screen / Chroma Key Video Component (Removes Green Screen Completely!)
export default function ChromaKeyVideo({
  src,
  className = '',
}: {
  src: string;
  className?: string;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    let animId: number;

    const processFrame = () => {
      if (video && !video.paused && !video.ended && video.readyState >= 2) {
        const vw = video.videoWidth || 300;
        const vh = video.videoHeight || 300;

        if (canvas.width !== vw || canvas.height !== vh) {
          canvas.width = vw;
          canvas.height = vh;
        }

        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (ctx) {
          ctx.drawImage(video, 0, 0, vw, vh);
          const frame = ctx.getImageData(0, 0, vw, vh);
          const d = frame.data;
          const len = d.length;

          for (let i = 0; i < len; i += 4) {
            const r = d[i];
            const g = d[i + 1];
            const b = d[i + 2];

            // Green Screen removal threshold:
            // Green is dominant: g > 60 and g > r * 1.05 and g > b * 1.08
            if (g > 60 && g > r * 1.05 && g > b * 1.08) {
              d[i + 3] = 0; // Set Alpha = 0 (100% Transparent)
            } else if (g > 45 && g > r && g > b) {
              const diff = g - Math.max(r, b);
              if (diff > 5) {
                d[i + 3] = Math.max(0, 255 - diff * 4);
              }
            }
          }
          ctx.putImageData(frame, 0, 0);
        }
      }
      animId = requestAnimationFrame(processFrame);
    };

    const tryPlay = () => {
      if (video) {
        video.play().catch(() => {});
      }
    };

    tryPlay();
    animId = requestAnimationFrame(processFrame);

    video.addEventListener('loadeddata', tryPlay);
    video.addEventListener('canplay', tryPlay);

    return () => {
      video.removeEventListener('loadeddata', tryPlay);
      video.removeEventListener('canplay', tryPlay);
      cancelAnimationFrame(animId);
    };
  }, [src]);

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* Video is opacity-0 (not display:none) so browser continuously decodes frames */}
      <video
        ref={videoRef}
        src={src}
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 h-full w-full object-contain opacity-0 pointer-events-none"
      />
      <canvas ref={canvasRef} className="relative z-10 h-full w-full object-contain" />
    </div>
  );
}

