// High-performance canvas particle engine

import { Particle, ParticleType } from './Particle';
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
        const w = 960;
        const h = 540;
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

          // RGB to YUV (U and V chrominance channels)
          const u = -0.168736 * r - 0.331264 * g + 0.5 * b + 128;
          const v = 0.5 * r - 0.418688 * g - 0.081312 * b + 128;

          // Distance squared from pure green key color in UV space
          const du = u - 43.5185;
          const dv = v - 21.2315;
          const distSq = du * du + dv * dv;

          // Squared thresholds for performance optimization (skips Math.sqrt when possible)
          const similaritySq = 9216;     // (0.40 * 240)^2
          const edgeSq = 13271;           // (0.48 * 240)^2
          const maxSpillSq = 18063;       // (0.56 * 240)^2

          if (distSq < similaritySq) {
            // Fully transparent background
            data[i + 3] = 0;
          } else if (distSq < edgeSq) {
            // Semi-transparent edge transition
            const dist = Math.sqrt(distSq);
            const normDist = dist / 240;
            const alpha = (normDist - 0.4) / 0.08;
            data[i + 3] = Math.max(0, Math.min(255, alpha * 255));

            // Apply spill reduction to remove green fringe
            const spillFactor = (0.56 - normDist) / 0.16;
            const avg = (r + b) / 2;
            if (g > avg) {
              data[i + 1] = g * (1 - spillFactor) + avg * spillFactor;
            }
          } else {
            // Fully opaque object
            data[i + 3] = 255;

            // Apply spill reduction if close to green boundary
            if (distSq < maxSpillSq) {
              const dist = Math.sqrt(distSq);
              const normDist = dist / 240;
              const spillFactor = (0.56 - normDist) / 0.16;
              const avg = (r + b) / 2;
              if (g > avg) {
                data[i + 1] = g * (1 - spillFactor) + avg * spillFactor;
              }
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

  playVideoEffect(videoUrl: string, soundEnabled: boolean) {
    this.effectVideo.src = videoUrl;
    this.effectVideo.load();
    this.effectVideo.muted = !soundEnabled;

    this.effectVideo.play()
      .then(() => {
        this.isVideoPlaying = true;
      })
      .catch(() => {
        this.effectVideo.muted = true;
        this.effectVideo.play()
          .then(() => {
            this.isVideoPlaying = true;
          })
          .catch(() => {
            this.isVideoPlaying = false;
          });
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
