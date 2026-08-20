// High-performance canvas particle engine

import { Particle } from './particle';
import { OverlaySettings } from '@/types';

export class ParticleEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private particles: Particle[] = [];
  private animationId: number | null = null;

  // Chroma key video processing
  private chromaCanvas: HTMLCanvasElement;
  private chromaCtx: CanvasRenderingContext2D;
  private effectVideo: HTMLVideoElement;
  private isVideoPlaying = false;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;

    // Set up chroma key video elements
    this.effectVideo = document.createElement('video');
    this.effectVideo.crossOrigin = 'anonymous';
    this.effectVideo.playsInline = true;
    this.effectVideo.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;display:none;pointer-events:none;';
    document.body.appendChild(this.effectVideo);

    this.chromaCanvas = document.createElement('canvas');
    this.chromaCtx = this.chromaCanvas.getContext('2d')!;

    this.effectVideo.onended = () => {
      this.isVideoPlaying = false;
      this.effectVideo.src = '';
    };

    this.resize();
    window.addEventListener('resize', this.resize);
  }

  private resize = () => {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  };

  start() {
    const loop = () => {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      // Render chroma key video if active
      if (this.isVideoPlaying && this.effectVideo.videoWidth > 0) {
        const w = 480;
        const h = 270;
        if (this.chromaCanvas.width !== w) {
          this.chromaCanvas.width = w;
          this.chromaCanvas.height = h;
        }

        this.chromaCtx.drawImage(this.effectVideo, 0, 0, w, h);
        const frame = this.chromaCtx.getImageData(0, 0, w, h);
        const data = frame.data;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          // Simplified high-performance RGB green screen thresholding
          if (g > 110 && g > r * 1.35 && g > b * 1.35) {
            data[i + 3] = 0; // Key out green pixels
          } else if (g > 85 && g > r * 1.1 && g > b * 1.1) {
            // Smooth edge transitions & green spill removal
            const maxRGB = Math.max(r, b);
            const diff = g - maxRGB;
            if (diff > 0) {
              const alpha = Math.max(0, 1 - diff / 40);
              data[i + 3] = Math.floor(alpha * 255);
              data[i + 1] = maxRGB; // Reduce green spill fringe
            }
          }
        }

        this.chromaCtx.putImageData(frame, 0, 0);
        this.ctx.drawImage(this.chromaCanvas, 0, 0, this.canvas.width, this.canvas.height);
      }

      // Update and draw particles
      this.particles = this.particles.filter((p) => p.alpha > 0);
      this.particles.forEach((p) => {
        p.update();
        p.draw(this.ctx);
      });

      this.animationId = requestAnimationFrame(loop);
    };

    loop();
  }

  stop() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    window.removeEventListener('resize', this.resize);
    if (this.effectVideo.parentNode) {
      this.effectVideo.parentNode.removeChild(this.effectVideo);
    }
  }

  playVideoEffect(videoUrl: string) {
    this.effectVideo.src = videoUrl;
    this.effectVideo.load();
    this.effectVideo.muted = true;

    this.effectVideo.play()
      .then(() => {
        this.isVideoPlaying = true;
      })
      .catch(() => {
        this.isVideoPlaying = false;
      });
  }

  spawnParticlesForGift(effectType: string, comboCount: number, settings: OverlaySettings) {
    const isRose = effectType === 'rose-petal';
    const isGalaxy = effectType === 'star';
    const mult = settings.density === 3 ? 1.6 : settings.density === 1 ? 0.5 : 1;

    if (isRose) {
      const petalCount = Math.floor((15 + Math.min(comboCount * 3, 20)) * mult);
      const sparkleCount = Math.floor((10 + Math.min(comboCount * 2, 15)) * mult);
      const spawnX = 220;
      const spawnY = window.innerHeight * 0.22;

      for (let i = 0; i < petalCount; i++) {
        const x = Math.random() * window.innerWidth * 0.6;
        const y = -20 - Math.random() * 50;
        this.particles.push(new Particle(x, y, 'rose-petal'));
      }

      for (let i = 0; i < sparkleCount; i++) {
        this.particles.push(new Particle(spawnX, spawnY, 'sparkle'));
      }
    } else if (isGalaxy) {
      const starCount = Math.floor(100 * mult);
      const dustCount = Math.floor(40 * mult);
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;

      for (let i = 0; i < dustCount; i++) {
        const offsetDist = Math.random() * 100;
        const angle = Math.random() * Math.PI * 2;
        const x = centerX + Math.cos(angle) * offsetDist;
        const y = centerY + Math.sin(angle) * offsetDist;
        this.particles.push(new Particle(x, y, 'cosmic-dust'));
      }

      for (let i = 0; i < starCount; i++) {
        this.particles.push(new Particle(centerX, centerY, 'star'));
      }

      for (let i = 0; i < 30; i++) {
        this.particles.push(
          new Particle(Math.random() * window.innerWidth, Math.random() * window.innerHeight, 'sparkle'),
        );
      }
    } else {
      const sparkleCount = Math.floor(30 * mult);
      const spawnX = window.innerWidth * 0.6;
      const spawnY = window.innerHeight * 0.4;

      for (let i = 0; i < sparkleCount; i++) {
        this.particles.push(new Particle(spawnX, spawnY, 'sparkle'));
      }
    }
  }
}
