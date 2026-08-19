'use client';

import React, { useState } from 'react';
import GlassCard from '@/components/ui/GlassCard';
import Button from '@/components/ui/Button';
import InputGroup from '@/components/ui/InputGroup';
import StatusBadge from '@/components/ui/StatusBadge';
import { TiktokStatus } from '@/types';
import { formatNumber } from '@/lib/constants';

interface ConnectionPanelProps {
  status: TiktokStatus;
  onConnect: (username: string) => void;
  onDisconnect: () => void;
}

export default function ConnectionPanel({ status, onConnect, onDisconnect }: ConnectionPanelProps) {
  const [username, setUsername] = useState('');

  const isConnected = status.status === 'connected';
  const isConnecting = status.status === 'connecting';
  const isDisconnected = status.status === 'disconnected';

  const statusText = status.username
    ? `${status.status.charAt(0).toUpperCase() + status.status.slice(1)} (@${status.username})`
    : status.status.charAt(0).toUpperCase() + status.status.slice(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUsername = username.trim().replace(/^@/, '');
    if (cleanUsername) {
      onConnect(cleanUsername);
    }
  };

  return (
    <GlassCard
      className="panel-connection"
      headerIcon={<i className="fa-solid fa-signal" />}
      headerTitle="TikTok Stream Connection"
    >
      <div className="status-indicator">
        <span className="status-label">Status:</span>
        <StatusBadge status={status.status} text={statusText} />
      </div>

      {isConnected && (
        <div className="viewer-count">
          <i className="fa-solid fa-eye" />
          <span>{formatNumber(status.viewerCount)}</span> viewers
        </div>
      )}

      <form onSubmit={handleSubmit} className="connection-form">
        <InputGroup
          addon="@"
          value={isConnected || isConnecting ? status.username : username}
          onChange={setUsername}
          placeholder="tiktok_username"
          disabled={!isDisconnected}
          id="username-input"
        />
        <div className="button-group">
          {isDisconnected && (
            <Button type="submit" variant="primary" id="btn-connect">
              <i className="fa-solid fa-link" /> Connect
            </Button>
          )}
          {!isDisconnected && (
            <Button type="button" variant="danger" onClick={onDisconnect} id="btn-disconnect">
              <i className="fa-solid fa-link-slash" /> Disconnect
            </Button>
          )}
        </div>
      </form>

      {status.error && (
        <div className="error-msg">{status.error}</div>
      )}
    </GlassCard>
  );
}
