'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import BackgroundGlows from '@/components/layout/BackgroundGlows';
import ConnectionPanel from '@/features/connection/ConnectionPanel';
import SettingsPanel from '@/features/settings/SettingsPanel';
import MappingsPanel from '@/features/settings/MappingsPanel';
import SimulatorPanel from '@/features/simulator/SimulatorPanel';
import LogsPanel from '@/features/logs/LogsPanel';
import ObsSetupPanel from '@/features/obs-setup/ObsSetupPanel';
import { useWebSocket } from '@/hooks/useWebSocket';
import { TiktokStatus, OverlaySettings, GiftMappings, GiftMapping, LogEntry } from '@/types';
import { DEFAULT_SETTINGS, DEFAULT_MAPPINGS, MOCK_USERS, MOCK_CHATS, GIFT_PICTURES, BACKEND_URL } from '@/lib/constants';

export default function DashboardPage() {
  const router = useRouter();
  const [userRole, setUserRole] = useState<'admin' | 'user'>('user');
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Connection state
  const [status, setStatus] = useState<TiktokStatus>({
    status: 'disconnected',
    username: '',
    viewerCount: 0,
    error: null,
  });

  // Settings state
  const [settings, setSettings] = useState<OverlaySettings>(DEFAULT_SETTINGS);

  // Mappings state
  const [mappings, setMappings] = useState<GiftMappings>(DEFAULT_MAPPINGS);

  // Available gifts list from TikTok
  const [availableGifts, setAvailableGifts] = useState<any[]>([]);

  // Verify auth session and load settings/mappings from backend API (MongoDB) on mount
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
        setUserRole(userObj.role);
      }
    } catch (err) {
      console.error('Failed to parse user role:', err);
    }
    
    setIsAuthLoading(false);

    // 1. Fetch settings
    fetch(`${BACKEND_URL}/api/settings`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then((res) => {
        if (!res.ok) throw new Error('API error');
        return res.json();
      })
      .then((data) => {
        setSettings({ ...DEFAULT_SETTINGS, ...data });
      })
      .catch((e) => {
        console.error('Failed to load settings from database, using local storage fallback:', e);
        const savedSettings = localStorage.getItem('tiktok_overlay_settings');
        if (savedSettings) setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(savedSettings) });
      });

    // 2. Fetch mappings
    fetch(`${BACKEND_URL}/api/settings/mappings`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then((res) => {
        if (!res.ok) throw new Error('API error');
        return res.json();
      })
      .then((data) => {
        setMappings(data);
        const keys = Object.keys(data);
        if (keys.length > 0) {
          setSelectedMappedGift(keys[0]);
        }
      })
      .catch((e) => {
        console.error('Failed to load mappings from database, using local storage fallback:', e);
        const savedMappings = localStorage.getItem('tiktok_overlay_mappings');
        if (savedMappings) {
          const parsed = JSON.parse(savedMappings);
          setMappings(parsed);
          const keys = Object.keys(parsed);
          if (keys.length > 0) setSelectedMappedGift(keys[0]);
        }
      });
  }, [router]);

  // Logs state
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const logIdCounter = useRef(0);

  // Simulator state
  const [selectedMappedGift, setSelectedMappedGift] = useState(() => {
    const keys = Object.keys(DEFAULT_MAPPINGS);
    return keys.length > 0 ? keys[0] : '';
  });

  // Log helper
  const addLog = useCallback((tag: string, message: string, className: string = '') => {
    const time = new Date().toTimeString().split(' ')[0];
    const id = `log-${++logIdCounter.current}`;
    setLogs((prev) => {
      const newLogs = [...prev, { id, time, tag, message, className }];
      return newLogs.slice(-100); // Cap at 100
    });
  }, []);

  // WebSocket event handler
  const handleWsEvent = useCallback(
    (packet: { type: string; data?: any }) => {
      switch (packet.type) {
        case 'status':
          setStatus(packet.data);
          break;
        case 'gifts-list':
          setAvailableGifts(packet.data || []);
          break;
        case 'roomUser':
          if (packet.data?.viewerCount !== undefined) {
            setStatus((prev) => ({ ...prev, viewerCount: packet.data.viewerCount }));
          }
          break;
        case 'chat':
          addLog('CHAT', `@${packet.data.uniqueId} (${packet.data.nickname}): ${packet.data.comment}`, 'chat');
          break;
        case 'gift':
          addLog(
            'GIFT',
            `@${packet.data.uniqueId} sent ${packet.data.giftName} x${packet.data.repeatCount} (${packet.data.diamondCount} diamonds)`,
            'gift',
          );
          break;
        default:
          break;
      }
    },
    [addLog],
  );

  const { sendCommand, isConnected } = useWebSocket({ onEvent: handleWsEvent });

  // Initial log
  useEffect(() => {
    addLog('System', 'Welcome to TikTok Live Event Engine! Connecting to backend...', 'system');
  }, [addLog]);

  // Log WS connection status
  useEffect(() => {
    if (isConnected) {
      addLog('System', 'Connected to backend server.', 'system');
    }
  }, [isConnected]);

  // Overlay URL
  const overlayUrl = typeof window !== 'undefined' ? `${window.location.origin}/overlay` : '';

  // Connection handlers
  const handleConnect = (username: string) => {
    sendCommand({ type: 'connect-stream', username });
    addLog('System', `Initiating connection to @${username}...`, 'system');
  };

  const handleDisconnect = () => {
    sendCommand({ type: 'disconnect-stream' });
    addLog('System', 'Disconnecting stream connector...', 'system');
  };

  // Settings handlers
  const handleSaveSettings = () => {
    localStorage.setItem('tiktok_overlay_settings', JSON.stringify(settings));
    sendCommand({
      type: 'simulate-event',
      eventType: 'settings-update',
      payload: settings,
    });
    addLog('System', 'Applied settings and broadcast to overlay.', 'system');
  };

  // Mappings handlers
  const broadcastMappings = () => {
    localStorage.setItem('tiktok_overlay_mappings', JSON.stringify(mappings));
    sendCommand({
      type: 'simulate-event',
      eventType: 'mappings-update',
      payload: mappings,
    });
  };

  const handleAddMapping = (giftName: string, mapping: GiftMapping) => {
    const updated = { ...mappings, [giftName]: mapping };
    setMappings(updated);
    localStorage.setItem('tiktok_overlay_mappings', JSON.stringify(updated));
    sendCommand({
      type: 'simulate-event',
      eventType: 'mappings-update',
      payload: updated,
    });
    addLog('System', `Added mapping: "${giftName}" → Effect: ${mapping.effect}, Sound: ${mapping.sound}`, 'system');
  };

  const handleDeleteMapping = (giftName: string) => {
    const updated = { ...mappings };
    delete updated[giftName];
    setMappings(updated);
    localStorage.setItem('tiktok_overlay_mappings', JSON.stringify(updated));
    sendCommand({
      type: 'simulate-event',
      eventType: 'mappings-update',
      payload: updated,
    });
    addLog('System', `Removed mapping for "${giftName}"`, 'system');
  };

  // Simulator handlers
  const simulateGift = (giftName: string, diamondCount: number, repeatCount: number) => {
    if (!isConnected) {
      addLog('SIMULATOR', 'Cannot simulate. Dashboard is not connected to server.', 'error');
      return;
    }
    const user = MOCK_USERS[Math.floor(Math.random() * MOCK_USERS.length)];
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
      addLog('SIMULATOR', 'Cannot simulate. Dashboard is not connected to server.', 'error');
      return;
    }
    const user = MOCK_USERS[Math.floor(Math.random() * MOCK_USERS.length)];
    addLog('SIMULATOR', `Starting combo Rose simulation (combo x${totalSteps})...`, 'system');
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
      addLog('SIMULATOR', 'No mapped gifts available to test.', 'error');
      return;
    }
    const mapping = mappings[giftName];
    const diamondCount = mapping.effect === 'star' ? 1000 : mapping.effect === 'video' ? 500 : 1;
    simulateGift(giftName, diamondCount, 1);
  };

  const simulateMappedGiftCombo = (giftName: string, totalSteps: number) => {
    if (!giftName || !mappings[giftName]) {
      addLog('SIMULATOR', 'No mapped gifts available to test.', 'error');
      return;
    }
    if (!isConnected) {
      addLog('SIMULATOR', 'Cannot simulate. Dashboard is not connected to server.', 'error');
      return;
    }
    const mapping = mappings[giftName];
    const diamondCount = mapping.effect === 'star' ? 1000 : mapping.effect === 'video' ? 500 : 1;
    const user = MOCK_USERS[Math.floor(Math.random() * MOCK_USERS.length)];
    let count = 0;
    addLog('SIMULATOR', `Starting combo simulation for "${giftName}" (combo x${totalSteps})...`, 'system');
    const interval = setInterval(() => {
      count++;
      simulateGiftWithUser(giftName, diamondCount, count, user);
      if (count >= totalSteps) clearInterval(interval);
    }, 450);
  };

  const simulateChat = () => {
    if (!isConnected) {
      addLog('SIMULATOR', 'Cannot simulate. Dashboard is not connected to server.', 'error');
      return;
    }
    const user = MOCK_USERS[Math.floor(Math.random() * MOCK_USERS.length)];
    const comment = MOCK_CHATS[Math.floor(Math.random() * MOCK_CHATS.length)];

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

  const clearLogs = () => {
    setLogs([]);
    addLog('System', 'Log console cleared.', 'system');
  };

  if (isAuthLoading) {
    return (
      <div className="login-page-container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#07080d' }}>
        <BackgroundGlows />
        <div style={{ color: '#00f2fe', fontSize: '1.2rem', fontFamily: 'Space Grotesk', letterSpacing: '2px' }}>
          VERIFYING SECURITY SESSION...
        </div>
      </div>
    );
  }

  const isAdmin = userRole === 'admin';

  return (
    <>
      <BackgroundGlows />
      <div className="dashboard-container">
        <Header />
        <main className="dashboard-grid">
          {/* Column 1: Controls & Settings */}
          <div className="dashboard-col">
            <ConnectionPanel status={status} onConnect={handleConnect} onDisconnect={handleDisconnect} isAdmin={isAdmin} />
            <SettingsPanel settings={settings} onSettingsChange={setSettings} onSave={handleSaveSettings} isAdmin={isAdmin} />
            <MappingsPanel
              mappings={mappings}
              availableGifts={availableGifts}
              onAddMapping={handleAddMapping}
              onDeleteMapping={handleDeleteMapping}
              isAdmin={isAdmin}
            />
            <ObsSetupPanel overlayUrl={overlayUrl} />
          </div>

          {/* Column 2: Simulator & Logs */}
          <div className="dashboard-col">
            <SimulatorPanel
              mappings={mappings}
              onSimulateGift={simulateGift}
              onSimulateRoseCombo={simulateRoseCombo}
              onSimulateMappedGift={simulateMappedGift}
              onSimulateMappedGiftCombo={simulateMappedGiftCombo}
              onSimulateChat={simulateChat}
              selectedMappedGift={selectedMappedGift}
              onSelectedMappedGiftChange={setSelectedMappedGift}
              isAdmin={isAdmin}
            />
            <LogsPanel logs={logs} onClear={clearLogs} />
          </div>
        </main>
      </div>
    </>
  );
}
