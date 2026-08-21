'use client';

import React, { useEffect, useRef, useCallback } from 'react';
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
          <img src="${giftIconSrc}" class="gift-icon" onerror="this.src='https://sf16-website-nos.sofproxy.com/obj/tiktok-web-tx/tiktok/web/gift/rose.png'" />
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
      if (savedSettings) settingsRef.current = { ...settingsRef.current, ...JSON.parse(savedSettings) };
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
        settingsRef.current = { ...settingsRef.current, ...(packet.data as Partial<OverlaySettings>) };
        localStorage.setItem('tiktok_overlay_settings', JSON.stringify(settingsRef.current));
      } else if (packet.type === 'mappings-update') {
        mappingsRef.current = packet.data as GiftMappings;
        localStorage.setItem('tiktok_overlay_mappings', JSON.stringify(mappingsRef.current));
      } else if (packet.type === 'gifts-update') {
        giftsRef.current = (packet.data as Gift[]) || [];
      }
    });

    // Cross-tab sync
    const handleStorage = (event: StorageEvent) => {
      if (event.key === 'tiktok_overlay_settings' && event.newValue) {
        settingsRef.current = JSON.parse(event.newValue);
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

  return (
    <>
      <canvas id="effect-canvas" ref={canvasRef} className="absolute inset-0 z-1 pointer-events-none bg-transparent" />
      <div id="notification-container" className="absolute top-[20%] left-10 w-[450px] z-10 flex flex-col gap-3.5 pointer-events-none" ref={containerRef} />
    </>
  );
}
