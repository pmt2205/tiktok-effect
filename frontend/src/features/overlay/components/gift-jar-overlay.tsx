'use client';
/* eslint-disable @next/next/no-img-element -- OBS overlay renders dynamic TikTok and local media URLs that cannot use Next image optimization. */

import React, { useEffect, useRef, useMemo, useImperativeHandle, forwardRef } from 'react';
import { GiftEvent, OverlaySettings } from '@/types';
import { getJarImage } from '@/features/overlay/lib/jar-assets';
import { getJarBottomY, getJarDecoration, getJarGiftRadius, getJarProfile, getJarWallBounds } from '@/features/overlay/lib/jar-geometry';
import { useChromaKeyVideo } from '@/features/overlay/hooks/use-chroma-key-video';

interface JarGift {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  iconUrl: string;
  rotation: number;
  angularVelocity: number;
  opacity: number;
  createdAt: number;
  settled: boolean;
  targetY: number;
  isOutside?: boolean;
}

const JAR_FALL_LEAD = 300;

export interface GiftJarOverlayRef {
  spawnGift: (giftData: GiftEvent) => void;
  clearJar: () => void;
}

interface GiftJarOverlayProps {
  settings: OverlaySettings;
}

export const GiftJarOverlay = forwardRef<GiftJarOverlayRef, GiftJarOverlayProps>(
  ({ settings }, ref) => {
    const jarCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const jarMaskedCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const jarContainerRef = useRef<HTMLDivElement | null>(null);
    const overflowCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const danceCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const jarEffectCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const danceVideoRef = useRef<HTMLVideoElement | null>(null);
    const jarGiftsRef = useRef<JarGift[]>([]);
    const overflowGiftsRef = useRef<JarGift[]>([]);

    useChromaKeyVideo(
      jarEffectCanvasRef,
      settings.jarEffectVideo || '/jar/effect_jar/effect1.mp4',
      Boolean(settings.jarEnabled && settings.jarEffectEnabled),
      settings.jarEffectDelay ?? 0,
    );

    useEffect(() => {
      const jar = jarContainerRef.current;
      if (!jar || window.parent === window || !settings.jarEnabled) return;
      const reportBounds = () => {
        window.parent.postMessage(
          {
            type: 'overlay-preview-target-bounds',
            target: 'jar',
            width: jar.offsetWidth,
            height: jar.offsetHeight,
          },
          window.location.origin,
        );
      };
      const observer = new ResizeObserver(reportBounds);
      observer.observe(jar);
      reportBounds();
      return () => observer.disconnect();
    }, [settings.jarEnabled, settings.jarScale, settings.jarType]);

    // Expose control API to parent component
    useImperativeHandle(ref, () => ({
      spawnGift(giftData: GiftEvent) {
        if (!settings.jarEnabled) return;
        const jarGifts = jarGiftsRef.current;
        const icon = giftData.giftPictureUrl || 'https://sf16-website-nos.sofproxy.com/obj/tiktok-web-tx/tiktok/web/gift/rose.png';
        const spawnCount = Math.min(10, giftData.repeatCount || 1);
        const profile = getJarProfile(settings.jarType);
        const spawnInset = 18;
        const neckLeft = profile.wall.neckLeft + spawnInset;
        const neckRight = profile.wall.neckRight - spawnInset;

        for (let i = 0; i < spawnCount; i++) {
          // Spawn through the selected jar's opening instead of a fixed standard-jar range.
          const spawnX = neckLeft + Math.random() * (neckRight - neckLeft);
          const spawnY = -JAR_FALL_LEAD + 20 - i * 30;

          jarGifts.push({
            id: `${giftData.uniqueId}-${giftData.giftName}-${Date.now()}-${i}-${Math.random()}`,
            x: spawnX,
            y: spawnY,
            vx: (Math.random() - 0.5) * 2.5,
            vy: 0.5 + Math.random() * 1.0,
            radius: getJarGiftRadius(giftData.diamondCount),
            iconUrl: icon,
            rotation: Math.random() * Math.PI * 2,
            angularVelocity: (Math.random() - 0.5) * 0.06,
            opacity: 1.0,
            createdAt: Date.now(),
            settled: false,
            targetY: 0,
            isOutside: false,
          });

          if (jarGifts.length > 300) jarGifts.shift();
        }
      },
      clearJar() {
        jarGiftsRef.current = [];
        overflowGiftsRef.current = [];
      },
    }));

    // Handle canvas dimensions on resize
    useEffect(() => {
      const handleResize = () => {
        const canvas = overflowCanvasRef.current;
        if (canvas) {
          const parent = canvas.parentElement;
          if (parent && parent.clientWidth > 0 && parent.clientHeight > 0) {
            canvas.width = parent.clientWidth;
            canvas.height = parent.clientHeight;
          } else {
            canvas.width = 1080;
            canvas.height = 1920;
          }
        }
      };
      handleResize();
      window.addEventListener('resize', handleResize);
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }, [settings.jarEnabled]);

    // Handle settings toggle
    useEffect(() => {
      if (!settings.jarEnabled) {
        jarGiftsRef.current = [];
        overflowGiftsRef.current = [];
      }
    }, [settings.jarEnabled]);

    // Dance Mascot Chroma Key Loop
    useEffect(() => {
      const isEnabled = settings.jarEnabled && settings.jarDanceEnabled !== false;
      if (!isEnabled) return;

      const videoSrc = settings.jarDanceVideo || '/dance/capy_dance.mp4';
      const video = document.createElement('video');
      video.src = videoSrc;
      video.loop = true;
      video.muted = true;
      video.playsInline = true;
      video.crossOrigin = 'anonymous';
      danceVideoRef.current = video;

      video.play().catch((err) => {
        console.warn('Dance mascot video play handling:', err);
      });

      const chromaCanvas = document.createElement('canvas');
      const chromaCtx = chromaCanvas.getContext('2d', { willReadFrequently: true });

      let animId: number;

      const renderDanceFrame = () => {
        const displayCanvas = danceCanvasRef.current;
        if (
          video &&
          video.readyState >= 2 &&
          !video.paused &&
          displayCanvas &&
          chromaCtx
        ) {
          const displayCtx = displayCanvas.getContext('2d');
          if (displayCtx) {
            const vw = video.videoWidth || 320;
            const vh = video.videoHeight || 320;

            if (chromaCanvas.width !== vw || chromaCanvas.height !== vh) {
              chromaCanvas.width = vw;
              chromaCanvas.height = vh;
            }
            if (displayCanvas.width !== vw || displayCanvas.height !== vh) {
              displayCanvas.width = vw;
              displayCanvas.height = vh;
            }

            chromaCtx.drawImage(video, 0, 0, vw, vh);
            const frame = chromaCtx.getImageData(0, 0, vw, vh);
            const data = frame.data;

            for (let i = 0; i < data.length; i += 4) {
              const r = data[i];
              const g = data[i + 1];
              const b = data[i + 2];

              // Green screen keying
              if (g > 100 && g > r * 1.3 && g > b * 1.3) {
                data[i + 3] = 0;
              } else if (g > 80 && g > r * 1.1 && g > b * 1.1) {
                const maxRGB = Math.max(r, b);
                const diff = g - maxRGB;
                if (diff > 0) {
                  data[i + 3] = Math.floor(Math.max(0, 1 - diff / 40) * 255);
                  data[i + 1] = maxRGB;
                }
              }
            }

            chromaCtx.putImageData(frame, 0, 0);
            displayCtx.clearRect(0, 0, vw, vh);
            displayCtx.drawImage(chromaCanvas, 0, 0);
          }
        }

        animId = requestAnimationFrame(renderDanceFrame);
      };

      animId = requestAnimationFrame(renderDanceFrame);

      return () => {
        cancelAnimationFrame(animId);
        video.pause();
        video.src = '';
        danceVideoRef.current = null;
      };
    }, [settings.jarEnabled, settings.jarDanceEnabled, settings.jarDanceVideo]);

    // Main Physics Loop
    useEffect(() => {
      if (!settings.jarEnabled) return;

      const canvas = jarCanvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Keep the 320 x 680 logical physics space, but render at HiDPI resolution
      // so small TikTok gift thumbnails stay crisp when coin tiers enlarge them.
      const canvasWidth = 320;
      const canvasHeight = 380 + JAR_FALL_LEAD;
      const jarRenderScale = Math.max(1, settings.jarScale || 1);
      const pixelRatio = Math.min((window.devicePixelRatio || 1) * jarRenderScale, 4);
      canvas.width = Math.round(canvasWidth * pixelRatio);
      canvas.height = Math.round(canvasHeight * pixelRatio);
      canvas.style.width = `${canvasWidth}px`;
      canvas.style.height = `${canvasHeight}px`;
      ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      let animationFrameId: number;

      const updatePhysics = () => {
        const gifts = jarGiftsRef.current;
        const sizeMultiplier = settings.jarGiftSize !== undefined ? settings.jarGiftSize : 1.0;
        const speedMultiplier = settings.jarFallSpeed !== undefined ? settings.jarFallSpeed : 1.0;
        const getDrawRadius = (gift: JarGift) => gift.radius * sizeMultiplier;
        const getCollisionRadius = (gift: JarGift) => getDrawRadius(gift) * 0.82;
        const GRAVITY = 0.22 * speedMultiplier;
        const LIN_DAMP = 0.985;
        const ANG_DAMP = 0.80;
        const ANG_CUTOFF = 0.01;
        const RESTITUTION = 0.08;
        const WALL_BOUNCE = 0.15;
        const FLOOR_FRICTION = 0.82;
        const SETTLE_VEL = 0.08;

        const screenW = overflowCanvasRef.current ? overflowCanvasRef.current.width : 1080;
        const screenH = overflowCanvasRef.current ? overflowCanvasRef.current.height : 1920;

        const currentJarType = settings.jarType || 'standard';
        const jarProfile = getJarProfile(currentJarType);

        const getWallLeft = (y: number) => getJarWallBounds(y, currentJarType).left;
        const getWallRight = (y: number) => getJarWallBounds(y, currentJarType).right;

        // === STEP 0: Support check for settled items ===
        const settledItems = gifts.filter(p => p.settled);
        if (settledItems.length > 0) {
          const supported = new Set<string>();
          settledItems.forEach(p => {
            const floorY = getJarBottomY(p.x, currentJarType) - getDrawRadius(p);
            if (p.y >= floorY - 2) {
              supported.add(p.id);
            }
          });

          const maxIters = 8;

          for (let iter = 0; iter < maxIters; iter++) {
            let added = false;
            for (let i = 0; i < settledItems.length; i++) {
              const p = settledItems[i];
              if (supported.has(p.id)) continue;

              for (let j = 0; j < settledItems.length; j++) {
                const other = settledItems[j];
                if (i === j || !supported.has(other.id)) continue;

                if (other.y > p.y - 5) {
                  const dx = other.x - p.x;
                  const dy = other.y - p.y;
                  const distSq = dx * dx + dy * dy;
                  const supportDistance = getCollisionRadius(p) + getCollisionRadius(other) + 2;
                  const tolDistSq = supportDistance * supportDistance;
                  if (distSq <= tolDistSq) {
                    supported.add(p.id);
                    added = true;
                    break;
                  }
                }
              }
            }
            if (!added) break;
          }

          settledItems.forEach(p => {
            if (!supported.has(p.id)) {
              p.settled = false;
              p.vy = 0.5;
            }
          });
        }

        // === STEP 1: Integrate every active particle ===
        gifts.forEach(p => {
          if (p.settled) {
            p.vx = 0;
            p.vy = 0;
            p.angularVelocity = 0;
            return;
          }
          p.vy += GRAVITY;
          p.vx *= LIN_DAMP;
          p.vy *= LIN_DAMP;
          p.angularVelocity *= ANG_DAMP;
          if (Math.abs(p.angularVelocity) < ANG_CUTOFF) p.angularVelocity = 0;
          p.rotation += p.angularVelocity;
          p.x += p.vx;
          p.y += p.vy;
        });

        // === STEP 2: Wall & floor constraints ===
        gifts.forEach(p => {
          if (p.settled) return;
          
          // Disable horizontal boundaries above neck mouth rim (y < neckLevel) to let gifts spill sideways
          const neckLevel = jarProfile.wall.neckY;
          if (p.y >= neckLevel) {
            const drawRadius = getDrawRadius(p);
            const wallL = getWallLeft(p.y) + drawRadius;
            const wallR = getWallRight(p.y) - drawRadius;

            if (p.x < wallL) {
              p.x = wallL;
              const speed = Math.abs(p.vx);
              p.vx = speed * WALL_BOUNCE;
              if (speed > 0.5) p.angularVelocity += (Math.random() - 0.5) * speed * 0.03;
            } else if (p.x > wallR) {
              p.x = wallR;
              const speed = Math.abs(p.vx);
              p.vx = -speed * WALL_BOUNCE;
              if (speed > 0.5) p.angularVelocity += (Math.random() - 0.5) * speed * 0.03;
            }
          }

          const floorY = getJarBottomY(p.x, currentJarType) - getDrawRadius(p);
          if (p.y >= floorY) {
            p.y = floorY;
            const impactVy = Math.abs(p.vy);
            p.vy = -impactVy * RESTITUTION;
            p.vx *= FLOOR_FRICTION;
            if (Math.abs(p.vy) < SETTLE_VEL) p.vy = 0;
            p.angularVelocity *= 0.75;
            if (Math.abs(p.angularVelocity) < ANG_CUTOFF) p.angularVelocity = 0;
          }
        });

        // === STEP 3: Impulse-based particle-to-particle collision ===
        const ITER = 4;
        for (let iter = 0; iter < ITER; iter++) {
          for (let i = 0; i < gifts.length; i++) {
            for (let j = i + 1; j < gifts.length; j++) {
              const a = gifts[i];
              const b = gifts[j];

              if (a.settled && b.settled) continue;

              const dx = b.x - a.x;
              const dy = b.y - a.y;
              const distSq = dx * dx + dy * dy;
              const minD = getCollisionRadius(a) + getCollisionRadius(b);
              if (distSq >= minD * minD || distSq === 0) continue;

              const dist = Math.sqrt(distSq);
              const overlap = minD - dist;
              const nx = dx / dist;
              const ny = dy / dist;

              let pushA = 0;
              let pushB = 0;
              if (a.settled) {
                pushB = overlap;
              } else if (b.settled) {
                pushA = overlap;
              } else {
                const push = overlap * 0.20;
                pushA = push;
                pushB = push;
              }

              a.x -= nx * pushA;
              a.y -= ny * pushA;
              b.x += nx * pushB;
              b.y += ny * pushB;

              const relVx = b.vx - a.vx;
              const relVy = b.vy - a.vy;
              const velAlongN = relVx * nx + relVy * ny;

              if (velAlongN < 0) {
                const restitution = Math.abs(velAlongN) < 0.25 ? 0.0 : 0.15;
                if (a.settled) {
                  const impulseMag = -(1 + restitution) * velAlongN;
                  b.vx += impulseMag * nx;
                  b.vy += impulseMag * ny;
                } else if (b.settled) {
                  const impulseMag = -(1 + restitution) * velAlongN;
                  a.vx -= impulseMag * nx;
                  a.vy -= impulseMag * ny;
                } else {
                  const impulseMag = -(1 + restitution) * velAlongN * 0.5;
                  const ix = impulseMag * nx;
                  const iy = impulseMag * ny;
                  a.vx -= ix;
                  a.vy -= iy;
                  b.vx += ix;
                  b.vy += iy;
                }
              }
            }
          }
        }

        // === STEP 4: Re-clamp positions and determine settling / overflow ===
        const scale = settings.jarScale !== undefined ? settings.jarScale : 1.0;
        gifts.forEach(p => {
          if (p.settled) return;

          // Transition to screen-wide overflow if pushed beyond neck boundaries while above neck level
          const neckLevel = jarProfile.wall.neckY;
          if (p.y < neckLevel) {
            const wL = getWallLeft(p.y);
            const wR = getWallRight(p.y);
            if (p.x < wL || p.x > wR) {
              const jarLeftPixels = ((settings.jarX !== undefined ? settings.jarX : 75) / 100) * screenW;
              const jarTopPixels = ((settings.jarY !== undefined ? settings.jarY : 50) / 100) * screenH;

              const screenX = jarLeftPixels + p.x * scale;
              const screenY = jarTopPixels + p.y * scale;

              overflowGiftsRef.current.push({
                id: p.id,
                x: screenX,
                y: screenY,
                vx: p.vx * scale + (p.x < 160 ? -1.2 : 1.2) * (0.8 + Math.random() * 1.5), // outward push
                vy: p.vy * scale - 0.5, // slight upward bounce
                radius: getDrawRadius(p) * scale,
                iconUrl: p.iconUrl,
                rotation: p.rotation,
                angularVelocity: p.angularVelocity,
                opacity: 1.0, // Ensure it is fully visible when starting overflow
                createdAt: Date.now(), // Reset age so it has a fresh lifespan on the screen
                settled: false,
                targetY: 0,
                isOutside: true,
              });

              p.opacity = 0; // mark for removal from jar
              return;
            }
          }

          // Only clamp to walls if below neck mouth level (y >= neckLevel) to let gifts spill sideways
          if (p.y >= neckLevel) {
            const drawRadius = getDrawRadius(p);
            const wallL = getWallLeft(p.y) + drawRadius;
            const wallR = getWallRight(p.y) - drawRadius;
            p.x = Math.max(wallL, Math.min(wallR, p.x));
          }
          const floorY = getJarBottomY(p.x, currentJarType) - getDrawRadius(p);

          let touchingFloor = false;
          if (p.y >= floorY) {
            p.y = floorY;
            p.vx *= 0.80;
            p.vy = 0;
            if (Math.abs(p.vx) < 0.1) p.vx = 0;
            touchingFloor = true;
          }

          let touchingSettled = false;
          if (!touchingFloor) {
            for (let i = 0; i < gifts.length; i++) {
              const other = gifts[i];
              if (other === p || !other.settled) continue;
              const minD = getCollisionRadius(p) + getCollisionRadius(other);
              const tolDistSq = (minD + 1) * (minD + 1);
              const dx = other.x - p.x;
              const dy = other.y - p.y;
              const distSq = dx * dx + dy * dy;
              if (distSq <= tolDistSq) {
                touchingSettled = true;
                break;
              }
            }
          }

          if ((touchingFloor || touchingSettled) && Math.abs(p.vx) < SETTLE_VEL && Math.abs(p.vy) < SETTLE_VEL) {
            p.settled = true;
            p.vx = 0;
            p.vy = 0;
            p.angularVelocity = 0;
          }
        });

        // Filter out overflowed/removed particles
        jarGiftsRef.current = jarGiftsRef.current.filter(p => p.opacity > 0);

        // === UPDATE OVERFLOWED GIFTS PHYSICS ===
        const overflowGifts = overflowGiftsRef.current;

        if (overflowGifts.length > 300) overflowGifts.shift();

        const settledOverflow = overflowGifts.filter(p => p.settled);
        if (settledOverflow.length > 0) {
          const supported = new Set<string>();
          settledOverflow.forEach(p => {
            const floorY = screenH - p.radius;
            if (p.y >= floorY - 2) {
              supported.add(p.id);
            }
          });

          const maxIters = 8;
          for (let iter = 0; iter < maxIters; iter++) {
            let added = false;
            for (let i = 0; i < settledOverflow.length; i++) {
              const p = settledOverflow[i];
              if (supported.has(p.id)) continue;

              for (let j = 0; j < settledOverflow.length; j++) {
                const other = settledOverflow[j];
                if (i === j || !supported.has(other.id)) continue;

                const tolDist = p.radius + other.radius + 2;
                const tolDistSq = tolDist * tolDist;

                if (other.y > p.y - 5) {
                  const dx = other.x - p.x;
                  const dy = other.y - p.y;
                  const distSq = dx * dx + dy * dy;
                  if (distSq <= tolDistSq) {
                    supported.add(p.id);
                    added = true;
                    break;
                  }
                }
              }
            }
            if (!added) break;
          }

          settledOverflow.forEach(p => {
            if (!supported.has(p.id)) {
              p.settled = false;
              p.vy = 0.5;
            }
          });
        }

        overflowGifts.forEach(p => {
          if (p.settled) {
            p.vx = 0;
            p.vy = 0;
            p.angularVelocity = 0;
            return;
          }
          p.vy += 0.25 * speedMultiplier;
          p.vx *= LIN_DAMP;
          p.vy *= LIN_DAMP;
          p.angularVelocity *= ANG_DAMP;
          if (Math.abs(p.angularVelocity) < ANG_CUTOFF) p.angularVelocity = 0;
          p.rotation += p.angularVelocity;
          p.x += p.vx;
          p.y += p.vy;
        });

        overflowGifts.forEach(p => {
          if (p.settled) return;

          const wallL = p.radius;
          const wallR = screenW - p.radius;

          if (p.x < wallL) {
            p.x = wallL;
            p.vx = Math.abs(p.vx) * WALL_BOUNCE;
          } else if (p.x > wallR) {
            p.x = wallR;
            p.vx = -Math.abs(p.vx) * WALL_BOUNCE;
          }

          const floorY = screenH - p.radius;
          if (p.y >= floorY) {
            p.y = floorY;
            const impactVy = Math.abs(p.vy);
            p.vy = -impactVy * RESTITUTION;
            p.vx *= FLOOR_FRICTION;
            if (Math.abs(p.vy) < SETTLE_VEL) p.vy = 0;
            p.angularVelocity *= 0.75;
            if (Math.abs(p.angularVelocity) < ANG_CUTOFF) p.angularVelocity = 0;
          }
        });

        for (let iter = 0; iter < ITER; iter++) {
          for (let i = 0; i < overflowGifts.length; i++) {
            for (let j = i + 1; j < overflowGifts.length; j++) {
              const a = overflowGifts[i];
              const b = overflowGifts[j];

              if (a.settled && b.settled) continue;

              const dx = b.x - a.x;
              const dy = b.y - a.y;
              const distSq = dx * dx + dy * dy;
              const minD = a.radius + b.radius;
              if (distSq >= minD * minD || distSq === 0) continue;

              const dist = Math.sqrt(distSq);
              const overlap = minD - dist;
              const nx = dx / dist;
              const ny = dy / dist;

              let pushA = 0;
              let pushB = 0;
              if (a.settled) {
                pushB = overlap;
              } else if (b.settled) {
                pushA = overlap;
              } else {
                const push = overlap * 0.20;
                pushA = push;
                pushB = push;
              }

              a.x -= nx * pushA;
              a.y -= ny * pushA;
              b.x += nx * pushB;
              b.y += ny * pushB;

              const relVx = b.vx - a.vx;
              const relVy = b.vy - a.vy;
              const velAlongN = relVx * nx + relVy * ny;

              if (velAlongN < 0) {
                const restitution = Math.abs(velAlongN) < 0.25 ? 0.0 : 0.15;
                if (a.settled) {
                  const impulseMag = -(1 + restitution) * velAlongN;
                  b.vx += impulseMag * nx;
                  b.vy += impulseMag * ny;
                } else if (b.settled) {
                  const impulseMag = -(1 + restitution) * velAlongN;
                  a.vx -= impulseMag * nx;
                  a.vy -= impulseMag * ny;
                } else {
                  const impulseMag = -(1 + restitution) * velAlongN * 0.5;
                  const ix = impulseMag * nx;
                  const iy = impulseMag * ny;
                  a.vx -= ix;
                  a.vy -= iy;
                  b.vx += ix;
                  b.vy += iy;
                }
              }
            }
          }
        }

        overflowGifts.forEach(p => {
          if (p.settled) return;

          const wallL = p.radius;
          const wallR = screenW - p.radius;
          p.x = Math.max(wallL, Math.min(wallR, p.x));

          const floorY = screenH - p.radius;
          let touchingFloor = false;
          if (p.y >= floorY) {
            p.y = floorY;
            p.vx *= 0.80;
            p.vy = 0;
            if (Math.abs(p.vx) < 0.1) p.vx = 0;
            touchingFloor = true;
          }

          let touchingSettled = false;
          if (!touchingFloor) {
            for (let i = 0; i < overflowGifts.length; i++) {
              const other = overflowGifts[i];
              if (other === p || !other.settled) continue;

              const dx = other.x - p.x;
              const dy = other.y - p.y;
              const distSq = dx * dx + dy * dy;
              const minD = p.radius + other.radius;
              if (distSq <= (minD + 1) * (minD + 1)) {
                touchingSettled = true;
                break;
              }
            }
          }

          if ((touchingFloor || touchingSettled) && Math.abs(p.vx) < SETTLE_VEL && Math.abs(p.vy) < SETTLE_VEL) {
            p.settled = true;
            p.vx = 0;
            p.vy = 0;
            p.angularVelocity = 0;
          }
        });

        // === DRAW OVERFLOWED GIFTS ===
        const sCtx = overflowCanvasRef.current ? overflowCanvasRef.current.getContext('2d') : null;
        if (sCtx && overflowCanvasRef.current) {
          sCtx.clearRect(0, 0, overflowCanvasRef.current.width, overflowCanvasRef.current.height);

          overflowGifts.forEach(p => {
            sCtx.save();
            sCtx.globalAlpha = p.opacity;
            sCtx.translate(p.x, p.y);
            sCtx.rotate(p.rotation);

            sCtx.shadowColor = 'rgba(0, 0, 0, 0.3)';
            sCtx.shadowBlur = 4;

            const img = getJarImage(p.iconUrl);

            if (img && img.complete && img.naturalWidth > 0) {
              sCtx.drawImage(img, -p.radius, -p.radius, p.radius * 2, p.radius * 2);
            }

            sCtx.restore();
          });
        }

        // === DRAW JAR GIFTS ===
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);

        const middleMaskUrl = jarProfile.assets.middleMask;
        let maskedCanvas: HTMLCanvasElement | null = null;
        let maskedCtx: CanvasRenderingContext2D | null = null;
        if (middleMaskUrl) {
          if (!jarMaskedCanvasRef.current) jarMaskedCanvasRef.current = document.createElement('canvas');
          maskedCanvas = jarMaskedCanvasRef.current;
          if (maskedCanvas.width !== canvas.width) maskedCanvas.width = canvas.width;
          if (maskedCanvas.height !== canvas.height) maskedCanvas.height = canvas.height;
          maskedCtx = maskedCanvas.getContext('2d');
          if (maskedCtx) {
            maskedCtx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
            maskedCtx.imageSmoothingEnabled = true;
            maskedCtx.imageSmoothingQuality = 'high';
            maskedCtx.clearRect(0, 0, canvasWidth, canvasHeight);
          }
        }

        gifts.forEach(p => {
          const drawCtx = maskedCtx && p.y >= jarProfile.wall.neckY ? maskedCtx : ctx;
          drawCtx.save();
          drawCtx.globalAlpha = p.opacity;
          drawCtx.translate(p.x, p.y + JAR_FALL_LEAD);
          drawCtx.rotate(p.rotation);

          // A canvas shadow becomes heavily blurred when the whole jar is CSS-scaled.
          // Gift artwork already contains its own highlights, so draw it unfiltered.
          drawCtx.shadowColor = 'transparent';
          drawCtx.shadowBlur = 0;

          const img = getJarImage(p.iconUrl);

          if (img && img.complete && img.naturalWidth > 0) {
            const drawRadius = getDrawRadius(p);
            drawCtx.drawImage(img, -drawRadius, -drawRadius, drawRadius * 2, drawRadius * 2);
          }

          drawCtx.restore();
        });

        if (maskedCanvas && maskedCtx && middleMaskUrl) {
          const maskImage = getJarImage(middleMaskUrl);
          if (maskImage && maskImage.complete && maskImage.naturalWidth > 0) {
            const maskHeight = 380;
            const maskWidth = maskHeight * (maskImage.naturalWidth / maskImage.naturalHeight);
            const maskX = (320 - maskWidth) / 2;
            maskedCtx.save();
            maskedCtx.globalCompositeOperation = 'destination-in';
            maskedCtx.drawImage(maskImage, maskX, JAR_FALL_LEAD, maskWidth, maskHeight);
            maskedCtx.restore();
            ctx.drawImage(maskedCanvas, 0, 0, canvasWidth, canvasHeight);
          }
        }

        animationFrameId = requestAnimationFrame(updatePhysics);
      };

      animationFrameId = requestAnimationFrame(updatePhysics);

      return () => {
        cancelAnimationFrame(animationFrameId);
      };
    }, [settings.jarEnabled, settings.jarClearedAt, settings.jarFallSpeed, settings.jarGiftSize, settings.jarScale, settings.jarType, settings.jarX, settings.jarY]);

    const jarImages = useMemo(() => {
      return getJarProfile(settings.jarType).assets;
    }, [settings.jarType]);

    const jarDecoration = useMemo(
      () => settings.jarDecorationEnabled ? getJarDecoration(settings.jarDecoration) : null,
      [settings.jarDecoration, settings.jarDecorationEnabled],
    );

    if (!settings.jarEnabled) return null;

    return (
      <>
        {/* Interactive Gift Jar */}
        <div
          ref={jarContainerRef}
          data-overlay-preview-target="jar"
          className="absolute z-25 pointer-events-none select-none bg-transparent border-none shadow-none"
          style={{
            left: `${settings.jarX !== undefined ? settings.jarX : 75}%`,
            top: `${settings.jarY !== undefined ? settings.jarY : 50}%`,
            transform: `scale(${settings.jarScale !== undefined ? settings.jarScale : 1.0})`,
            transformOrigin: 'top left',
            width: '320px',
            height: '380px',
          }}
        >
          {/* Pro Max chroma-key video follows the same position and scale as the jar. */}
          {settings.jarEffectEnabled && (
            <canvas
              ref={jarEffectCanvasRef}
              className="absolute pointer-events-none z-0 max-w-none"
              style={{
                left: `calc(50% + ${settings.jarEffectX ?? 0}px)`,
                top: `calc(50% + ${settings.jarEffectY ?? 0}px)`,
                width: `${Math.round(520 * (settings.jarEffectScale ?? 1))}px`,
                height: 'auto',
                transform: 'translate(-50%, -50%)',
                transformOrigin: 'center',
                filter: 'drop-shadow(0 0 18px var(--color-primary-glow))',
              }}
            />
          )}

          {/* Layer 1: Jar Background (Back, sides, lid, and inner rim) */}
          {jarImages.colorized ? (
            <div className="absolute inset-0 w-full h-full pointer-events-none z-1" style={{ isolation: 'isolate' }}>
              <img
                src={jarImages.back}
                alt=""
                className="absolute inset-0 w-full h-full object-contain filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.35)]"
              />
              <div
                className="absolute inset-0 w-full h-full"
                style={{
                  backgroundColor: settings.jarColor || '#ffffff',
                  mixBlendMode: 'color',
                  WebkitMaskImage: `url(${jarImages.back})`,
                  maskImage: `url(${jarImages.back})`,
                  WebkitMaskSize: 'contain',
                  maskSize: 'contain',
                  WebkitMaskRepeat: 'no-repeat',
                  maskRepeat: 'no-repeat',
                  WebkitMaskPosition: 'center',
                  maskPosition: 'center',
                }}
              />
            </div>
          ) : (
            <img
              src={jarImages.back}
              alt=""
              className="absolute inset-0 w-full h-full object-contain z-1 select-none pointer-events-none filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.35)]"
              style={jarImages.scale && jarImages.scale !== 1.0 ? { transform: `scale(${jarImages.scale})`, transformOrigin: 'center center' } : undefined}
            />
          )}

          {/* Layer 2: Physics Canvas in the middle (where gifts are drawn) */}
          <canvas
            ref={jarCanvasRef}
            width={320}
            height={380 + JAR_FALL_LEAD}
            className="absolute left-0 z-2 bg-transparent pointer-events-none"
            style={{ top: `-${JAR_FALL_LEAD}px` }}
          />

          {/* Layer 3: Jar Foreground (Front bottom glass thickness & glass highlights overlay) */}
          {jarImages.front ? (
            jarImages.colorized ? (
              <div className="absolute inset-0 w-full h-full pointer-events-none z-3" style={{ isolation: 'isolate' }}>
                <img src={jarImages.front} alt="" className="absolute inset-0 w-full h-full object-contain" />
                <div
                  className="absolute inset-0 w-full h-full"
                  style={{
                    backgroundColor: settings.jarColor || '#ffffff',
                    mixBlendMode: 'color',
                    WebkitMaskImage: `url(${jarImages.front})`,
                    maskImage: `url(${jarImages.front})`,
                    WebkitMaskSize: 'contain',
                    maskSize: 'contain',
                    WebkitMaskRepeat: 'no-repeat',
                    maskRepeat: 'no-repeat',
                    WebkitMaskPosition: 'center',
                    maskPosition: 'center',
                  }}
                />
              </div>
            ) : (
              <img
                src={jarImages.front}
                alt=""
                className="absolute inset-0 w-full h-full object-contain z-3 pointer-events-none"
                style={jarImages.scale && jarImages.scale !== 1.0 ? { transform: `scale(${jarImages.scale})`, transformOrigin: 'center center' } : undefined}
              />
            )
          ) : (
            <img
              src={jarImages.back}
              alt=""
              className="absolute inset-0 w-full h-full object-contain z-3 pointer-events-none mix-blend-screen opacity-35"
              style={jarImages.scale && jarImages.scale !== 1.0 ? { transform: `scale(${jarImages.scale})`, transformOrigin: 'center center' } : undefined}
            />
          )}

          {/* Independent ornament artwork, separated from the glass jar body. */}
          {jarDecoration && (
            <img
              src={jarDecoration.src}
              alt=""
              className="absolute inset-0 w-full h-full object-contain z-4 pointer-events-none"
              style={{
                transform: `translate(${jarDecoration.x}px, ${jarDecoration.y}px) scaleX(${jarDecoration.scaleX}) scaleY(${jarDecoration.scaleY})`,
                transformOrigin: 'center center',
              }}
            />
          )}

          {/* Layer 4: Pro Max name plate anchored to the upper jar rim. */}
          {settings.jarNameEnabled && settings.jarNameImage && (
            <img
              src={settings.jarNameImage}
              alt=""
              className="absolute z-4 w-[360px] max-w-none object-contain pointer-events-none select-none transition-all duration-300"
              style={{
                left: `${160 + (settings.jarNameX || 0)}px`,
                top: `${settings.jarNameY !== undefined ? settings.jarNameY : -54}px`,
                transform: `translateX(-50%) scale(${settings.jarNameScale !== undefined ? settings.jarNameScale : 0.55})`,
                transformOrigin: 'top center',
                filter: 'drop-shadow(0 5px 10px rgba(0,0,0,0.45))',
              }}
            />
          )}

          {/* Layer 5: Dance Mascot Decoration (positioned beside jar) */}
          {settings.jarDanceEnabled !== false && (
            <canvas
              ref={danceCanvasRef}
              className="absolute pointer-events-none z-4 transition-all duration-300"
              style={{
                bottom: '10px',
                ...(settings.jarDancePosition === 'right'
                  ? { left: `${320 + ((settings.jarDanceOffsetX !== undefined ? settings.jarDanceOffsetX : 185) - 185)}px` }
                  : { left: `-${settings.jarDanceOffsetX !== undefined ? settings.jarDanceOffsetX : 185}px` }),
                width: `${Math.round(190 * (settings.jarDanceScale || 1.0))}px`,
                height: 'auto',
                filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.45))',
              }}
            />
          )}
        </div>

        {/* Full-screen canvas for overflowed gifts spilling to screen bottom */}
        <canvas
          ref={overflowCanvasRef}
          className="absolute inset-0 z-26 pointer-events-none bg-transparent"
        />
      </>
    );
  }
);

GiftJarOverlay.displayName = 'GiftJarOverlay';
