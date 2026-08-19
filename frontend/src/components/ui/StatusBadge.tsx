import React from 'react';

interface StatusBadgeProps {
  status: 'disconnected' | 'connecting' | 'connected';
  text: string;
}

export default function StatusBadge({ status, text }: StatusBadgeProps) {
  return (
    <span className={`status-badge ${status}`}>
      <span className="status-dot" />
      <span>{text}</span>
    </span>
  );
}
