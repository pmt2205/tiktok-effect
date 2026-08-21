'use client';

import React, { useState } from 'react';
import GlassCard from '@/components/ui/glass-card';
import Button from '@/components/ui/button';
import InputGroup from '@/components/ui/input-group';
import StatusBadge from '@/components/ui/status-badge';
import { formatNumber } from '@/lib/constants';
import { useAppSelector } from '@/store/hooks';

interface ConnectionPanelProps {
  onConnect: (username: string) => void;
  onDisconnect: () => void;
  t?: {
    connectionTitle?: string;
    connectionStatus?: string;
    viewers?: string;
    connect?: string;
    disconnect?: string;
    adminPrivileges?: string;
  };
}

export default function ConnectionPanel({ onConnect, onDisconnect, t }: ConnectionPanelProps) {
  const status = useAppSelector((state) => state.dashboard.status);
  const user = useAppSelector((state) => state.auth.user);
  const [username, setUsername] = useState('');

  const isAdmin = user?.role === 'admin';
  const allowConnect = user?.allowConnect ?? false;
  const isAllowedToConnect = isAdmin || allowConnect;

  const isConnected = status.status === 'connected';
  const isConnecting = status.status === 'connecting';
  const isDisconnected = status.status === 'disconnected';

  const getTranslatedStatus = (statusVal: string) => {
    if (t) {
      switch (statusVal) {
        case 'connected': return 'Đã kết nối';
        case 'connecting': return 'Đang kết nối';
        default: return 'Chưa kết nối';
      }
    }
    return statusVal.charAt(0).toUpperCase() + statusVal.slice(1);
  };

  const statusText = status.username
    ? `${getTranslatedStatus(status.status)} (@${status.username})`
    : getTranslatedStatus(status.status);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAllowedToConnect) return;
    const cleanUsername = username.trim().replace(/^@/, '');
    if (cleanUsername) {
      onConnect(cleanUsername);
    }
  };

  return (
    <GlassCard
      headerIcon={<i className="fa-solid fa-signal" />}
      headerTitle={t?.connectionTitle || "TikTok Stream Connection"}
    >
      <div className="flex items-center gap-2.5 mb-4">
        <span className="text-[0.92rem] text-text-secondary">{t?.connectionStatus || "Status"}:</span>
        <StatusBadge status={status.status} text={statusText} />
      </div>

      {isConnected && (
        <div className="flex items-center gap-2 bg-white/[0.03] px-3.5 py-2 rounded-sm mb-4 text-[0.88rem] text-text-muted">
          <i className="fa-solid fa-eye text-primary" />
          <span>{formatNumber(status.viewerCount)}</span> {t?.viewers || 'viewers'}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-4">
        <InputGroup
          addon="@"
          value={isConnected || isConnecting ? status.username : username}
          onChange={setUsername}
          placeholder="tiktok_username"
          disabled={!isDisconnected || !isAllowedToConnect}
          id="username-input"
        />
        {isAllowedToConnect ? (
          <div className="flex gap-3 mt-4">
            {isDisconnected && (
              <Button type="submit" variant="gradient" id="btn-connect" className="flex-1">
                <i className="fa-solid fa-link" /> {t?.connect || 'Connect'}
              </Button>
            )}
            {!isDisconnected && (
              <Button type="button" variant="danger" onClick={onDisconnect} id="btn-disconnect" className="flex-1">
                <i className="fa-solid fa-link-slash" /> {t?.disconnect || 'Disconnect'}
              </Button>
            )}
          </div>
        ) : (
          <div className="view-only-msg" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '10px' }}>
            <i className="fa-solid fa-lock" /> {t?.adminPrivileges || 'Admin privileges required to manage stream connection.'}
          </div>
        )}
      </form>

      {status.error && (
        <div className="bg-danger/6 border border-danger/18 text-[#f87171] px-3.5 py-2.5 rounded-md text-[0.85rem] mt-3">{status.error}</div>
      )}
    </GlassCard>
  );
}
