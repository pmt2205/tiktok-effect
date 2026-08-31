'use client';

import React, { useEffect, useRef, useMemo, useImperativeHandle, forwardRef } from 'react';
import { GiftEvent, OverlaySettings } from '@/types';

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

export interface GiftJarOverlayRef {
  spawnGift: (giftData: GiftEvent) => void;
  clearJar: () => void;
}

interface GiftJarOverlayProps {
  settings: OverlaySettings;
}

const getJarBottomY = (x: number, jarType?: string): number => {
  if (jarType === 'promax') {
    const a = 80, b = 35, cy = 231;
    const dx = Math.min(1, Math.max(-1, (x - 160) / a));
    return cy + b * Math.sqrt(1 - dx * dx);
  }
  // Standard / Pro jar: asymmetric bottom curve
  const a = x < 160 ? 137 : 100;
  const dx = Math.min(1, Math.max(-1, (x - 160) / a));
  return 305 + 63 * Math.sqrt(1 - dx * dx);
};

export const GiftJarOverlay = forwardRef<GiftJarOverlayRef, GiftJarOverlayProps>(
  ({ settings }, ref) => {
    const jarCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const overflowCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const jarGiftsRef = useRef<JarGift[]>([]);
    const overflowGiftsRef = useRef<JarGift[]>([]);

    // Expose control API to parent component
    useImperativeHandle(ref, () => ({
      spawnGift(giftData: GiftEvent) {
        if (!settings.jarEnabled) return;
        const jarGifts = jarGiftsRef.current;
        const icon = giftData.giftPictureUrl || 'https://sf16-website-nos.sofproxy.com/obj/tiktok-web-tx/tiktok/web/gift/rose.png';
        const spawnCount = Math.min(10, giftData.repeatCount || 1);

        for (let i = 0; i < spawnCount; i++) {
          // Spawn across the neck width
          const neckLeft = 115;
          const neckRight = 205;
          const spawnX = neckLeft + Math.random() * (neckRight - neckLeft);
          const spawnY = -20 - i * 30;

          jarGifts.push({
            id: `${giftData.uniqueId}-${giftData.giftName}-${Date.now()}-${i}-${Math.random()}`,
            x: spawnX,
            y: spawnY,
            vx: (Math.random() - 0.5) * 2.5,
            vy: 0.5 + Math.random() * 1.0,
            radius: 14,
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

    // Main Physics Loop
    useEffect(() => {
      if (!settings.jarEnabled) return;

      const canvas = jarCanvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      let animationFrameId: number;
      const loadedImages: Record<string, HTMLImageElement> = {};

      const updatePhysics = () => {
        const gifts = jarGiftsRef.current;
        const sizeMultiplier = settings.jarGiftSize !== undefined ? settings.jarGiftSize : 1.0;
        const speedMultiplier = settings.jarFallSpeed !== undefined ? settings.jarFallSpeed : 1.0;
        const DRAW_R = 16 * sizeMultiplier;
        const COL_R = 13 * sizeMultiplier;
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
        const isProMax = currentJarType === 'promax';

        const getWallLeft = (y: number) => {
          if (isProMax) {
            let wL = 88;
            if (y < 90) wL = 108;
            else { const t = Math.min(1, (y - 90) / 40); wL = 108 - t * (108 - 88); }
            if (y >= 231) {
              const dy = (y - 231) / 35;
              if (dy < 1) wL = Math.max(wL, 160 - 80 * Math.sqrt(1 - dy * dy));
            }
            return wL;
          }
          let wL: number;
          if (y < 100) {
            wL = 74;
          } else if (y < 130) {
            const t = Math.min(1, (y - 100) / 30);
            wL = 74 - t * (74 - 47);
          } else {
            wL = 47;
          }
          if (y >= 305) {
            const dy = (y - 305) / 63;
            if (dy < 1) wL = Math.max(wL, 160 - 137 * Math.sqrt(1 - dy * dy));
          }
          return wL;
        };

        const getWallRight = (y: number) => {
          if (isProMax) {
            let wR = 240;
            if (y < 90) wR = 218;
            else { const t = Math.min(1, (y - 90) / 40); wR = 218 + t * (240 - 218); }
            if (y >= 231) {
              const dy = (y - 231) / 35;
              if (dy < 1) wR = Math.min(wR, 160 + 80 * Math.sqrt(1 - dy * dy));
            }
            return wR;
          }
          let wR: number;
          if (y < 100) {
            wR = 248;
          } else if (y < 130) {
            const t = Math.min(1, (y - 100) / 30);
            wR = 248 + t * (256 - 248);
          } else {
            wR = 256;
          }
          if (y >= 305) {
            const dy = (y - 305) / 63;
            if (dy < 1) wR = Math.min(wR, 160 + 100 * Math.sqrt(1 - dy * dy));
          }
          return wR;
        };

        // === STEP 0: Support check for settled items ===
        const settledItems = gifts.filter(p => p.settled);
        if (settledItems.length > 0) {
          const supported = new Set<string>();
          settledItems.forEach(p => {
            const floorY = getJarBottomY(p.x, currentJarType) - COL_R;
            if (p.y >= floorY - 2) {
              supported.add(p.id);
            }
          });

          const maxIters = 8;
          const minD = COL_R * 2;
          const tolDistSq = (minD + 2) * (minD + 2);

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
          const neckLevel = isProMax ? 90 : 100;
          if (p.y >= neckLevel) {
            const wallL = getWallLeft(p.y) + DRAW_R;
            const wallR = getWallRight(p.y) - DRAW_R;

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

          const floorY = getJarBottomY(p.x, currentJarType) - COL_R;
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
              const minD = COL_R * 2;
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
          const neckLevel = isProMax ? 90 : 100;
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
                radius: DRAW_R * scale,
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
            const wallL = getWallLeft(p.y) + DRAW_R;
            const wallR = getWallRight(p.y) - DRAW_R;
            p.x = Math.max(wallL, Math.min(wallR, p.x));
          }
          const floorY = getJarBottomY(p.x, currentJarType) - COL_R;

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
            const minD = COL_R * 2;
            const tolDistSq = (minD + 1) * (minD + 1);
            for (let i = 0; i < gifts.length; i++) {
              const other = gifts[i];
              if (other === p || !other.settled) continue;
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

            let img = loadedImages[p.iconUrl];
            if (!img) {
              img = new Image();
              img.referrerPolicy = 'no-referrer';
              img.src = p.iconUrl;
              img.onload = () => { loadedImages[p.iconUrl] = img; };
            }

            if (img && img.complete && img.naturalWidth > 0) {
              sCtx.drawImage(img, -p.radius, -p.radius, p.radius * 2, p.radius * 2);
            } else {
              sCtx.beginPath();
              sCtx.arc(0, 0, p.radius, 0, Math.PI * 2);
              sCtx.fillStyle = '#ff0050';
              sCtx.fill();
            }

            sCtx.restore();
          });
        }

        // === DRAW JAR GIFTS ===
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        gifts.forEach(p => {
          ctx.save();
          ctx.globalAlpha = p.opacity;
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);

          ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
          ctx.shadowBlur = 4;

          let img = loadedImages[p.iconUrl];
          if (!img) {
            img = new Image();
            img.referrerPolicy = 'no-referrer';
            img.src = p.iconUrl;
            img.onload = () => { loadedImages[p.iconUrl] = img; };
          }

          if (img && img.complete && img.naturalWidth > 0) {
            ctx.drawImage(img, -DRAW_R, -DRAW_R, DRAW_R * 2, DRAW_R * 2);
          } else {
            ctx.beginPath();
            ctx.arc(0, 0, DRAW_R, 0, Math.PI * 2);
            ctx.fillStyle = '#ff0050';
            ctx.fill();
          }

          ctx.restore();
        });

        animationFrameId = requestAnimationFrame(updatePhysics);
      };

      animationFrameId = requestAnimationFrame(updatePhysics);

      return () => {
        cancelAnimationFrame(animationFrameId);
      };
    }, [settings.jarEnabled, settings.jarClearedAt]);

    const jarImages = useMemo(() => {
      const jarType = settings.jarType || 'standard';

      if (jarType === 'promax') {
        return {
          back: '/jar_promax.png',
          front: '/jar_promax_front.png',
          colorized: false,
        };
      }

      if (jarType === 'pro') {
        return {
          back: '/jar_pro_3.png',
          front: '/jar_pro_front_3.png',
          colorized: true,
        };
      }

      return {
        back: '/jarrrr.png',
        front: '/jarrrr_front.png',
        colorized: false,
      };
    }, [settings.jarType]);

    if (!settings.jarEnabled) return null;

    return (
      <>
        {/* Interactive Gift Jar */}
        <div
          className="absolute z-25 transition-all duration-300 pointer-events-none select-none bg-transparent border-none shadow-none"
          style={{
            left: `${settings.jarX !== undefined ? settings.jarX : 75}%`,
            top: `${settings.jarY !== undefined ? settings.jarY : 50}%`,
            transform: `scale(${settings.jarScale !== undefined ? settings.jarScale : 1.0})`,
            transformOrigin: 'top left',
            width: '320px',
            height: '380px',
          }}
        >
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
            />
          )}

          {/* Layer 2: Physics Canvas in the middle (where gifts are drawn) */}
          <canvas ref={jarCanvasRef} width={320} height={380} className="absolute inset-0 z-2 bg-transparent" />

          {/* Layer 3: Jar Foreground (Front bottom glass thickness overlay) */}
          {jarImages.colorized ? (
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
              className="absolute inset-0 w-full h-full object-contain z-3 select-none pointer-events-none"
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
