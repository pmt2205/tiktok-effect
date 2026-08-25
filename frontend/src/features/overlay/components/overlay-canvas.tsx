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
        // Spawn from a random position within the jar neck (staggered vertically to avoid initial overlap)
        const spawnX = 120 + Math.random() * 80;
        const spawnY = -20 - i * 36;

        jarGifts.push({
          id: `${uniqueId}-${giftName}-${Date.now()}-${i}-${Math.random()}`,
          x: spawnX,
          y: spawnY,
          vx: (Math.random() - 0.5) * 0.8,   // tiny initial horizontal nudge for natural spread
          vy: 0.5 + Math.random() * 0.5,       // slow initial fall
          radius: 14,                           // collision radius (smaller than draw size for dense packing)
          iconUrl: icon,
          rotation: Math.random() * Math.PI * 2,
          angularVelocity: (Math.random() - 0.5) * 0.04,
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
      if (dbGift.sounds && dbGift.sounds.length > 0) {
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

  // Helper for Jar Bottom Ellipse Curve
  const getJarBottomY = (x: number): number => {
    const centerX = 160;
    const a = 122; // half of bottom width (282 - 38)
    const b = 24;  // bottom curve depth
    const dx = Math.min(1, Math.max(-1, (x - centerX) / a));
    return 334 + b * Math.sqrt(1 - dx * dx);
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
      const DRAW_R = 16;      // visual draw radius
      const COL_R = 14;       // collision radius (slightly tighter = denser packing)
      const GRAVITY = 0.28;
      const DAMPING = 0.92;   // velocity damping per frame (low = gentle)
      const FRICTION = 0.88;  // horizontal friction when touching floor/others
      const RESTITUTION = 0.05; // nearly zero bounce

      // --- Jar boundary helpers ---
      // Jar interior walls at canvas coords (x: 38..282, y neck at ~95, body at 334 bottom curve)
      const JAR_LEFT = 50;
      const JAR_RIGHT = 270;
      const JAR_NECK_Y = 95;   // Y where jar widens from neck to body
      const JAR_NECK_LEFT = 108;
      const JAR_NECK_RIGHT = 212;

      const getWallLeft = (y: number) => {
        if (y < JAR_NECK_Y) return JAR_NECK_LEFT;
        // linearly widen from neck to body between y=95 and y=170
        const t = Math.min(1, (y - JAR_NECK_Y) / 75);
        return JAR_NECK_LEFT - t * (JAR_NECK_LEFT - JAR_LEFT);
      };
      const getWallRight = (y: number) => {
        if (y < JAR_NECK_Y) return JAR_NECK_RIGHT;
        const t = Math.min(1, (y - JAR_NECK_Y) / 75);
        return JAR_NECK_RIGHT + t * (JAR_RIGHT - JAR_NECK_RIGHT);
      };

      // Check for jar cleared signal
      if (settingsState.jarClearedAt && settingsState.jarClearedAt > jarClearedAtRef.current) {
        jarGiftsRef.current = [];
        jarClearedAtRef.current = settingsState.jarClearedAt;
      }

      // === STEP 1: Apply gravity + damping to every unsettled particle ===
      gifts.forEach(p => {
        if (p.settled) return;
        p.vy += GRAVITY;
        p.vx *= DAMPING;
        p.vy *= DAMPING;
        p.rotation += p.angularVelocity;
        p.angularVelocity *= 0.96;
        p.x += p.vx;
        p.y += p.vy;
      });

      // === STEP 2: Wall & floor constraints ===
      gifts.forEach(p => {
        if (p.settled) return;

        const wallL = getWallLeft(p.y) + COL_R;
        const wallR = getWallRight(p.y) - COL_R;

        if (p.x < wallL) {
          p.x = wallL;
          p.vx = Math.abs(p.vx) * RESTITUTION;
        } else if (p.x > wallR) {
          p.x = wallR;
          p.vx = -Math.abs(p.vx) * RESTITUTION;
        }

        const floorY = getJarBottomY(p.x) - COL_R;
        if (p.y >= floorY) {
          p.y = floorY;
          p.vy = -Math.abs(p.vy) * RESTITUTION;
          p.vx *= FRICTION;
          // Settle if barely moving
          if (Math.abs(p.vy) < 0.15 && Math.abs(p.vx) < 0.15) {
            p.settled = true;
            p.vx = 0; p.vy = 0;
            p.angularVelocity = 0;
          }
        }
      });

      // === STEP 3: Particle-to-particle collision (position-based, multiple iterations) ===
      // Process from bottom-most to top-most so settled lower particles act as stable ground
      const sorted = [...gifts].sort((a, b) => b.y - a.y);
      const ITER = 3;
      for (let iter = 0; iter < ITER; iter++) {
        for (let i = 0; i < sorted.length; i++) {
          for (let j = i + 1; j < sorted.length; j++) {
            const a = sorted[i]; // lower (more stable)
            const b = sorted[j]; // higher

            const dx = b.x - a.x;
            const dy = b.y - a.y;
            const distSq = dx * dx + dy * dy;
            const minD = COL_R * 2;
            if (distSq >= minD * minD || distSq === 0) continue;

            const dist = Math.sqrt(distSq);
            const overlap = minD - dist;
            const nx = dx / dist;
            const ny = dy / dist;

            // Lower (a) barely moves; upper (b) gets pushed away almost entirely
            const aRatio = a.settled ? 0 : 0.05;
            const bRatio = a.settled ? 1 : 0.95;

            a.x -= nx * overlap * aRatio;
            a.y -= ny * overlap * aRatio;
            b.x += nx * overlap * bRatio;
            b.y += ny * overlap * bRatio;

            // Wake up lower particle if it was settled and got disturbed
            if (!a.settled) {
              const relVx = b.vx - a.vx;
              const relVy = b.vy - a.vy;
              const velN = relVx * nx + relVy * ny;
              if (velN < 0) {
                const imp = velN * RESTITUTION;
                a.vx += nx * imp * aRatio;
                a.vy += ny * imp * aRatio;
                b.vx -= nx * imp * bRatio;
                b.vy -= ny * imp * bRatio;
              }
            }

            // Unsettled b: small lateral nudge to slide off round shoulder of a
            if (!b.settled && Math.abs(ny) > 0.3) {
              b.vx += nx * 0.1;  // slide in direction away from a center
            }

            // Mark b as unsettled since it was just pushed
            if (b.settled && bRatio > 0.5) {
              b.settled = false;
              b.vy = overlap * 0.1;
            }
          }
        }
      }

      // === STEP 4: Re-clamp after collision resolution ===
      gifts.forEach(p => {
        const wallL = getWallLeft(p.y) + COL_R;
        const wallR = getWallRight(p.y) - COL_R;
        p.x = Math.max(wallL, Math.min(wallR, p.x));
        const floorY = getJarBottomY(p.x) - COL_R;
        if (p.y > floorY) { p.y = floorY; }
      });

      // === STEP 5: Draw ===
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      gifts.forEach(p => {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);

        ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
        ctx.shadowBlur = 5;

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
          {/* Layer 1: Physics Canvas inside the jar container */}
          <canvas
            ref={jarCanvasRef}
            width={320}
            height={380}
            className="absolute inset-0 z-1 bg-transparent"
          />
          {/* Layer 2: Jar transparent image on top of canvas */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/jar_transparent.png"
            alt=""
            className="absolute inset-0 w-full h-full object-contain z-2 select-none pointer-events-none filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.35)]"
          />
        </div>
      )}
    </>
  );
}
