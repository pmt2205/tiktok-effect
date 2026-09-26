'use client';

import React, { useEffect, useRef, useCallback, useState } from 'react';
import { ParticleEngine } from '../particles/particle-engine';
import { GiftEvent, ChatEvent, OverlaySettings, GiftMappings, BannerInfo, Gift, TopGifterJoinEvent, LikeLeaderboardItem } from '@/types';
import { DEFAULT_SETTINGS, WS_URL, BACKEND_URL } from '@/lib/constants';
import { io } from 'socket.io-client';
import GiftMenuOverlay from './gift-menu-overlay';
import { GiftJarOverlay, GiftJarOverlayRef } from './gift-jar-overlay';
import { GiftTreeOverlay, GiftTreeOverlayRef } from './gift-tree-overlay';
import TopGifterOverlay from './top-gifter-overlay';
import LikeLeaderboardOverlay from './like-leaderboard-overlay';
import { useTtsQueue } from '../hooks/use-tts-queue';
import { preloadGiftIcons } from '../lib/preload-gift-icons';

export default function OverlayCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<ParticleEngine | null>(null);
  const settingsRef = useRef<OverlaySettings>({ ...DEFAULT_SETTINGS });
  const mappingsRef = useRef<GiftMappings>({});
  const giftsRef = useRef<Gift[]>([]);
  const preloadedGiftIconUrlsRef = useRef<Set<string>>(new Set());
  const [settingsState, setSettingsState] = useState<OverlaySettings>({ ...DEFAULT_SETTINGS });
  const [giftsList, setGiftsList] = useState<Gift[]>([]);
  const [topGifterQueue, setTopGifterQueue] = useState<TopGifterJoinEvent[]>([]);
  const [likeLeaderboard, setLikeLeaderboard] = useState<LikeLeaderboardItem[]>([]);
  const bannersRef = useRef<Map<string, BannerInfo>>(new Map());

  const handleTopGifterEventFinished = useCallback((uniqueId: string) => {
    setTopGifterQueue((prev) => prev.filter((item) => item.uniqueId !== uniqueId));
  }, []);
  const containerRef = useRef<HTMLDivElement>(null);

  const jarRef = useRef<GiftJarOverlayRef>(null);
  const jarClearedAtRef = useRef<number>(0);

  const treeRef = useRef<GiftTreeOverlayRef>(null);
  const treeClearedAtRef = useRef<number>(0);

  const { enqueueChat } = useTtsQueue(settingsState);
  const enqueueChatRef = useRef(enqueueChat);

  useEffect(() => {
    enqueueChatRef.current = enqueueChat;
  }, [enqueueChat]);

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
    const settings = settingsRef.current;
    const isVideoEnabled = settings.videoEnabled !== false;
    const isSoundEnabled = settings.soundEnabled !== false;

    const { nickname, uniqueId, giftName, repeatCount, giftPictureUrl, profilePictureUrl, diamondCount } = giftData;
    const bannerKey = `${uniqueId}_${giftName}`;
    const mappings = mappingsRef.current;
    const currentBanner = bannersRef.current.get(bannerKey);
    const previousRepeatCount = currentBanner?.lastRepeatCount ?? currentBanner?.combo ?? 0;
    // Only type 1 gifts are cumulative streaks. Do not infer this from an increasing
    // repeatCount: a normal x50 gift is one independent event and must spawn all 50.
    const isCumulativeStreak = giftData.giftType === 1
      || currentBanner?.isStreak === true;
    const continuesOpenStreak = !giftData.isSimulated
      && currentBanner
      && isCumulativeStreak
      && !currentBanner.lastRepeatEnd;
    const particleCount = continuesOpenStreak
      ? Math.max(0, repeatCount - previousRepeatCount)
      : Math.max(1, repeatCount);

    // TikTok emits cumulative streak counts. Spawn only the newly added quantity.
    if (particleCount > 0) {
      const particleGift = { ...giftData, repeatCount: particleCount };
      if (settings.jarEnabled) jarRef.current?.spawnGift(particleGift);
      if (settings.treeEnabled) treeRef.current?.spawnGift(particleGift);
    }

    // Check if this is a duplicate repeat count for an ongoing streak (only for real, non-simulated events)
    if (!giftData.isSimulated && currentBanner && isCumulativeStreak) {
      const info = currentBanner;
      if (repeatCount === previousRepeatCount && !info.lastRepeatEnd) {
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
    const dbGiftByName = giftsRef.current.find(
      (g) => g.name.toLowerCase().trim() === giftKey ||
        (giftKey === 'rose' && g.name.toLowerCase().trim() === 'hoa hồng') ||
        (giftKey === 'tiktok' && g.name.toLowerCase().trim() === 'logo tiktok')
    );
    const dbGift = dbGiftByName || giftsRef.current.find(
      (g) => giftData.giftId !== undefined && Number(g.giftId) === Number(giftData.giftId)
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

    // Trigger visual video/particle effect if videoEnabled is true
    if (engineRef.current && isVideoEnabled) {
      const fullSoundUrl = (soundUrl && isSoundEnabled)
        ? (soundUrl.startsWith('http://') || soundUrl.startsWith('https://') ? soundUrl : `${BACKEND_URL}/media/${soundUrl}`)
        : undefined;

      if (hasDatabaseGift && videoUrl) {
        const fullVideoUrl = videoUrl.startsWith('http://') || videoUrl.startsWith('https://')
          ? videoUrl
          : `${BACKEND_URL}/media/${videoUrl}`;
        engineRef.current.playVideoEffect(fullVideoUrl, fullSoundUrl, isSoundEnabled);
      } else if (mappedEffect === 'video' && videoUrl) {
        const fullVideoUrl = videoUrl.startsWith('http://') || videoUrl.startsWith('https://')
          ? videoUrl
          : `${BACKEND_URL}/media/${videoUrl}`;
        engineRef.current.playVideoEffect(fullVideoUrl, fullSoundUrl, isSoundEnabled);
      } else if (fullSoundUrl && isSoundEnabled) {
        const audio = new Audio(fullSoundUrl);
        audio.play().catch(err => console.warn('Failed to play sound without video:', err));
      }
    } else if (!isVideoEnabled && isSoundEnabled && soundUrl) {
      // If video is disabled but sound is enabled, play sound only
      const fullSoundUrl = soundUrl.startsWith('http://') || soundUrl.startsWith('https://')
        ? soundUrl
        : `${BACKEND_URL}/media/${soundUrl}`;
      const audio = new Audio(fullSoundUrl);
      audio.play().catch(err => console.warn('Failed to play sound only:', err));
    }


    // Banner management
    const container = containerRef.current;
    if (!container) return;

    if (bannersRef.current.has(bannerKey)) {
      // Update existing banner
      const info = bannersRef.current.get(bannerKey)!;
      clearTimeout(info.timer);
      info.combo = isCumulativeStreak ? repeatCount : info.combo + Math.max(1, repeatCount);
      info.lastRepeatCount = repeatCount;
      info.isStreak = isCumulativeStreak;
      info.lastRepeatEnd = !!giftData.repeatEnd;

      const badge = info.bannerEl?.querySelector('.combo-badge');
      if (badge) {
        badge.textContent = `x${info.combo}`;
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

      const safeImageUrl = (value: string | undefined, fallback: string) => {
        try {
          const url = new URL(value || fallback);
          return ['https:', 'http:'].includes(url.protocol) ? url.href : fallback;
        } catch {
          return fallback;
        }
      };
      const avatarSrc = safeImageUrl(profilePictureUrl, 'https://www.tiktok.com/favicon.ico');
      const giftIconSrc = safeImageUrl(giftPictureUrl, 'https://sf16-website-nos.sofproxy.com/obj/tiktok-web-tx/tiktok/web/gift/rose.png');

      const bannerEl = document.createElement('div');
      bannerEl.className = `gift-card theme-${settings.theme}`;
      const makeElement = (tag: string, className: string, text?: string) => {
        const element = document.createElement(tag);
        element.className = className;
        if (text) element.textContent = text;
        return element;
      };
      const avatarContainer = makeElement('div', 'avatar-container');
      const avatar = document.createElement('img');
      avatar.src = avatarSrc;
      avatar.className = 'avatar-image';
      avatar.alt = '';
      avatar.onerror = () => { avatar.src = 'https://i.pravatar.cc/100'; };
      avatarContainer.appendChild(avatar);
      const userInfo = makeElement('div', 'user-info');
      userInfo.append(makeElement('span', 'nickname', nickname), makeElement('span', 'gift-action', `Sent ${giftName}`));
      const giftIconContainer = makeElement('div', 'gift-icon-container');
      const giftIcon = document.createElement('img');
      giftIcon.src = giftIconSrc;
      giftIcon.className = 'gift-icon';
      giftIcon.alt = '';
      giftIcon.onerror = () => { giftIcon.src = 'https://cdn4.dps.vc/iblock/f59/f5902abbd13178017285a308606fd0dd/cf6a40558018965a8171cf5a575dd9de.png'; };
      giftIconContainer.appendChild(giftIcon);
      bannerEl.append(avatarContainer, userInfo, giftIconContainer, makeElement('div', 'combo-badge pulse', `x${repeatCount}`));

      container.appendChild(bannerEl);

      const timer = setTimeout(() => removeBanner(bannerKey), settings.duration * 1000);
      bannersRef.current.set(bannerKey, {
        bannerEl,
        timer,
        combo: repeatCount,
        lastRepeatCount: repeatCount,
        isStreak: giftData.giftType === 1,
        lastRepeatEnd: !!giftData.repeatEnd,
      });
    }
  }, []);

  useEffect(() => {
    const handlePreviewSettings = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type !== 'overlay-preview-settings' || !event.data.settings) return;
      const previewSettings = event.data.settings as Partial<OverlaySettings>;
      settingsRef.current = { ...settingsRef.current, ...previewSettings };
      setSettingsState(settingsRef.current);
    };

    window.addEventListener('message', handlePreviewSettings);
    if (window.parent !== window) {
      window.parent.postMessage({ type: 'overlay-preview-ready' }, window.location.origin);
    }
    return () => window.removeEventListener('message', handlePreviewSettings);
  }, []);

  useEffect(() => {
    // Load settings from localStorage
    try {
      const savedSettings = localStorage.getItem('tiktok_overlay_settings');
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        settingsRef.current = { ...settingsRef.current, ...parsed };
        setSettingsState(settingsRef.current);
        if (parsed.jarClearedAt) {
          jarClearedAtRef.current = parsed.jarClearedAt;
        }
        if (parsed.treeClearedAt) {
          treeClearedAtRef.current = parsed.treeClearedAt;
        }
      }
      const savedMappings = localStorage.getItem('tiktok_overlay_mappings');
      if (savedMappings) mappingsRef.current = JSON.parse(savedMappings);
    } catch (e) {
      console.error('Failed to load saved settings:', e);
    }

    const searchParams = new URLSearchParams(window.location.search);
    const token = searchParams.get('token') || '';
    if (!token) {
      console.error('Overlay token is required');
      return;
    }

    // Initialize engines
    if (canvasRef.current) {
      engineRef.current = new ParticleEngine(canvasRef.current);
      engineRef.current.start();
    }

    // Connect to WebSocket
    const socket = io(WS_URL, {
      transports: ['websocket', 'polling'],
      query: { token },
      reconnection: true,
      reconnectionDelay: 3000,
    });

    socket.on('event', (packet: { type: string; data: unknown }) => {
      if (packet.type === 'gift') {
        handleGift(packet.data as GiftEvent);
      } else if (packet.type === 'chat') {
        enqueueChatRef.current(packet.data as ChatEvent, settingsRef.current);
      } else if (packet.type === 'settings-update') {
        const newSettings = { ...settingsRef.current, ...(packet.data as Partial<OverlaySettings>) };
        settingsRef.current = newSettings;
        localStorage.setItem('tiktok_overlay_settings', JSON.stringify(newSettings));
        setSettingsState(newSettings);
        
        if (newSettings.jarClearedAt && newSettings.jarClearedAt > jarClearedAtRef.current) {
          jarRef.current?.clearJar();
          jarClearedAtRef.current = newSettings.jarClearedAt;
        }

        if (newSettings.treeClearedAt && newSettings.treeClearedAt > treeClearedAtRef.current) {
          treeRef.current?.clearTree();
          treeClearedAtRef.current = newSettings.treeClearedAt;
        }
      } else if (packet.type === 'mappings-update') {
        mappingsRef.current = packet.data as GiftMappings;
        localStorage.setItem('tiktok_overlay_mappings', JSON.stringify(mappingsRef.current));
      } else if (packet.type === 'gifts-update') {
        const newGifts = (packet.data as Gift[]) || [];
        giftsRef.current = newGifts;
        setGiftsList(newGifts);
        preloadGiftIcons(newGifts, preloadedGiftIconUrlsRef.current);
      } else if (packet.type === 'top-gifter-join') {
        const joinEvent = packet.data as TopGifterJoinEvent;
        setTopGifterQueue((prev) => [...prev, joinEvent]);
      } else if (packet.type === 'like-leaderboard') {
        setLikeLeaderboard((packet.data as LikeLeaderboardItem[]) || []);
      }
    });

    // Cross-tab sync
    const handleStorage = (event: StorageEvent) => {
      if (event.key === 'tiktok_overlay_settings' && event.newValue) {
        const parsed = JSON.parse(event.newValue);
        settingsRef.current = parsed;
        setSettingsState(parsed);
        if (parsed.jarClearedAt && parsed.jarClearedAt > jarClearedAtRef.current) {
          jarRef.current?.clearJar();
          jarClearedAtRef.current = parsed.jarClearedAt;
        }
        if (parsed.treeClearedAt && parsed.treeClearedAt > treeClearedAtRef.current) {
          treeRef.current?.clearTree();
          treeClearedAtRef.current = parsed.treeClearedAt;
        }
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
      {/* Keep the combo tracker mounted without showing the legacy flashing gift banner. */}
      <div id="notification-container" className="hidden" ref={containerRef} aria-hidden="true" />

      {/* Gift Menu Overlay component */}
      <GiftMenuOverlay settings={settingsState} giftsList={giftsList} />

      {/* Gift Jar Overlay component (contains physics simulation & full-screen overflow canvas) */}
      <GiftJarOverlay ref={jarRef} settings={settingsState} />

      {/* Top Gifter Join Overlay Banner (4s pop-up) */}
      <TopGifterOverlay eventsQueue={topGifterQueue} onEventFinished={handleTopGifterEventFinished} settings={settingsState} />

      {/* Gift Tree Overlay component (contains swaying tree & blooming/falling gifts) */}
      <GiftTreeOverlay ref={treeRef} settings={settingsState} />

      {/* Like Leaderboard (BXH Tap Tay) Overlay */}
      <LikeLeaderboardOverlay settings={settingsState} items={likeLeaderboard} />
    </>
  );
}
