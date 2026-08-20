import React from 'react';

interface StatusBadgeProps {
  status: 'disconnected' | 'connecting' | 'connected';
  text: string;
}

export default function StatusBadge({ status, text }: StatusBadgeProps) {
  let badgeClass = '';
  let dotClass = '';

  switch (status) {
    case 'disconnected':
      badgeClass = 'bg-danger/8 border-danger/18 text-[#ef4444]';
      dotClass = 'bg-danger shadow-[0_0_8px_#ef4444]';
      break;
    case 'connecting':
      badgeClass = 'bg-warning/8 border-warning/18 text-warning';
      dotClass = 'bg-warning animate-status-pulse shadow-[0_0_8px_var(--color-warning)]';
      break;
    case 'connected':
      badgeClass = 'bg-success/8 border-success/18 text-success';
      dotClass = 'bg-success animate-status-pulse shadow-[0_0_8px_var(--color-success)]';
      break;
  }

  return (
    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-md text-[0.82rem] font-bold border select-none transition-all duration-250 ${badgeClass}`}>
      <span className={`w-2 h-2 rounded-full shrink-0 ${dotClass}`} />
      <span>{text}</span>
    </span>
  );
}
