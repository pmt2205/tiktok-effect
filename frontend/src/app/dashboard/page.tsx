'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from '@/components/layout/admin-sidebar';
import BackgroundGlows from '@/components/layout/background-glows';
import LoadingIndicator from '@/components/ui/loading-indicator';
import GiftManagerPanel from '@/features/admin-dashboard/components/gift-manager-panel';
import UserManagerPanel from '@/features/admin-dashboard/components/user-manager-panel';
import NpcManagerPanel from '@/features/admin-dashboard/components/npc-manager-panel';
import { UserHomepage } from '@/features/user-dashboard';
import ChatDashboard, { ChatWidget } from '@/features/shared/components/chat-dashboard';
import UserSidebar, { UserSubTab } from '@/components/layout/user-sidebar';
import { useWebSocket } from '@/hooks/use-websocket';
import { TiktokStatus, GiftEvent, ChatEvent, Gift, LikeLeaderboardItem } from '@/types';
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
  setLikeLeaderboard,
  addLog,
  setSelectedStreamer,
  setNpcCategories,
} from '@/features/admin-dashboard/store/dashboard-slice';
import {
  setMessages,
  addMessage,
  setConversations,
  ChatMessage,
} from '@/features/shared/store/chat-slice';

export default function DashboardPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [adminTab, setAdminTab] = useState<'effects' | 'users' | 'chat' | 'npc'>('effects');
  const [userTab, setUserTab] = useState<UserSubTab>('overview');

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
        case 'like-leaderboard':
          dispatch(setLikeLeaderboard((packet.data as LikeLeaderboardItem[]) || []));
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

  // Connection handlers
  const handleConnect = (username: string) => {
    sendCommand({ type: 'connect-stream', username, targetUsername: selectedStreamer });
    dispatch(addLog('System', `Initiating connection to @${username}...`, 'system'));
  };

  const handleDisconnect = () => {
    sendCommand({ type: 'disconnect-stream', targetUsername: selectedStreamer });
    dispatch(addLog('System', 'Disconnecting stream connector...', 'system'));
  };

  const handleSimulateEvent = useCallback((eventType: string, payload: unknown) => {
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
        <LoadingIndicator size="lg" />
      </div>
    );
  }

  if (role === 'admin') {
    return (
      <>
        <BackgroundGlows />
        <div className="flex h-[100dvh] flex-col overflow-hidden relative z-30 lg:flex-row">
          <AdminSidebar activeTab={adminTab} setActiveTab={setAdminTab} />

          <main className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-5 md:p-8 max-w-[1440px] mx-auto w-full">


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

  // Render User Homepage view with vertical sidebar layout
  return (
    <>
      <BackgroundGlows />
      <div className="flex h-[100dvh] flex-col overflow-hidden relative z-30 lg:flex-row">
        <UserSidebar activeTab={userTab} setActiveTab={setUserTab} />
        <main className="min-h-0 flex-1 overflow-y-auto max-w-[1440px] w-full">
          <UserHomepage
            activeSubTab={userTab}
            onConnect={handleConnect}
            onDisconnect={handleDisconnect}
            socketConnected={isConnected}
            onSimulateEvent={handleSimulateEvent}
          />
        </main>
        <ChatWidget onSendMessage={handleSendChatMessage} />
      </div>
    </>
  );
}
