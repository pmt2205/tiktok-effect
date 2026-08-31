'use client';

import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { GiftEvent, OverlaySettings } from '@/types';

interface TreeGift {
  id: string;
  branchIndex: number;
  x: number; // local coordinate on the tree (0 to 400)
  y: number; // local coordinate on the tree (0 to 400)
  iconUrl: string;
  scale: number; // 0 to 1 (blooming)
  phase: number; // random phase for wind sway
  swaySpeed: number; // speed of sway
  createdAt: number;
}

interface FallingGift {
  id: string;
  x: number; // screen coordinate
  y: number; // screen coordinate
  vx: number;
  vy: number;
  radius: number;
  iconUrl: string;
  rotation: number;
  angularVelocity: number;
  opacity: number;
}

export interface GiftTreeOverlayRef {
  spawnGift: (giftData: GiftEvent) => void;
  clearTree: () => void;
}

interface GiftTreeOverlayProps {
  settings: OverlaySettings;
}

// 58 coordinate points on the tree branches (width 400, height 400)
const BRANCH_POINTS = [
  // Outer branch tips (Left side)
  { x: 75, y: 260 },  // Lowest Left Branch Tip
  { x: 10, y: 185 },  // Mid Left Branch Tip (lower)
  { x: 25, y: 170 },  // Far Left Branch Tip
  { x: 65, y: 160 },  // Upper Left Branch Tip (outer)
  { x: 45, y: 155 }, // Upper Left Branch Tip (inner)
  
  // // Mid-branch coordinates (Left side)
  { x: 145, y: 295 },
  { x: 160, y: 260   },
  { x: 70, y: 200 },
  { x: 95, y: 210 },
  { x: 85, y: 200 },
  { x: 80, y: 185 },
  { x: 85, y: 135 },
  { x: 115, y: 145 },
  { x: 120, y: 120 },
  { x: 150, y: 95 },

  // // Outer branch tips (Right side)
  { x: 310, y: 260 }, // Lowest Right Branch Tip
  { x: 375, y: 220 }, // Mid Right Branch Tip (lower)
  { x: 385, y: 170 }, // Far Right Branch Tip
  { x: 350, y: 115 }, // Upper Right Branch Tip (outer)
  { x: 300, y: 105 }, // Upper Right Branch Tip (inner)

  // // Mid-branch coordinates (Right side)
  { x: 280, y: 280 },
  { x: 270, y: 288 },
  { x: 330, y: 225 },
  { x: 300, y: 235 },
  { x: 360, y: 210 },
  { x: 395, y: 185 },
  { x: 315, y: 135 },
  { x: 285, y: 150 },
  { x: 277, y: 120 },
  { x: 265, y: 100 },

  // // Top canopy twigs & tips
  { x: 110, y: 40 },  // Top Center Left twig tip
  { x: 155, y: 80 },  
  { x: 190, y: 10 },  // Top Center twig tip (highest)
  { x: 210, y: 30 },  
  { x: 235, y: 40 },  // Top Center Right twig tip (highest)
  { x: 245, y: 65 },  // Top Center Right twig tip
  { x: 240, y: 90 },  

  // // Inner branches / forks / trunk split
  { x: 110, y: 200 }, 
  { x: 130, y: 205 },
  { x: 145, y: 160 }, 
  { x: 160, y: 170 }, 
  { x: 152, y: 115 }, 
  { x: 195, y: 155 }, // Center main split
  { x: 230, y: 115 }, 
  { x: 255, y: 160 }, 
  { x: 240, y: 170 }, 
  { x: 260, y: 200 }, 
  { x: 270, y: 210 }, 
  { x: 185, y: 120 },
  { x: 210, y: 120 },
  { x: 185, y: 220 },
  { x: 215, y: 220 },
  { x: 15, y: 70 },
  { x: 42, y: 70 },
  { x: 50, y: 95 },
  { x: 70, y: 75 },
  { x: 108, y: 70 },
  { x: 85, y: 110 },
  { x: 108, y: 130 },
  { x: 140, y: 145 },
  { x: 150, y: 10 },
  { x: 167, y: 35 },
  { x: 185, y: 65 },
  { x: 205, y: 67 },
  { x: 252, y: 33 },
  { x: 250, y: 50 },
  { x: 255, y: 20 },
  { x: 312, y: 57 },
  { x: 322, y: 30 },
  { x: 323, y: 65 },
  { x: 340, y: 90 },
  { x: 330, y: 90 },
  { x: 360, y: 80 },
  { x: 390, y: 130 },
  { x: 340, y: 165 },
  { x: 15, y: 70 }
];

