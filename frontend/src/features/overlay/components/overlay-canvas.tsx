'use client';

import React, { useEffect, useRef, useCallback, useState } from 'react';
import { ParticleEngine } from '../particles/particle-engine';
import { GiftEvent, OverlaySettings, GiftMappings, BannerInfo, Gift } from '@/types';
import { DEFAULT_SETTINGS, DEFAULT_MAPPINGS, WS_URL, BACKEND_URL } from '@/lib/constants';
import { io } from 'socket.io-client';

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
    let hasDatabaseGift = false;

    // 1. Check custom database gifts first
    const dbGift = giftsRef.current.find(
      (g) => (giftData.giftId !== undefined && Number(g.giftId) === Number(giftData.giftId)) || 
             g.name.toLowerCase().trim() === giftKey ||
             (giftKey === 'rose' && g.name.toLowerCase().trim() === 'hoa hồng') ||
             (giftKey === 'tiktok' && g.name.toLowerCase().trim() === 'logo tiktok')
    );

    if (dbGift && dbGift.videos && dbGift.videos.length > 0) {
      hasDatabaseGift = true;
      // Use the active video, or fallback to the first video in the list
      videoUrl = dbGift.activeVideo || dbGift.videos[0];
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
      if (hasDatabaseGift && videoUrl) {
        const fullVideoUrl = videoUrl.startsWith('http://') || videoUrl.startsWith('https://')
          ? videoUrl
          : `${BACKEND_URL}/media/${videoUrl}`;
        engineRef.current.playVideoEffect(fullVideoUrl);
      } else if (mappedEffect === 'video' && videoUrl) {
        const fullVideoUrl = videoUrl.startsWith('http://') || videoUrl.startsWith('https://')
          ? videoUrl
          : `${BACKEND_URL}/media/${videoUrl}`;
        engineRef.current.playVideoEffect(fullVideoUrl);
      } else {
        engineRef.current.spawnParticlesForGift(mappedEffect, repeatCount, settings);
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

  const menuGifts = giftsList.filter(g => g.menuShow !== false && g.menuText && g.menuText.trim() !== '');

  return (
    <>
      <canvas id="effect-canvas" ref={canvasRef} className="absolute inset-0 z-1 pointer-events-none bg-transparent" />
      <div id="notification-container" className="absolute top-[20%] left-10 w-[450px] z-10 flex flex-col gap-3.5 pointer-events-none" ref={containerRef} />

      {/* Real-time Gift Menu Overlay (No box, only floating title, icons, and streamer challenge text) */}
      {settingsState.menuEnabled && menuGifts.length > 0 && (
        <div
          className="absolute z-20 flex flex-col gap-4 animate-[fade-in-up_0.5s_ease-out] transition-all duration-300 pointer-events-none select-none bg-transparent border-none shadow-none"
          style={{
            left: `${settingsState.menuX !== undefined ? settingsState.menuX : 15}%`,
            top: `${settingsState.menuY !== undefined ? settingsState.menuY : 20}%`,
            transform: `scale(${settingsState.menuScale !== undefined ? settingsState.menuScale : 1.0})`,
            transformOrigin: 'top left',
            width: settingsState.menuColumns === 2 ? '800px' : '400px',
          }}
        >
          {/* Title Header */}
          <div className="flex flex-col select-none">
            <h3 
              className="font-header text-[1.8rem] font-extrabold text-white uppercase tracking-[2.5px] flex items-center gap-2.5"
              style={{
                textShadow: settingsState.theme === 'cyberpunk'
                  ? '0 2px 6px rgba(0,0,0,0.95), 0 0 10px rgba(255, 0, 80, 0.6)'
                  : '0 2px 6px rgba(0,0,0,0.95), 0 0 10px rgba(0, 242, 254, 0.6)'
              }}
            >
              <span className={`text-[1.1rem] ${settingsState.theme === 'cyberpunk' ? 'text-primary' : 'text-secondary'} animate-pulse`}>✦</span>
              {settingsState.menuTitle || 'MENU QUÀ TẶNG'}
              <span className={`text-[1.1rem] ${settingsState.theme === 'cyberpunk' ? 'text-primary' : 'text-secondary'} animate-pulse`}>✦</span>
            </h3>
          </div>

          {/* List items */}
          <div
            className={`grid gap-y-5 gap-x-8 ${
              settingsState.menuColumns === 2 ? 'grid-cols-2' : 'grid-cols-1'
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
        </div>
      )}
    </>
  );
}
