'use client';

import React, { useEffect, useRef, useCallback, useState, useMemo } from 'react';
import { ParticleEngine } from '../particles/particle-engine';
import { GiftEvent, OverlaySettings, GiftMappings, BannerInfo, Gift } from '@/types';
import { DEFAULT_SETTINGS, DEFAULT_MAPPINGS, WS_URL, BACKEND_URL } from '@/lib/constants';
import { io } from 'socket.io-client';

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
}

export default function OverlayCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<ParticleEngine | null>(null);
  const settingsRef = useRef<OverlaySettings>({ ...DEFAULT_SETTINGS });
  const mappingsRef = useRef<GiftMappings>({ ...DEFAULT_MAPPINGS });
  const giftsRef = useRef<Gift[]>([]);
  const [settingsState, setSettingsState] = useState<OverlaySettings>({ ...DEFAULT_SETTINGS });
  const [giftsList, setGiftsList] = useState<Gift[]>([]);
  const bannersRef = useRef<Map<string, BannerInfo>>(new Map());
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const jarCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const jarGiftsRef = useRef<JarGift[]>([]);
  const jarClearedAtRef = useRef<number>(0);

  const removeBanner = (key: string) => {
    const bannerInfo = bannersRef.current.get(key);
    if (!bannerInfo) return;
    clearTimeout(bannerInfo.timer);
    const el = bannerInfo.bannerEl;
    if (el) {
      el.classList.add('fade-out');
      bannersRef.current.delete(key);
      setTimeout(() => {
        el.parentNode?.removeChild(el);
      }, 450);
    }
  };

  const handleGift = useCallback((giftData: GiftEvent) => {
    const { nickname, uniqueId, giftName, repeatCount, giftPictureUrl, profilePictureUrl, diamondCount } = giftData;
    const bannerKey = `${uniqueId}_${giftName}`;
    const settings = settingsRef.current;
    const mappings = mappingsRef.current;

    // Add to Gift Jar if enabled
    if (settings.jarEnabled) {
      const jarGifts = jarGiftsRef.current;
      const icon = giftPictureUrl || 'https://sf16-website-nos.sofproxy.com/obj/tiktok-web-tx/tiktok/web/gift/rose.png';

      const spawnCount = Math.min(10, repeatCount || 1);

      for (let i = 0; i < spawnCount; i++) {
        // Spawn across the full neck width with random horizontal velocity so icons spread naturally
        const neckLeft = 115;
        const neckRight = 205;
        const spawnX = neckLeft + Math.random() * (neckRight - neckLeft);
        const spawnY = -20 - i * 30;

        jarGifts.push({
          id: `${uniqueId}-${giftName}-${Date.now()}-${i}-${Math.random()}`,
          x: spawnX,
          y: spawnY,
          vx: (Math.random() - 0.5) * 2.5,    // wider random horizontal drift
          vy: 0.5 + Math.random() * 1.0,
          radius: 14,
          iconUrl: icon,
          rotation: Math.random() * Math.PI * 2,
          angularVelocity: (Math.random() - 0.5) * 0.06,
          opacity: 1.0,
          createdAt: Date.now(),
          settled: false,
          targetY: 0,
        });

        // Cap at 300 items to preserve 60fps
        if (jarGifts.length > 300) jarGifts.shift();
      }
    }

    // Check if this is a duplicate repeat count for an ongoing streak (only for real, non-simulated events)
    if (!giftData.isSimulated && bannersRef.current.has(bannerKey)) {
      const info = bannersRef.current.get(bannerKey)!;
      if (repeatCount === info.combo && !info.lastRepeatEnd) {
        // Just refresh the duration timer for the existing banner so it doesn't expire early
        clearTimeout(info.timer);
        info.timer = setTimeout(() => removeBanner(bannerKey), settings.duration * 1000);
        info.lastRepeatEnd = !!giftData.repeatEnd;
        return;
      }
    }

    // Lookup gift mapping
    const giftKey = giftName.toLowerCase().trim();
    const idKey = giftData.giftId ? giftData.giftId.toString() : '';
    let mappedEffect = 'sparkle';
    let videoUrl = '';
    let soundUrl = '';
    let hasDatabaseGift = false;

    // 1. Check custom database gifts first
    const dbGift = giftsRef.current.find(
      (g) => (giftData.giftId !== undefined && Number(g.giftId) === Number(giftData.giftId)) ||
        g.name.toLowerCase().trim() === giftKey ||
        (giftKey === 'rose' && g.name.toLowerCase().trim() === 'hoa hồng') ||
        (giftKey === 'tiktok' && g.name.toLowerCase().trim() === 'logo tiktok')
    );

    if (dbGift) {
      hasDatabaseGift = true;
      if (dbGift.videos && dbGift.videos.length > 0) {
        videoUrl = dbGift.activeVideo || dbGift.videos[0];
      }
      if (dbGift.activeSound) {
        soundUrl = dbGift.activeSound;
      } else if (dbGift.sounds && dbGift.sounds.length > 0) {
        if (dbGift.sounds.length === 1) {
          soundUrl = dbGift.sounds[0];
        } else {
          const randIdx = Math.floor(Math.random() * dbGift.sounds.length);
          soundUrl = dbGift.sounds[randIdx];
        }
      }
    }

    // 2. Fallback to settings mappings
    else if (mappings[giftKey]) {
      mappedEffect = mappings[giftKey].effect;
      videoUrl = mappings[giftKey].videoUrl || '';
    } else if (idKey && mappings[idKey]) {
      mappedEffect = mappings[idKey].effect;
      videoUrl = mappings[idKey].videoUrl || '';
    }
    // 3. Fallback to hardcoded defaults
    else {
      if (giftKey.includes('rose') || giftKey.includes('hồng')) {
        mappedEffect = 'video';
        videoUrl = 'rose.mp4';
      } else if (giftKey.includes('tiktok')) {
        mappedEffect = 'video';
        videoUrl = 'tiktok.mp4';
      } else if (giftKey.includes('galaxy') || giftKey.includes('vũ trụ')) {
        mappedEffect = 'star';
      } else if (diamondCount >= 500) {
        mappedEffect = 'star';
      }
    }

    // Trigger visual effect
    if (engineRef.current) {
      const fullSoundUrl = soundUrl
        ? (soundUrl.startsWith('http://') || soundUrl.startsWith('https://') ? soundUrl : `${BACKEND_URL}/media/${soundUrl}`)
        : undefined;

      if (hasDatabaseGift && videoUrl) {
        const fullVideoUrl = videoUrl.startsWith('http://') || videoUrl.startsWith('https://')
          ? videoUrl
          : `${BACKEND_URL}/media/${videoUrl}`;
        engineRef.current.playVideoEffect(fullVideoUrl, fullSoundUrl);
      } else if (mappedEffect === 'video' && videoUrl) {
        const fullVideoUrl = videoUrl.startsWith('http://') || videoUrl.startsWith('https://')
          ? videoUrl
          : `${BACKEND_URL}/media/${videoUrl}`;
        engineRef.current.playVideoEffect(fullVideoUrl, fullSoundUrl);
      } else {
        engineRef.current.spawnParticlesForGift(mappedEffect, repeatCount, settings);
        if (fullSoundUrl) {
          const audio = new Audio(fullSoundUrl);
          audio.play().catch(err => console.warn('Failed to play sound without video:', err));
        }
      }
    }

    // Banner management
    const container = containerRef.current;
    if (!container) return;

    if (bannersRef.current.has(bannerKey)) {
      // Update existing banner
      const info = bannersRef.current.get(bannerKey)!;
      clearTimeout(info.timer);
      info.combo = repeatCount;
      info.lastRepeatEnd = !!giftData.repeatEnd;

      const badge = info.bannerEl?.querySelector('.combo-badge');
      if (badge) {
        badge.textContent = `x${repeatCount}`;
        badge.classList.remove('pulse');
        void (badge as HTMLElement).offsetWidth;
        badge.classList.add('pulse');
      }

      info.timer = setTimeout(() => removeBanner(bannerKey), settings.duration * 1000);
    } else {
      // Create new banner
      if (bannersRef.current.size >= 3) {
        const oldestKey = bannersRef.current.keys().next().value;
        if (oldestKey) removeBanner(oldestKey);
      }

      const avatarSrc = profilePictureUrl || 'https://www.tiktok.com/favicon.ico';
      const giftIconSrc = giftPictureUrl || 'https://sf16-website-nos.sofproxy.com/obj/tiktok-web-tx/tiktok/web/gift/rose.png';

      const bannerEl = document.createElement('div');
      bannerEl.className = `gift-card theme-${settings.theme}`;
      bannerEl.innerHTML = `
        <div class="avatar-container">
          <img src="${avatarSrc}" class="avatar-image" onerror="this.src='https://i.pravatar.cc/100'" />
        </div>
        <div class="user-info">
          <span class="nickname">${nickname}</span>
          <span class="gift-action">Sent <strong>${giftName}</strong></span>
        </div>
        <div class="gift-icon-container">
          <img src="${giftIconSrc}" class="gift-icon" onerror="this.src='https://cdn4.dps.vc/iblock/f59/f5902abbd13178017285a308606fd0dd/cf6a40558018965a8171cf5a575dd9de.png'" />
        </div>
        <div class="combo-badge pulse">x${repeatCount}</div>
      `;

      container.appendChild(bannerEl);

      const timer = setTimeout(() => removeBanner(bannerKey), settings.duration * 1000);
      bannersRef.current.set(bannerKey, { bannerEl, timer, combo: repeatCount, lastRepeatEnd: !!giftData.repeatEnd });
    }
  }, []);

  useEffect(() => {
    // Load settings from localStorage
    try {
      const savedSettings = localStorage.getItem('tiktok_overlay_settings');
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        settingsRef.current = { ...settingsRef.current, ...parsed };
        setSettingsState(settingsRef.current);
      }
      const savedMappings = localStorage.getItem('tiktok_overlay_mappings');
      if (savedMappings) mappingsRef.current = JSON.parse(savedMappings);
    } catch (e) {
      console.error('Failed to load saved settings:', e);
    }

    const searchParams = new URLSearchParams(window.location.search);
    const username = searchParams.get('user') || searchParams.get('username') || '';

    // Fetch initial custom database gifts
    fetch(`${BACKEND_URL}/api/gifts?username=${username}`)
      .then((res) => res.json())
      .then((data) => {
        giftsRef.current = data;
        setGiftsList(data);
      })
      .catch((e) => console.error('Failed to load custom gifts from database in overlay:', e));

    // Initialize engines
    if (canvasRef.current) {
      engineRef.current = new ParticleEngine(canvasRef.current);
      engineRef.current.start();


    }

    // Connect to WebSocket
    const socket = io(WS_URL, {
      transports: ['websocket', 'polling'],
      query: { username },
      reconnection: true,
      reconnectionDelay: 3000,
    });

    socket.on('event', (packet: { type: string; data: unknown }) => {
      if (packet.type === 'gift') {
        handleGift(packet.data as GiftEvent);
      } else if (packet.type === 'settings-update') {
        const newSettings = { ...settingsRef.current, ...(packet.data as Partial<OverlaySettings>) };
        settingsRef.current = newSettings;
        localStorage.setItem('tiktok_overlay_settings', JSON.stringify(newSettings));
        setSettingsState(newSettings);
      } else if (packet.type === 'mappings-update') {
        mappingsRef.current = packet.data as GiftMappings;
        localStorage.setItem('tiktok_overlay_mappings', JSON.stringify(mappingsRef.current));
      } else if (packet.type === 'gifts-update') {
        const newGifts = (packet.data as Gift[]) || [];
        giftsRef.current = newGifts;
        setGiftsList(newGifts);
      }
    });

    // Cross-tab sync
    const handleStorage = (event: StorageEvent) => {
      if (event.key === 'tiktok_overlay_settings' && event.newValue) {
        const parsed = JSON.parse(event.newValue);
        settingsRef.current = parsed;
        setSettingsState(parsed);
      }
      if (event.key === 'tiktok_overlay_mappings' && event.newValue) {
        mappingsRef.current = JSON.parse(event.newValue);
      }
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      engineRef.current?.stop();
      socket.disconnect();
      window.removeEventListener('storage', handleStorage);
    };
  }, [handleGift]);

  const isHorizontal = settingsState.menuLayout === 'horizontal';
  const scrollThreshold = isHorizontal ? 5 : 10;

  const menuGifts = useMemo(() => {
    return giftsList.filter(g => g.menuShow !== false && g.menuText && g.menuText.trim() !== '');
  }, [giftsList]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || menuGifts.length <= scrollThreshold) return;

    // Reset scroll offsets when changing modes
    container.scrollTop = 0;
    container.scrollLeft = 0;

    let animationFrameId: number;
    let scrollTop = container.scrollTop;
    let scrollLeft = container.scrollLeft;
    const speed = 1.5; // Tốc độ cuộn

    const scroll = () => {
      if (isHorizontal) {
        scrollLeft += speed;
        const firstGrid = container.firstElementChild as HTMLElement;
        if (firstGrid) {
          const gridWidth = firstGrid.offsetWidth;
          const gap = 32; // tương ứng với gap-8 (2rem = 32px)
          const cycleWidth = gridWidth + gap;

          if (scrollLeft >= cycleWidth) {
            scrollLeft = 0;
          }
        }
        container.scrollLeft = scrollLeft;
      } else {
        scrollTop += speed;
        const firstGrid = container.firstElementChild as HTMLElement;
        if (firstGrid) {
          const gridHeight = firstGrid.offsetHeight;
          const gap = 20; // tương ứng với gap-5 (1.25rem = 20px)
          const cycleHeight = gridHeight + gap;

          if (scrollTop >= cycleHeight) {
            scrollTop = 0;
          }
        }
        container.scrollTop = scrollTop;
      }
      animationFrameId = requestAnimationFrame(scroll);
    };

    animationFrameId = requestAnimationFrame(scroll);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [menuGifts, settingsState.menuColumns, settingsState.menuLayout, isHorizontal, scrollThreshold]);

  // Helper for Jar Bottom Ellipse Curve (jarType-aware)
  const getJarBottomY = (x: number, jarType?: string): number => {
    if (jarType === 'promax') {
      const a = 80, b = 35, cy = 231;
      const dx = Math.min(1, Math.max(-1, (x - 160) / a));
      return cy + b * Math.sqrt(1 - dx * dx);
    }
    // Standard / Pro jar: asymmetric bottom curve
    // Left side (x<160): a=137 matches measured L at y=345 → x=55
    // Right side (x>=160): a=100 matches measured R at y=325 → x=265
    const a = x < 160 ? 137 : 100;
    const dx = Math.min(1, Math.max(-1, (x - 160) / a));
    return 305 + 63 * Math.sqrt(1 - dx * dx);
  };

  // Gift Jar Physics simulation
  useEffect(() => {
    if (!settingsState.jarEnabled) {
      jarGiftsRef.current = [];
      return;
    }

    const canvas = jarCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    const loadedImages: Record<string, HTMLImageElement> = {};

    const updatePhysics = () => {
      const gifts = jarGiftsRef.current;
      const sizeMultiplier = settingsRef.current.jarGiftSize !== undefined ? settingsRef.current.jarGiftSize : 1.0;
      const speedMultiplier = settingsRef.current.jarFallSpeed !== undefined ? settingsRef.current.jarFallSpeed : 1.0;
      const DRAW_R = 16 * sizeMultiplier;
      const COL_R = 13 * sizeMultiplier;
      const GRAVITY = 0.22 * speedMultiplier;
      const LIN_DAMP = 0.985;
      const ANG_DAMP = 0.80;     // stronger angular damping to kill spinning sooner
      const ANG_CUTOFF = 0.01;   // higher cutoff to stop micro-spin at rest
      const RESTITUTION = 0.08;  // slight bounce on walls / floor
      const WALL_BOUNCE = 0.15;  // wall bounciness
      const FLOOR_FRICTION = 0.82; // horizontal friction on floor contact
      const SETTLE_VEL = 0.08;   // velocity threshold below which icon is considered nearly still

      // --- Jar boundary helpers (measured from actual images) ---
      const currentJarType = settingsRef.current.jarType || 'standard';
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
        // Standard / Pro — measured: body L≈47, neck taper y=100-130, bottom curve y=305+
        let wL: number;
        if (y < 100) {
          wL = 74; // under lid/ring — narrow opening
        } else if (y < 130) {
          const t = Math.min(1, (y - 100) / 30);
          wL = 74 - t * (74 - 47);  // taper from 74 to 47
        } else {
          wL = 47;  // straight body
        }
        // Bottom curve: ellipse kicks in from y=305
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
        // Standard / Pro — measured: body R≈256, neck taper y=100-130, bottom curve y=305+
        let wR: number;
        if (y < 100) {
          wR = 248; // under lid/ring — narrow opening
        } else if (y < 130) {
          const t = Math.min(1, (y - 100) / 30);
          wR = 248 + t * (256 - 248);  // taper from 248 to 256
        } else {
          wR = 256;  // straight body
        }
        // Bottom curve: ellipse kicks in from y=305
        if (y >= 305) {
          const dy = (y - 305) / 63;
          if (dy < 1) wR = Math.min(wR, 160 + 100 * Math.sqrt(1 - dy * dy));
        }
        return wR;
      };

      // Check for jar cleared signal
      if (settingsState.jarClearedAt && settingsState.jarClearedAt > jarClearedAtRef.current) {
        jarGiftsRef.current = [];
        jarClearedAtRef.current = settingsState.jarClearedAt;
      }

      // === STEP 1: Integrate every particle ===
      // No "settled" freeze — every icon is always alive, just slows down via damping.
      gifts.forEach(p => {
        p.vy += GRAVITY;
        p.vx *= LIN_DAMP;
        p.vy *= LIN_DAMP;
        p.angularVelocity *= ANG_DAMP;
        // Hard cutoff — stop micro-spinning that never fully dies out
        if (Math.abs(p.angularVelocity) < ANG_CUTOFF) p.angularVelocity = 0;
        p.rotation += p.angularVelocity;
        p.x += p.vx;
        p.y += p.vy;
      });

      // === STEP 2: Wall & floor constraints ===
      gifts.forEach(p => {
        const wallL = getWallLeft(p.y) + DRAW_R;
        const wallR = getWallRight(p.y) - DRAW_R;

        if (p.x < wallL) {
          p.x = wallL;
          const speed = Math.abs(p.vx);
          p.vx = speed * WALL_BOUNCE;
          // Only kick spin on significant wall hit (not tiny resting contact)
          if (speed > 0.5) p.angularVelocity += (Math.random() - 0.5) * speed * 0.03;
        } else if (p.x > wallR) {
          p.x = wallR;
          const speed = Math.abs(p.vx);
          p.vx = -speed * WALL_BOUNCE;
          if (speed > 0.5) p.angularVelocity += (Math.random() - 0.5) * speed * 0.03;
        }

        const floorY = getJarBottomY(p.x, currentJarType) - COL_R;
        if (p.y >= floorY) {
          p.y = floorY;
          const impactVy = Math.abs(p.vy);
          p.vy = -impactVy * RESTITUTION;
          p.vx *= FLOOR_FRICTION;
          // Kill tiny vertical oscillations
          if (Math.abs(p.vy) < SETTLE_VEL) p.vy = 0;
          // Aggressively damp spin when resting on floor — no floor-to-spin conversion
          p.angularVelocity *= 0.75;
          if (Math.abs(p.angularVelocity) < ANG_CUTOFF) p.angularVelocity = 0;
        }
      });

      // === STEP 3: Impulse-based particle-to-particle collision ===
      // Two passes to reduce jitter without the old sorted-pyramid approach
      const ITER = 4;
      for (let iter = 0; iter < ITER; iter++) {
        for (let i = 0; i < gifts.length; i++) {
          for (let j = i + 1; j < gifts.length; j++) {
            const a = gifts[i];
            const b = gifts[j];

            const dx = b.x - a.x;
            const dy = b.y - a.y;
            const distSq = dx * dx + dy * dy;
            const minD = COL_R * 2;
            if (distSq >= minD * minD || distSq === 0) continue;

            const dist = Math.sqrt(distSq);
            const overlap = minD - dist;
            const nx = dx / dist;
            const ny = dy / dist;

            // Position correction (Baumgarte stabilization) — resolve 20% of overlap per frame
            // to prevent explosive overshoots in packed stacks
            const push = overlap * 0.20;
            a.x -= nx * push;
            a.y -= ny * push;
            b.x += nx * push;
            b.y += ny * push;

            // Velocity impulse along normal
            const relVx = b.vx - a.vx;
            const relVy = b.vy - a.vy;
            const velAlongN = relVx * nx + relVy * ny;

            if (velAlongN < 0) {
              // Resting contact threshold: set restitution to 0 for very slow contacts
              // to prevent resting particles from bouncing off each other
              const restitution = Math.abs(velAlongN) < 0.25 ? 0.0 : 0.15;
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

      // === STEP 4: Re-clamp positions after collision resolution ===
      gifts.forEach(p => {
        const wallL = getWallLeft(p.y) + DRAW_R;
        const wallR = getWallRight(p.y) - DRAW_R;
        p.x = Math.max(wallL, Math.min(wallR, p.x));
        const floorY = getJarBottomY(p.x, currentJarType) - COL_R;
        if (p.y >= floorY) {
          p.y = floorY;
          // Damp velocities at the end of the frame to dissolve any collision jitter
          p.vx *= 0.80;
          p.vy = 0;
          if (Math.abs(p.vx) < 0.1) p.vx = 0;
        }
      });

      // === STEP 5: Draw ===
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      gifts.forEach(p => {
        ctx.save();
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
  }, [settingsState.jarEnabled, settingsState.jarClearedAt]);

  const jarImages = useMemo(() => {
    const jarType = settingsState.jarType || 'standard';

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
  }, [settingsState.jarType]);

  return (
    <>
      <canvas id="effect-canvas" ref={canvasRef} className="absolute inset-0 z-1 pointer-events-none bg-transparent" />
      <div id="notification-container" className="absolute top-[20%] left-10 w-[450px] z-10 flex flex-col gap-3.5 pointer-events-none" ref={containerRef} />

      {/* Real-time Gift Menu Overlay (No box, only floating title, icons, and streamer challenge text) */}
      {settingsState.menuEnabled && menuGifts.length > 0 && (
        <div
          className={`absolute z-20 animate-[fade-in-up_0.5s_ease-out] transition-all duration-300 pointer-events-none select-none bg-transparent border-none shadow-none flex flex-col gap-4 ${isHorizontal ? 'items-center text-center' : 'items-start'
            }`}
          style={{
            left: `${settingsState.menuX !== undefined ? settingsState.menuX : 15}%`,
            top: `${settingsState.menuY !== undefined ? settingsState.menuY : 20}%`,
            transform: `scale(${settingsState.menuScale !== undefined ? settingsState.menuScale : 1.0})`,
            transformOrigin: 'top left',
            width: isHorizontal ? '1000px' : (settingsState.menuColumns === 2 ? '800px' : '400px'),
          }}
        >
          {/* Title Header */}
          <div
            className={`flex flex-col select-none shrink-0 w-full ${isHorizontal ? 'items-center justify-center' : 'items-start'
              }`}
          >
            <h3
              className="font-header text-[1.8rem] font-extrabold text-white uppercase tracking-[2.5px] flex items-center gap-2.5 text-center"
              style={{
                textShadow: settingsState.theme === 'cyberpunk'
                  ? '0 2px 6px rgba(0,0,0,0.95), 0 0 10px rgba(255, 0, 80, 0.6)'
                  : '0 2px 6px rgba(0,0,0,0.95), 0 0 10px rgba(0, 242, 254, 0.6)'
              }}
            >
              {settingsState.menuTitle || ' '}
            </h3>
          </div>

          {/* List items container with auto-scroll if items > threshold */}
          <div
            ref={scrollContainerRef}
            className={`min-w-0 w-full overflow-hidden flex ${isHorizontal ? 'flex-row items-center gap-8 justify-center' : 'flex-col gap-5'
              }`}
            style={{
              maxHeight: isHorizontal
                ? 'none'
                : (menuGifts.length > scrollThreshold
                  ? (settingsState.menuColumns === 2 ? '380px' : '760px')
                  : 'none'),
              // Premium fade effect using mask-image
              maskImage: menuGifts.length > scrollThreshold
                ? (isHorizontal
                  ? 'linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%)'
                  : 'linear-gradient(to bottom, transparent 0%, black 8%, black 92%, transparent 100%)')
                : 'none',
              WebkitMaskImage: menuGifts.length > scrollThreshold
                ? (isHorizontal
                  ? 'linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%)'
                  : 'linear-gradient(to bottom, transparent 0%, black 8%, black 92%, transparent 100%)')
                : 'none',
            }}
          >
            {/* Grid/Flex 1 (Original List) */}
            <div
              className={`shrink-0 ${isHorizontal
                ? 'flex flex-row items-center gap-8'
                : `grid gap-y-5 gap-x-8 ${settingsState.menuColumns === 2 ? 'grid-cols-2' : 'grid-cols-1'}`
                }`}
            >
              {menuGifts.map((gift) => (
                <div
                  key={gift._id}
                  className="flex items-center gap-4.5 transition-all duration-200 select-none bg-transparent border-none shadow-none"
                >
                  <div className="w-14 h-14 shrink-0 flex items-center justify-center relative filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={gift.icon}
                      alt=""
                      className="w-11 h-11 object-contain animate-gift-bob"
                    />
                  </div>
                  <div className="grow min-w-0 font-body flex items-center">
                    <span
                      className="text-[1.35rem] font-extrabold text-white tracking-[0.5px] leading-snug truncate"
                      style={{
                        textShadow: settingsState.theme === 'cyberpunk'
                          ? '0 2px 4px rgba(0,0,0,0.95), 0 0 8px rgba(255, 0, 80, 0.5)'
                          : '0 2px 4px rgba(0,0,0,0.95), 0 0 8px rgba(0, 242, 254, 0.5)'
                      }}
                    >
                      {gift.menuText}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Grid/Flex 2 (Duplicated List for infinite scroll loop) */}
            {menuGifts.length > scrollThreshold && (
              <div
                className={`shrink-0 ${isHorizontal
                  ? 'flex flex-row items-center gap-8'
                  : `grid gap-y-5 gap-x-8 ${settingsState.menuColumns === 2 ? 'grid-cols-2' : 'grid-cols-1'}`
                  }`}
              >
                {menuGifts.map((gift) => (
                  <div
                    key={`${gift._id}-dup`}
                    className="flex items-center gap-4.5 transition-all duration-200 select-none bg-transparent border-none shadow-none"
                  >
                    <div className="w-14 h-14 shrink-0 flex items-center justify-center relative filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={gift.icon}
                        alt=""
                        className="w-11 h-11 object-contain animate-gift-bob"
                      />
                    </div>
                    <div className="grow min-w-0 font-body flex items-center">
                      <span
                        className="text-[1.35rem] font-extrabold text-white tracking-[0.5px] leading-snug truncate"
                        style={{
                          textShadow: settingsState.theme === 'cyberpunk'
                            ? '0 2px 4px rgba(0,0,0,0.95), 0 0 8px rgba(255, 0, 80, 0.5)'
                            : '0 2px 4px rgba(0,0,0,0.95), 0 0 8px rgba(0, 242, 254, 0.5)'
                        }}
                      >
                        {gift.menuText}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Interactive Gift Jar */}
      {settingsState.jarEnabled && (
        <div
          className="absolute z-25 transition-all duration-300 pointer-events-none select-none bg-transparent border-none shadow-none"
          style={{
            left: `${settingsState.jarX !== undefined ? settingsState.jarX : 75}%`,
            top: `${settingsState.jarY !== undefined ? settingsState.jarY : 50}%`,
            transform: `scale(${settingsState.jarScale !== undefined ? settingsState.jarScale : 1.0})`,
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
                  backgroundColor: settingsState.jarColor || '#ffffff',
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
          <canvas
            ref={jarCanvasRef}
            width={320}
            height={380}
            className="absolute inset-0 z-2 bg-transparent"
          />

          {/* Layer 3: Jar Foreground (Front bottom glass thickness overlay) */}
          {jarImages.colorized ? (
            <div className="absolute inset-0 w-full h-full pointer-events-none z-3" style={{ isolation: 'isolate' }}>
              <img
                src={jarImages.front}
                alt=""
                className="absolute inset-0 w-full h-full object-contain"
              />
              <div 
                className="absolute inset-0 w-full h-full"
                style={{
                  backgroundColor: settingsState.jarColor || '#ffffff',
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
      )}
    </>
  );
}
