'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ShootingStars from '@/features/auth/components/shooting-stars';
import Header from '@/components/layout/header';
import AdminSidebar from '@/components/layout/admin-sidebar';
import BackgroundGlows from '@/components/layout/background-glows';
import ConnectionPanel from '@/features/admin-dashboard/components/connection-panel';
import SettingsPanel from '@/features/admin-dashboard/components/settings-panel';
import MappingsPanel from '@/features/admin-dashboard/components/mappings-panel';
import SimulatorPanel from '@/features/admin-dashboard/components/simulator-panel';
import LogsPanel from '@/features/admin-dashboard/components/logs-panel';
import ObsSetupPanel from '@/features/admin-dashboard/components/obs-setup-panel';
import GiftManagerPanel from '@/features/admin-dashboard/components/gift-manager-panel';
import UserManagerPanel from '@/features/admin-dashboard/components/user-manager-panel';
import UserHomepage from '@/features/user-dashboard/components/user-homepage';
import { useWebSocket } from '@/hooks/use-websocket';
import { GiftMapping, TiktokStatus, GiftEvent, ChatEvent, Gift } from '@/types';
import { DEFAULT_SETTINGS, MOCK_USERS, MOCK_CHATS, GIFT_PICTURES, BACKEND_URL } from '@/lib/constants';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { initializeAuth } from '@/features/auth/store/auth-slice';
import {
  setStatus,
  setViewerCount,
  setSettings,
  setMappings,
  setAvailableGifts,
  setCustomGifts,
  addMapping,
  deleteMapping,
  addLog,
} from '@/features/admin-dashboard/store/dashboard-slice';

const getRandomMockUser = () => {
  return MOCK_USERS[Math.floor(Math.random() * MOCK_USERS.length)];
};

const getRandomMockChat = () => {
  return MOCK_CHATS[Math.floor(Math.random() * MOCK_CHATS.length)];
};

