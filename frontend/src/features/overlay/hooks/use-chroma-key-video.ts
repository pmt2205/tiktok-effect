'use client';

import { RefObject, useEffect } from 'react';

export function useChromaKeyVideo(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  src: string,
  enabled: boolean,
  intervalSeconds = 0,
) {
  useEffect(() => {
    if (!enabled) return;

    const video = document.createElement('video');
    const displayCanvas = canvasRef.current;
    video.src = src;
    video.loop = false;
    video.muted = true;
    video.playsInline = true;
    video.crossOrigin = 'anonymous';

    const chromaCanvas = document.createElement('canvas');
    const chromaContext = chromaCanvas.getContext('2d', { willReadFrequently: true });
    let animationFrame = 0;
    let intervalTimer: ReturnType<typeof setTimeout> | undefined;
    let running = false;

    const clearDisplay = () => {
      displayCanvas?.getContext('2d')?.clearRect(0, 0, displayCanvas.width, displayCanvas.height);
    };

    const renderFrame = () => {
      if (video.readyState >= 2 && displayCanvas && chromaContext) {
        const sourceWidth = video.videoWidth || 512;
        const sourceHeight = video.videoHeight || 512;
        const renderScale = Math.min(1, 640 / sourceWidth);
        const width = Math.max(1, Math.round(sourceWidth * renderScale));
        const height = Math.max(1, Math.round(sourceHeight * renderScale));
        if (chromaCanvas.width !== width || chromaCanvas.height !== height) {
          chromaCanvas.width = width;
          chromaCanvas.height = height;
          displayCanvas.width = width;
          displayCanvas.height = height;
        }

        chromaContext.drawImage(video, 0, 0, width, height);
        const frame = chromaContext.getImageData(0, 0, width, height);
        const pixels = frame.data;
        for (let index = 0; index < pixels.length; index += 4) {
          const red = pixels[index];
          const green = pixels[index + 1];
          const blue = pixels[index + 2];
          if (green > 100 && green > red * 1.3 && green > blue * 1.3) {
            pixels[index + 3] = 0;
          } else if (green > 80 && green > red * 1.1 && green > blue * 1.1) {
            const neutralGreen = Math.max(red, blue);
            const spill = green - neutralGreen;
            pixels[index + 1] = neutralGreen;
            pixels[index + 3] = Math.floor(Math.max(0, 1 - spill / 40) * 255);
          }
        }

        chromaContext.putImageData(frame, 0, 0);
        const displayContext = displayCanvas.getContext('2d');
        displayContext?.clearRect(0, 0, width, height);
        displayContext?.drawImage(chromaCanvas, 0, 0);
      }
      if (running) animationFrame = requestAnimationFrame(renderFrame);
    };

    const start = () => {
      running = true;
      video.currentTime = 0;
      void video.play().catch(() => undefined);
      animationFrame = requestAnimationFrame(renderFrame);
    };

    const handleEnded = () => {
      running = false;
      cancelAnimationFrame(animationFrame);
      clearDisplay();
      intervalTimer = setTimeout(start, Math.max(0, intervalSeconds) * 1000);
    };

    video.addEventListener('ended', handleEnded);
    start();

    return () => {
      running = false;
      if (intervalTimer) clearTimeout(intervalTimer);
      cancelAnimationFrame(animationFrame);
      video.removeEventListener('ended', handleEnded);
      video.pause();
      video.removeAttribute('src');
      video.load();
      clearDisplay();
    };
  }, [canvasRef, enabled, intervalSeconds, src]);
}