export const GiftTreeOverlay = forwardRef<GiftTreeOverlayRef, GiftTreeOverlayProps>(
  ({ settings }, ref) => {
    const treeCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const fallingCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const activeGiftsRef = useRef<TreeGift[]>([]);
    const fallingGiftsRef = useRef<FallingGift[]>([]);

    // Expose API
    useImperativeHandle(ref, () => ({
      spawnGift(giftData: GiftEvent) {
        if (!settings.treeEnabled) return;
        const activeGifts = activeGiftsRef.current;
        const icon = giftData.giftPictureUrl || 'https://sf16-website-nos.sofproxy.com/obj/tiktok-web-tx/tiktok/web/gift/rose.png';
        const spawnCount = Math.min(5, giftData.repeatCount || 1);

        for (let i = 0; i < spawnCount; i++) {
          // Find empty branch indices
          const occupiedIndices = new Set(activeGifts.map(g => g.branchIndex));
          const emptyIndices: number[] = [];
          
          BRANCH_POINTS.forEach((_, idx) => {
            if (!occupiedIndices.has(idx)) {
              emptyIndices.push(idx);
            }
          });

          let selectedBranchIdx = -1;
          if (emptyIndices.length > 0) {
            // Spawn on a random empty branch
            selectedBranchIdx = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
          } else {
            // All branches occupied! Knock one random gift off to make room
            const knockIdx = Math.floor(Math.random() * activeGifts.length);
            const knocked = activeGifts[knockIdx];
            
            // Convert to falling gift
            triggerFallingGift(knocked);
            
            // Re-use this branch index
            selectedBranchIdx = knocked.branchIndex;
            activeGifts.splice(knockIdx, 1);
          }

          const pt = BRANCH_POINTS[selectedBranchIdx];
          activeGifts.push({
            id: `${giftData.uniqueId}-${giftData.giftName}-${Date.now()}-${i}-${Math.random()}`,
            branchIndex: selectedBranchIdx,
            x: pt.x,
            y: pt.y,
            iconUrl: icon,
            scale: 0.01,
            phase: Math.random() * Math.PI * 2,
            swaySpeed: 0.8 + Math.random() * 0.6,
            createdAt: Date.now(),
          });
        }
      },
      clearTree() {
        // Sweep all active gifts into falling state
        activeGiftsRef.current.forEach(gift => {
          triggerFallingGift(gift);
        });
        activeGiftsRef.current = [];
      }
    }));

    // Helper to turn an active gift into a falling gift
    const triggerFallingGift = (gift: TreeGift) => {
      const canvas = fallingCanvasRef.current;
      const screenW = canvas ? (canvas.clientWidth || 1080) : 1080;
      const screenH = canvas ? (canvas.clientHeight || 1920) : 1920;

      // Compute current screen position
      const treeScale = settings.treeScale !== undefined ? settings.treeScale : 1.0;
      const treeLeftPixels = ((settings.treeX !== undefined ? settings.treeX : 20) / 100) * screenW;
      const treeTopPixels = ((settings.treeY !== undefined ? settings.treeY : 50) / 100) * screenH;

      const screenX = treeLeftPixels + gift.x * treeScale;
      const screenY = treeTopPixels + gift.y * treeScale;
      const giftSize = 20 * (settings.treeGiftSize !== undefined ? settings.treeGiftSize : 1.0) * treeScale;

      fallingGiftsRef.current.push({
        id: gift.id,
        x: screenX,
        y: screenY,
        vx: (Math.random() - 0.5) * 5, // random horizontal blast
        vy: -2 - Math.random() * 3,   // slight upward bounce
        radius: giftSize,
        iconUrl: gift.iconUrl,
        rotation: Math.random() * Math.PI * 2,
        angularVelocity: (Math.random() - 0.5) * 0.12,
        opacity: 1.0,
      });
    };

    // Handle canvas dimensions on resize
    useEffect(() => {
      const handleResize = () => {
        const canvas = fallingCanvasRef.current;
        if (canvas) {
          const parent = canvas.parentElement;
          const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
          const canvasScale = dpr * 2;
          if (parent && parent.clientWidth > 0 && parent.clientHeight > 0) {
            canvas.width = parent.clientWidth * canvasScale;
            canvas.height = parent.clientHeight * canvasScale;
            canvas.style.width = `${parent.clientWidth}px`;
            canvas.style.height = `${parent.clientHeight}px`;
          } else {
            canvas.width = 1080 * canvasScale;
            canvas.height = 1920 * canvasScale;
            canvas.style.width = '1080px';
            canvas.style.height = '1920px';
          }
        }
      };
      handleResize();
      window.addEventListener('resize', handleResize);
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }, [settings.treeEnabled]);

    // Handle settings toggle
    useEffect(() => {
      if (!settings.treeEnabled) {
        activeGiftsRef.current = [];
        fallingGiftsRef.current = [];
      }
    }, [settings.treeEnabled]);

    // Main animation loop
    useEffect(() => {
      if (!settings.treeEnabled) return;

      const tCanvas = treeCanvasRef.current;
      const fCanvas = fallingCanvasRef.current;
      if (!tCanvas || !fCanvas) return;

      const tCtx = tCanvas.getContext('2d');
      const fCtx = fCanvas.getContext('2d');
      if (!tCtx || !fCtx) return;

      let animationFrameId: number;
      const loadedImages: Record<string, HTMLImageElement> = {};

      const render = () => {
        const now = Date.now();
        const activeGifts = activeGiftsRef.current;
        const fallingGifts = fallingGiftsRef.current;
        const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;

        const treeScale = settings.treeScale !== undefined ? settings.treeScale : 1.0;
        const giftSizeMultiplier = settings.treeGiftSize !== undefined ? settings.treeGiftSize : 1.0;
        const BASE_GIFT_R = 18 * giftSizeMultiplier;

        // 1. UPDATE ACTIVE GIFTS (Blooming & Swaying)
        activeGifts.forEach(g => {
          if (g.scale < 1.0) {
            g.scale += 0.04; // grow to full size over ~25 frames
            if (g.scale > 1.0) g.scale = 1.0;
          }
        });

        // 2. UPDATE FALLING GIFTS (Gravity & Fade out)
        const screenH = fCanvas.height / (dpr * 2);
        fallingGifts.forEach(g => {
          g.vy += 0.22; // gravity
          g.vx *= 0.98; // air resistance
          g.x += g.vx;
          g.y += g.vy;
          g.rotation += g.angularVelocity;

          // Fade out as it falls below screen bottom or ages
          if (g.y >= screenH - g.radius) {
            g.y = screenH - g.radius;
            g.vx = 0;
            g.vy = 0;
            g.angularVelocity = 0;
          }
          // Start fading out when falling
          g.opacity -= 0.008;
        });

        // Clean up invisible falling gifts
        fallingGiftsRef.current = fallingGifts.filter(g => g.opacity > 0);

        // 3. DRAW ACTIVE GIFTS ON TREE CANVAS
        const tScale = dpr * 2;
        tCtx.setTransform(tScale, 0, 0, tScale, 0, 0);
        tCtx.clearRect(0, 0, 400, 400);
        tCtx.imageSmoothingEnabled = true;
        tCtx.imageSmoothingQuality = 'high';
        activeGifts.forEach(g => {
          tCtx.save();

          // Calculate sway angle: gentle back and forth
          const swayAngle = Math.sin(now * 0.0015 * g.swaySpeed + g.phase) * 0.09;
          
          tCtx.translate(g.x, g.y);
          tCtx.rotate(swayAngle);
          tCtx.scale(g.scale, g.scale);

          // Shadow styling
          tCtx.shadowColor = 'rgba(0, 0, 0, 0.3)';
          tCtx.shadowBlur = 4;

          let img = loadedImages[g.iconUrl];
          if (!img) {
            img = new Image();
            img.referrerPolicy = 'no-referrer';
            img.src = g.iconUrl;
            img.onload = () => { loadedImages[g.iconUrl] = img; };
          }

          const drawR = BASE_GIFT_R;
          if (img && img.complete && img.naturalWidth > 0) {
            tCtx.drawImage(img, -drawR, -drawR, drawR * 2, drawR * 2);
          } else {
            tCtx.beginPath();
            tCtx.arc(0, 0, drawR, 0, Math.PI * 2);
            tCtx.fillStyle = '#ff0050';
            tCtx.fill();
          }

          tCtx.restore();
        });

        // 3.1 DRAW DEBUG BRANCH POINTS
        if (settings.treeDebug) {
          tCtx.save();
          BRANCH_POINTS.forEach((pt, idx) => {
            // Draw a small bright green dot
            tCtx.beginPath();
            tCtx.arc(pt.x, pt.y, 4, 0, Math.PI * 2);
            tCtx.fillStyle = '#00f2fe'; // Neon Blue dot
            tCtx.strokeStyle = '#ffffff';
            tCtx.lineWidth = 1;
            tCtx.fill();
            tCtx.stroke();

            // Draw a red ring if occupied
            const isOccupied = activeGifts.some(g => g.branchIndex === idx);
            if (isOccupied) {
              tCtx.beginPath();
              tCtx.arc(pt.x, pt.y, 6.5, 0, Math.PI * 2);
              tCtx.strokeStyle = '#ff0050';
              tCtx.lineWidth = 1.5;
              tCtx.stroke();
            }

            // Draw label coordinates text next to it
            tCtx.fillStyle = '#ffffff';
            tCtx.font = 'bold 9px monospace';
            tCtx.shadowColor = '#000000';
            tCtx.shadowBlur = 3.5;
            tCtx.fillText(`#${idx} (${pt.x},${pt.y})`, pt.x + 7, pt.y + 3);
          });
          tCtx.restore();
        }

        // 4. DRAW FALLING GIFTS ON FULL-SCREEN CANVAS
        const fScale = dpr * 2;
        fCtx.setTransform(fScale, 0, 0, fScale, 0, 0);
        fCtx.clearRect(0, 0, fCanvas.width / fScale, fCanvas.height / fScale);
        fCtx.imageSmoothingEnabled = true;
        fCtx.imageSmoothingQuality = 'high';
        fallingGifts.forEach(g => {
          fCtx.save();
          fCtx.translate(g.x, g.y);
          fCtx.rotate(g.rotation);
          fCtx.globalAlpha = Math.max(0, g.opacity);

          fCtx.shadowColor = 'rgba(0, 0, 0, 0.25)';
          fCtx.shadowBlur = 5;

          let img = loadedImages[g.iconUrl];
          if (!img) {
            img = new Image();
            img.referrerPolicy = 'no-referrer';
            img.src = g.iconUrl;
            img.onload = () => { loadedImages[g.iconUrl] = img; };
          }

          const drawR = g.radius;
          if (img && img.complete && img.naturalWidth > 0) {
            fCtx.drawImage(img, -drawR, -drawR, drawR * 2, drawR * 2);
          } else {
            fCtx.beginPath();
            fCtx.arc(0, 0, drawR, 0, Math.PI * 2);
            fCtx.fillStyle = '#ff0050';
            fCtx.fill();
          }

          fCtx.restore();
        });

        animationFrameId = requestAnimationFrame(render);
      };

      animationFrameId = requestAnimationFrame(render);

      return () => {
        cancelAnimationFrame(animationFrameId);
      };
    }, [settings.treeEnabled, settings.treeScale, settings.treeGiftSize, settings.treeDebug]);

    const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;

    if (!settings.treeEnabled) return null;

    return (
      <>
        {/* Interactive Gift Tree */}
        <div
          className="absolute z-20 transition-all duration-300 pointer-events-none select-none bg-transparent border-none shadow-none"
          style={{
            left: `${settings.treeX !== undefined ? settings.treeX : 20}%`,
            top: `${settings.treeY !== undefined ? settings.treeY : 50}%`,
            transform: `scale(${settings.treeScale !== undefined ? settings.treeScale : 1.0})`,
            transformOrigin: 'top left',
            width: '400px',
            height: '400px',
            animation: 'treeSway 8s ease-in-out infinite',
          }}
        >
          {/* Custom CSS Animation for Tree Swaying */}
          <style dangerouslySetInnerHTML={{__html: `
            @keyframes treeSway {
              0%, 100% { transform: scale(${settings.treeScale !== undefined ? settings.treeScale : 1.0}) rotate(0deg); }
              50% { transform: scale(${settings.treeScale !== undefined ? settings.treeScale : 1.0}) rotate(0.8deg); }
            }
          `}} />

          {/* Layer 1: Bare Tree Image */}
          <img
            src="/tree.png"
            alt=""
            className="absolute inset-0 w-full h-full z-1 select-none pointer-events-none filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.3)]"
          />

          {/* Layer 2: Physics Canvas overlaying the tree (blooming gifts) */}
          <canvas
            ref={treeCanvasRef}
            width={400 * dpr * 2}
            height={400 * dpr * 2}
            style={{ width: '400px', height: '400px' }}
            className="absolute inset-0 z-2 bg-transparent"
          />
        </div>

        {/* Full-screen canvas for falling leaves/cascading gifts */}
        <canvas
          ref={fallingCanvasRef}
          className="absolute inset-0 z-21 pointer-events-none bg-transparent"
        />
      </>
    );
  }
);

GiftTreeOverlay.displayName = 'GiftTreeOverlay';
