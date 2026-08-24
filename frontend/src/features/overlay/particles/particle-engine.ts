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
  private videoQueue: string[] = [];

  // Gift Jar Overlay properties
  private jarImage: HTMLImageElement | null = null;
  private jarSettings = {
    jarEnabled: false,
    jarX: 85,
    jarY: 75,
    jarScale: 1.0,
  };
  private jarItems: any[] = [];

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
      this.playNextVideoInQueue();
    };

    // Load glass jar image
    this.jarImage = new Image();
    this.jarImage.src = '/jar.png';

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

      // Update and draw Gift Jar if enabled
      if (this.jarSettings.jarEnabled && this.jarImage && this.jarImage.complete) {
        const jScale = this.jarSettings.jarScale;
        const baseWidth = 320;
        const baseHeight = 390;
        const jarWidth = baseWidth * jScale;
        const jarHeight = baseHeight * jScale;

        const jarXCoords = (this.canvas.width - jarWidth) * (this.jarSettings.jarX / 100);
        const jarYCoords = (this.canvas.height - jarHeight) * (this.jarSettings.jarY / 100);

        // Define inner jar cavity bounds
        const leftBound = jarXCoords + jarWidth * 0.11;
        const rightBound = jarXCoords + jarWidth * 0.89;
        const bottomBound = jarYCoords + jarHeight * 0.92;

        const gravity = 0.35;
        const frictionX = 0.98;
        const frictionY = 0.98;
        const bounce = 0.25;

        // 1. Update positions & handle wall collisions
        for (const item of this.jarItems) {
          item.vy += gravity;
          item.vx *= frictionX;
          item.vy *= frictionY;

          item.x += item.vx;
          item.y += item.vy;
          item.rotation += item.angularVelocity;

          // Left Wall Collision
          if (item.x - item.radius < leftBound) {
            item.x = leftBound + item.radius;
            item.vx = -item.vx * bounce;
            item.angularVelocity = (Math.random() - 0.5) * 0.05;
          }
          // Right Wall Collision
          if (item.x + item.radius > rightBound) {
            item.x = rightBound - item.radius;
            item.vx = -item.vx * bounce;
            item.angularVelocity = (Math.random() - 0.5) * 0.05;
          }
          // Bottom Floor Collision
          if (item.y + item.radius > bottomBound) {
            item.y = bottomBound - item.radius;
            item.vy = -item.vy * bounce;
            item.vx *= 0.85; // Additional friction when sliding on bottom
            item.angularVelocity *= 0.85;
            if (Math.abs(item.vy) < 0.15) item.vy = 0;
            if (Math.abs(item.vx) < 0.15) item.vx = 0;
          }
        }

        // 2. Resolve collisions between items (multiple passes for physics stability)
        for (let pass = 0; pass < 3; pass++) {
          for (let i = 0; i < this.jarItems.length; i++) {
            const itemA = this.jarItems[i];
            for (let j = i + 1; j < this.jarItems.length; j++) {
              const itemB = this.jarItems[j];
              const dx = itemB.x - itemA.x;
              const dy = itemB.y - itemA.y;
              const distSq = dx * dx + dy * dy;
              const minDist = itemA.radius + itemB.radius;

              if (distSq < minDist * minDist) {
                const dist = Math.sqrt(distSq) || 0.001;
                const overlap = minDist - dist;

                // Collision normal
                const nx = dx / dist;
                const ny = dy / dist;

                // Push items apart based on overlap
                const pushX = nx * overlap * 0.5;
                const pushY = ny * overlap * 0.5;

                itemA.x -= pushX;
                itemA.y -= pushY;
                itemB.x += pushX;
                itemB.y += pushY;

                // Calculate relative velocity
                const rvx = itemB.vx - itemA.vx;
                const rvy = itemB.vy - itemA.vy;
                const velAlongNormal = rvx * nx + rvy * ny;

                if (velAlongNormal < 0) {
                  const impulse = -(1 + bounce) * velAlongNormal / 2;
                  itemA.vx -= impulse * nx;
                  itemA.vy -= impulse * ny;
                  itemB.vx += impulse * nx;
                  itemB.vy += impulse * ny;

                  itemA.angularVelocity += (Math.random() - 0.5) * 0.02;
                  itemB.angularVelocity += (Math.random() - 0.5) * 0.02;
                }
              }
            }
          }
        }

        // 3. Constrain boundary bounds post-solve just in case
        for (const item of this.jarItems) {
          if (item.x - item.radius < leftBound) item.x = leftBound + item.radius;
          if (item.x + item.radius > rightBound) item.x = rightBound - item.radius;
          if (item.y + item.radius > bottomBound) item.y = bottomBound - item.radius;
        }

        // 4. Draw falling and stacked items
        for (const item of this.jarItems) {
          this.ctx.save();
          this.ctx.translate(item.x, item.y);
          this.ctx.rotate(item.rotation);
          
          this.ctx.beginPath();
          this.ctx.arc(0, 0, item.radius, 0, Math.PI * 2);
          this.ctx.closePath();
          this.ctx.clip();
          
          this.ctx.drawImage(
            item.img,
            -item.radius,
            -item.radius,
            item.radius * 2,
            item.radius * 2
          );
          this.ctx.restore();
        }

        // 5. Draw transparent glass Jar layer ON TOP
        this.ctx.drawImage(
          this.jarImage,
          jarXCoords,
          jarYCoords,
          jarWidth,
          jarHeight
        );
      }

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
    if (this.isVideoPlaying) {
      this.videoQueue.push(videoUrl);
      return;
    }

    this.effectVideo.src = videoUrl;
    this.effectVideo.load();
    this.effectVideo.muted = true;

    this.effectVideo.play()
      .then(() => {
        this.isVideoPlaying = true;
      })
      .catch((err) => {
        console.error('Failed to play video effect:', err);
        this.isVideoPlaying = false;
        this.playNextVideoInQueue();
      });
  }

  private playNextVideoInQueue() {
    if (this.videoQueue.length > 0) {
      const nextVideoUrl = this.videoQueue.shift()!;
      this.playVideoEffect(nextVideoUrl);
    }
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

  updateJarSettings(settings: OverlaySettings) {
    this.jarSettings = {
      jarEnabled: settings.jarEnabled,
      jarX: settings.jarX,
      jarY: settings.jarY,
      jarScale: settings.jarScale,
    };
    if (!this.jarSettings.jarEnabled) {
      this.jarItems = [];
    }
  }

  dropGiftIconInJar(imageUrl: string) {
    if (!this.jarSettings.jarEnabled) return;

    const img = new Image();
    img.src = imageUrl;
    img.onerror = (err) => {
      console.error('Failed to load gift icon image in physics jar:', imageUrl, err);
    };
    img.onload = () => {
      const jScale = this.jarSettings.jarScale;
      const baseWidth = 320;
      const baseHeight = 390;
      const jarWidth = baseWidth * jScale;
      const jarHeight = baseHeight * jScale;

      const jarXCoords = (this.canvas.width - jarWidth) * (this.jarSettings.jarX / 100);
      const jarYCoords = (this.canvas.height - jarHeight) * (this.jarSettings.jarY / 100);

      // Neck coordinates
      const neckWidth = jarWidth * 0.45;
      const neckLeft = jarXCoords + (jarWidth - neckWidth) / 2;
      const spawnX = neckLeft + Math.random() * neckWidth;
      const spawnY = jarYCoords + jarHeight * 0.1 - 40;

      const radius = Math.max(12, Math.min(20 * jScale, 28));

      // Limit items inside the jar
      if (this.jarItems.length > 80) {
        this.jarItems.shift();
      }

      this.jarItems.push({
        x: spawnX,
        y: spawnY,
        vx: (Math.random() - 0.5) * 1.5,
        vy: 1.0,
        radius,
        rotation: Math.random() * Math.PI * 2,
        angularVelocity: (Math.random() - 0.5) * 0.08,
        img,
      });
    };
  }
}
