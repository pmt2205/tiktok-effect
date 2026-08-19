'use client';

import React, { useRef, useEffect } from 'react';
import GlassCard from '@/components/ui/GlassCard';
import Button from '@/components/ui/Button';
import { LogEntry } from '@/types';

interface LogsPanelProps {
  logs: LogEntry[];
  onClear: () => void;
}

export default function LogsPanel({ logs, onClear }: LogsPanelProps) {
  const consoleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <GlassCard
      className="panel-logs"
      headerIcon={<i className="fa-solid fa-terminal" />}
      headerTitle="Real-time Stream Logs"
      headerActions={
        <Button variant="small-danger" onClick={onClear} id="btn-clear-logs">
          <i className="fa-solid fa-trash-can" /> Clear
        </Button>
      }
      noPadding
    >
      <div className="logs-console" ref={consoleRef}>
        {logs.map((log) => (
          <div key={log.id} className={`log-line ${log.className}`}>
            <span className="log-time">[{log.time}]</span>
            {' '}[{log.tag}] {log.message}
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
