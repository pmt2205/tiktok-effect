'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ShootingStars from '@/features/auth/components/shooting-stars';
import Header from '@/components/layout/header';
import AdminSidebar from '@/components/layout/admin-sidebar';
import BackgroundGlows from '@/components/layout/background-glows';
import GiftManagerPanel from '@/features/admin-dashboard/components/gift-manager-panel';
import UserManagerPanel from '@/features/admin-dashboard/components/user-manager-panel';
import NpcManagerPanel from '@/features/admin-dashboard/components/npc-manager-panel';
import UserHomepage from '@/features/user-dashboard/components/user-homepage';
import ChatDashboard from '@/features/shared/components/chat-dashboard';
import { useWebSocket } from '@/hooks/use-websocket';
import { TiktokStatus, GiftEvent, ChatEvent, Gift, OverlaySettings } from '@/types';
import { DEFAULT_SETTINGS, BACKEND_URL } from '@/lib/constants';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { initializeAuth } from '@/features/auth/store/auth-slice';
import {
  setStatus,
  setViewerCount,
  setSettings,
  setMappings,
  setAvailableGifts,
  setCustomGifts,
  addLog,
  setSelectedStreamer,
  setUsersList,
  setNpcCategories,
} from '@/features/admin-dashboard/store/dashboard-slice';
import {
  setMessages,
  addMessage,
  setConversations,
  setActiveChatUser,
  ChatMessage,
} from '@/features/shared/store/chat-slice';

export default function DashboardPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [adminTab, setAdminTab] = useState<'effects' | 'users' | 'chat' | 'npc'>('effects');

  // Get state from Redux
  const isAuthLoading = useAppSelector((state) => state.auth.isAuthLoading);
  const user = useAppSelector((state) => state.auth.user);
  const role = user?.role || 'user';

  const selectedStreamer = useAppSelector((state) => state.dashboard.selectedStreamer);

  // Verify auth session on mount
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
        dispatch(setSelectedStreamer(userObj.username));
      }
    } catch (err) {
      console.error('Failed to parse user role:', err);
    }
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
        case 'chat-message':
          if (packet.data) {
            dispatch(addMessage(packet.data as ChatMessage));
          }
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

  // Load settings/mappings/gifts reactively based on selectedStreamer
  useEffect(() => {
    if (!selectedStreamer) return;
    const token = localStorage.getItem('auth_token');
    if (!token) return;

    // Fetch settings from MongoDB
    fetch(`${BACKEND_URL}/api/settings?username=${selectedStreamer}`, {
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
        console.error('Failed to load settings from DB:', e);
      });

    // Fetch mappings from MongoDB
    fetch(`${BACKEND_URL}/api/settings/mappings?username=${selectedStreamer}`, {
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
        console.warn('Failed to load custom mappings from DB, using local defaults:', e);
      });

    // Fetch custom gifts from MongoDB
    fetch(`${BACKEND_URL}/api/gifts?username=${selectedStreamer}`, {
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

    fetch(`${BACKEND_URL}/api/settings/npc-categories`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then((res) => {
        if (!res.ok) throw new Error('API error');
        return res.json();
      })
      .then((data) => {
        dispatch(setNpcCategories(data));
      })
      .catch((e) => {
        console.error('Failed to load NPC categories:', e);
      });

    // Sync WebSocket room for admin
    if (user?.role === 'admin' && isConnected) {
      sendCommand({
        type: 'subscribe-streamer',
        streamerUsername: selectedStreamer,
      });
    }
  }, [selectedStreamer, dispatch, user?.role, sendCommand, isConnected]);

  // Fetch chat conversations for Admin on tab change or mount
  useEffect(() => {
    if (role === 'admin' && adminTab === 'chat' && isConnected) {
      const token = localStorage.getItem('auth_token');
      if (!token) return;
      fetch(`${BACKEND_URL}/api/chat/conversations`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => {
          if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
          return res.json();
        })
        .then(data => {
          dispatch(setConversations(data));
        })
        .catch(err => console.error('Failed to load conversations:', err));
    }
  }, [adminTab, role, isConnected, dispatch]);

  // Fetch chat history between Admin and activeChatUser
  const activeChatUser = useAppSelector((state) => state.chat.activeChatUser);
  useEffect(() => {
    if (role === 'admin' && activeChatUser) {
      const token = localStorage.getItem('auth_token');
      if (!token) return;
      fetch(`${BACKEND_URL}/api/chat/history?username=${activeChatUser}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => {
          if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
          return res.json();
        })
        .then(data => {
          dispatch(setMessages(data));
        })
        .catch(err => console.error('Failed to load chat history:', err));
    }
  }, [activeChatUser, role, dispatch]);

  // Fetch chat history for Streamer (user) with Admin on connection/mount
  useEffect(() => {
    if (role !== 'admin' && isConnected) {
      const token = localStorage.getItem('auth_token');
      if (!token) return;
      fetch(`${BACKEND_URL}/api/chat/history`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => {
          if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
          return res.json();
        })
        .then(data => {
          dispatch(setMessages(data));
        })
        .catch(err => console.error('Failed to load chat history with admin:', err));
    }
  }, [role, isConnected, dispatch]);

  // Chat message sender handler
  const handleSendChatMessage = (receiver: string, message: string) => {
    sendCommand({
      type: 'send-chat-message',
      receiver,
      message,
    });
  };

  // Overlay URL
  const overlayUrl = typeof window !== 'undefined' && selectedStreamer
    ? `${window.location.origin}/overlay?user=${selectedStreamer}`
    : typeof window !== 'undefined' && user?.username
    ? `${window.location.origin}/overlay?user=${user.username}`
    : '';

  // Connection handlers
  const handleConnect = (username: string) => {
    sendCommand({ type: 'connect-stream', username, targetUsername: selectedStreamer });
    dispatch(addLog('System', `Initiating connection to @${username}...`, 'system'));
  };

  const handleDisconnect = () => {
    sendCommand({ type: 'disconnect-stream', targetUsername: selectedStreamer });
    dispatch(addLog('System', 'Disconnecting stream connector...', 'system'));
  };

  const handleSimulateEvent = useCallback((eventType: string, payload: any) => {
    sendCommand({
      type: 'simulate-event',
      targetUsername: selectedStreamer || user?.username || '',
      eventType,
      payload,
    });
  }, [selectedStreamer, user, sendCommand]);

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


            {adminTab === 'effects' && (
              <GiftManagerPanel />
            )}

            {adminTab === 'users' && (
              <UserManagerPanel />
            )}

            {adminTab === 'chat' && (
              <ChatDashboard onSendMessage={handleSendChatMessage} />
            )}

            {adminTab === 'npc' && (
              <NpcManagerPanel />
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
        <UserHomepage 
          onConnect={handleConnect} 
          onDisconnect={handleDisconnect} 
          onSendMessage={handleSendChatMessage} 
          onSimulateEvent={handleSimulateEvent}
        />
      </div>
    </>
  );
}