export default function DashboardPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [adminTab, setAdminTab] = useState<'home' | 'effects' | 'users'>('home');

  // Get state from Redux
  const isAuthLoading = useAppSelector((state) => state.auth.isAuthLoading);
  const settings = useAppSelector((state) => state.dashboard.settings);
  const mappings = useAppSelector((state) => state.dashboard.mappings);

  // Verify auth session and load settings/mappings from backend API on mount
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const userStr = localStorage.getItem('auth_user');

    if (!token) {
      router.push('/login');
      return;
    }

    try {
      if (userStr) {
        const userObj = JSON.parse(userStr);
        dispatch(initializeAuth({ token, user: userObj }));
      }
    } catch (err) {
      console.error('Failed to parse user role:', err);
    }
    
    // Fetch settings from MongoDB
    fetch(`${BACKEND_URL}/api/settings`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then((res) => {
        if (!res.ok) throw new Error('API error');
        return res.json();
      })
      .then((data) => {
        dispatch(setSettings({ ...DEFAULT_SETTINGS, ...data }));
      })
      .catch((e) => {
        console.error('Failed to load settings from DB, fallback to localStorage:', e);
        const savedSettings = localStorage.getItem('tiktok_overlay_settings');
        if (savedSettings) dispatch(setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(savedSettings) }));
      });

    // Fetch mappings from MongoDB
    fetch(`${BACKEND_URL}/api/settings/mappings`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then((res) => {
        if (!res.ok) throw new Error('API error');
        return res.json();
      })
      .then((data) => {
        dispatch(setMappings(data));
      })
      .catch((e) => {
        console.error('Failed to load mappings from DB, fallback to localStorage:', e);
        const savedMappings = localStorage.getItem('tiktok_overlay_mappings');
        if (savedMappings) {
          dispatch(setMappings(JSON.parse(savedMappings)));
        }
      });

    // Fetch custom gifts from MongoDB
    fetch(`${BACKEND_URL}/api/gifts`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then((res) => {
        if (!res.ok) throw new Error('API error');
        return res.json();
      })
      .then((data) => {
        dispatch(setCustomGifts(data));
      })
      .catch((e) => {
        console.error('Failed to load custom gifts from DB:', e);
      });
  }, [dispatch, router]);

  // WebSocket event handler
  const handleWsEvent = useCallback(
    (packet: { type: string; data?: unknown }) => {
      switch (packet.type) {
        case 'status':
          if (packet.data) {
            dispatch(setStatus(packet.data as TiktokStatus));
          }
          break;
        case 'gifts-list':
          dispatch(setAvailableGifts((packet.data as unknown[]) || []));
          break;
        case 'roomUser':
          if (packet.data && typeof packet.data === 'object' && 'viewerCount' in packet.data) {
            dispatch(setViewerCount((packet.data as { viewerCount: number }).viewerCount));
          }
          break;
        case 'chat': {
          const chat = packet.data as ChatEvent;
          dispatch(addLog('CHAT', `@${chat.uniqueId} (${chat.nickname}): ${chat.comment}`, 'chat'));
          break;
        }
        case 'gift': {
          const gift = packet.data as GiftEvent;
          dispatch(addLog(
            'GIFT',
            `@${gift.uniqueId} sent ${gift.giftName} x${gift.repeatCount} (${gift.diamondCount} diamonds)`,
            'gift',
          ));
          break;
        }
        case 'gifts-update':
          dispatch(setCustomGifts((packet.data as Gift[]) || []));
          break;
        default:
          break;
      }
    },
    [dispatch],
  );

  const { sendCommand, isConnected } = useWebSocket({ onEvent: handleWsEvent });

  // Initial log
  useEffect(() => {
    dispatch(addLog('System', 'Welcome to TikTok Live Event Engine! Connecting to backend...', 'system'));
  }, [dispatch]);

  // Log WS connection status
  useEffect(() => {
    if (isConnected) {
      dispatch(addLog('System', 'Connected to backend server.', 'system'));
    }
  }, [isConnected, dispatch]);

  // Overlay URL
  const overlayUrl = typeof window !== 'undefined' ? `${window.location.origin}/overlay` : '';

  // Connection handlers
  const handleConnect = (username: string) => {
    sendCommand({ type: 'connect-stream', username });
    dispatch(addLog('System', `Initiating connection to @${username}...`, 'system'));
  };

  const handleDisconnect = () => {
    sendCommand({ type: 'disconnect-stream' });
    dispatch(addLog('System', 'Disconnecting stream connector...', 'system'));
  };

  // Settings handlers
  const handleSaveSettings = () => {
    localStorage.setItem('tiktok_overlay_settings', JSON.stringify(settings));
    sendCommand({
      type: 'simulate-event',
      eventType: 'settings-update',
      payload: settings,
    });
    dispatch(addLog('System', 'Applied settings and broadcast to overlay.', 'system'));
  };

  // Mappings handlers
  const handleAddMapping = (giftName: string, mapping: GiftMapping) => {
    const updated = { ...mappings, [giftName]: mapping };
    dispatch(addMapping({ giftName, mapping }));
    localStorage.setItem('tiktok_overlay_mappings', JSON.stringify(updated));
    sendCommand({
      type: 'simulate-event',
      eventType: 'mappings-update',
      payload: updated,
    });
    dispatch(addLog('System', `Added mapping: "${giftName}" → Effect: ${mapping.effect}`, 'system'));
  };

  const handleDeleteMapping = (giftName: string) => {
    const updated = { ...mappings };
    delete updated[giftName];
    dispatch(deleteMapping(giftName));
    localStorage.setItem('tiktok_overlay_mappings', JSON.stringify(updated));
    sendCommand({
      type: 'simulate-event',
      eventType: 'mappings-update',
      payload: updated,
    });
    dispatch(addLog('System', `Removed mapping for "${giftName}"`, 'system'));
  };

  // Simulator handlers
  const simulateGift = (giftName: string, diamondCount: number, repeatCount: number) => {
    if (!isConnected) {
      dispatch(addLog('SIMULATOR', 'Cannot simulate. Dashboard is not connected to server.', 'error'));
      return;
    }
    const user = getRandomMockUser();
    const picture = GIFT_PICTURES[giftName] || GIFT_PICTURES.Rose;

    sendCommand({
      type: 'simulate-event',
      eventType: 'gift',
      payload: {
        nickname: user.nickname,
        uniqueId: user.uniqueId,
        giftName,
        repeatCount,
        diamondCount,
        giftPictureUrl: picture,
        profilePictureUrl: user.profile,
      },
    });
  };

  const simulateRoseCombo = (totalSteps: number) => {
    if (!isConnected) {
      dispatch(addLog('SIMULATOR', 'Cannot simulate. Dashboard is not connected to server.', 'error'));
      return;
    }
    const user = getRandomMockUser();
    dispatch(addLog('SIMULATOR', `Starting combo Rose simulation (combo x${totalSteps})...`, 'system'));
    let count = 0;
    const interval = setInterval(() => {
      count++;
      simulateGiftWithUser('Rose', 1, count, user);
      if (count >= totalSteps) clearInterval(interval);
    }, 450);
  };

  const simulateGiftWithUser = (
    giftName: string,
    diamondCount: number,
    repeatCount: number,
    user: (typeof MOCK_USERS)[0],
  ) => {
    const picture = GIFT_PICTURES[giftName] || GIFT_PICTURES.Rose;
    sendCommand({
      type: 'simulate-event',
      eventType: 'gift',
      payload: {
        nickname: user.nickname,
        uniqueId: user.uniqueId,
        giftName,
        repeatCount,
        diamondCount,
        giftPictureUrl: picture,
        profilePictureUrl: user.profile,
      },
    });
  };

  const simulateMappedGift = (giftName: string) => {
    if (!giftName || !mappings[giftName]) {
      dispatch(addLog('SIMULATOR', 'No mapped gifts available to test.', 'error'));
      return;
    }
    const mapping = mappings[giftName];
    const diamondCount = mapping.effect === 'star' ? 1000 : mapping.effect === 'video' ? 500 : 1;
    simulateGift(giftName, diamondCount, 1);
  };

  const simulateMappedGiftCombo = (giftName: string, totalSteps: number) => {
    if (!giftName || !mappings[giftName]) {
      dispatch(addLog('SIMULATOR', 'No mapped gifts available to test.', 'error'));
      return;
    }
    if (!isConnected) {
      dispatch(addLog('SIMULATOR', 'Cannot simulate. Dashboard is not connected to server.', 'error'));
      return;
    }
    const mapping = mappings[giftName];
    const diamondCount = mapping.effect === 'star' ? 1000 : mapping.effect === 'video' ? 500 : 1;
    const user = getRandomMockUser();
    let count = 0;
    dispatch(addLog('SIMULATOR', `Starting combo simulation for "${giftName}" (combo x${totalSteps})...`, 'system'));
    const interval = setInterval(() => {
      count++;
      simulateGiftWithUser(giftName, diamondCount, count, user);
      if (count >= totalSteps) clearInterval(interval);
    }, 450);
  };

  const simulateChat = () => {
    if (!isConnected) {
      dispatch(addLog('SIMULATOR', 'Cannot simulate. Dashboard is not connected to server.', 'error'));
      return;
    }
    const user = getRandomMockUser();
    const comment = getRandomMockChat();

    sendCommand({
      type: 'simulate-event',
      eventType: 'chat',
      payload: {
        nickname: user.nickname,
        uniqueId: user.uniqueId,
        comment,
        profilePictureUrl: user.profile,
      },
    });
  };

  const role = useAppSelector((state) => state.auth.user?.role) || 'user';

  if (isAuthLoading) {
    return (
      <div className="relative w-full min-h-screen overflow-hidden bg-bg-dark flex items-center justify-center">
        <BackgroundGlows />
        <div className="text-secondary text-[1.2rem] font-header tracking-[2px]">
          VERIFYING SECURITY SESSION...
        </div>
      </div>
    );
  }

  if (role === 'admin') {
    return (
      <>
        <BackgroundGlows />
        <div className="flex h-screen overflow-hidden relative z-30">
          <AdminSidebar activeTab={adminTab} setActiveTab={setAdminTab} />
          
          <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-[1440px] mx-auto w-full">
            {adminTab === 'home' && (
              <div className="grid grid-cols-1 xl:grid-cols-[1fr_1.2fr] gap-6 animate-[fade-in-up_0.6s_ease-out]">
                {/* Column 1: Controls & Settings */}
                <div className="flex flex-col gap-6">
                  <ConnectionPanel onConnect={handleConnect} onDisconnect={handleDisconnect} />
                  <SettingsPanel onSave={handleSaveSettings} />
                  <MappingsPanel
                    onAddMapping={handleAddMapping}
                    onDeleteMapping={handleDeleteMapping}
                  />
                  <ObsSetupPanel overlayUrl={overlayUrl} />
                </div>

                {/* Column 2: Simulator & Logs */}
                <div className="flex flex-col gap-6">
                  <SimulatorPanel
                    onSimulateGift={simulateGift}
                    onSimulateRoseCombo={simulateRoseCombo}
                    onSimulateMappedGift={simulateMappedGift}
                    onSimulateMappedGiftCombo={simulateMappedGiftCombo}
                    onSimulateChat={simulateChat}
                  />
                  <LogsPanel />
                </div>
              </div>
            )}

            {adminTab === 'effects' && (
              <GiftManagerPanel />
            )}

            {adminTab === 'users' && (
              <UserManagerPanel />
            )}
          </main>
        </div>
      </>
    );
  }

  // Render User Homepage view
  return (
    <>
      <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.8)_1px,_transparent_1px)] bg-[size:180px_180px] bg-[position:0_0] pointer-events-none z-0 animate-twinkle" style={{ animationDuration: '5s' }} />
      <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.6)_1.5px,_transparent_1.5px)] bg-[size:280px_280px] bg-[position:40px_70px] pointer-events-none z-0 animate-twinkle" style={{ animationDuration: '8s', animationDelay: '1.5s' } as React.CSSProperties} />
      <div className="absolute inset-0 bg-[radial-gradient(rgba(0,242,254,0.4)_2px,_transparent_2px)] bg-[size:400px_400px] bg-[position:100px_220px] pointer-events-none z-0 animate-twinkle" style={{ animationDuration: '11s', animationDelay: '3s' } as React.CSSProperties} />
      <ShootingStars />
      <BackgroundGlows />
      <div className="max-w-[1360px] mx-auto">
        <Header />
        <UserHomepage onConnect={handleConnect} onDisconnect={handleDisconnect} />
      </div>
    </>
  );
}
