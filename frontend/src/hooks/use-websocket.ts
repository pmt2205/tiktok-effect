'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { WS_URL } from '@/lib/constants';
import { WsEventPacket } from '@/types';

interface UseWebSocketOptions {
  onEvent?: (packet: WsEventPacket) => void;
  autoConnect?: boolean;
}

export function useWebSocket({ onEvent, autoConnect = true }: UseWebSocketOptions = {}) {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const onEventRef = useRef(onEvent);

  // Keep callback ref updated
  useEffect(() => {
    onEventRef.current = onEvent;
  }, [onEvent]);

  useEffect(() => {
    if (!autoConnect) return;

    const socket = io(WS_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 3000,
      reconnectionAttempts: Infinity,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      console.log('[WS] Connected to backend');
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
      console.log('[WS] Disconnected from backend');
    });

    socket.on('event', (packet: WsEventPacket) => {
      onEventRef.current?.(packet);
    });

    socket.on('connect_error', (err) => {
      console.error('[WS] Connection error:', err.message);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [autoConnect]);

  const sendCommand = useCallback((command: Record<string, unknown>) => {
    if (socketRef.current?.connected) {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      socketRef.current.emit('command', { ...command, token });
    } else {
      console.warn('[WS] Cannot send command - not connected');
    }
  }, []);

  return { isConnected, sendCommand };
}
