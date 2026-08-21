'use client';

import React, { useRef, useEffect } from 'react';
import GlassCard from '@/components/ui/glass-card';
import Button from '@/components/ui/button';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { clearLogs } from '@/features/admin-dashboard/store/dashboard-slice';

interface LogsPanelProps {
  t?: {
    realtimeLogsTitle?: string;
    clear?: string;
  };
}

export default function LogsPanel({ t }: LogsPanelProps = {}) {
  const dispatch = useAppDispatch();
  const logs = useAppSelector((state) => state.dashboard.logs);
  const consoleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [logs]);

  const handleClear = () => {
    dispatch(clearLogs());
  };

  return (
    <GlassCard
      headerIcon={<i className="fa-solid fa-terminal" />}
      headerTitle={t?.realtimeLogsTitle || "Real-time Stream Logs"}
      headerActions={
        <Button variant="small-danger" onClick={handleClear} id="btn-clear-logs">
          <i className="fa-solid fa-trash-can" /> {t?.clear || "Clear"}
        </Button>
      }
      noPadding
    >
      <div className="bg-[#030407] h-[300px] overflow-y-auto font-header text-[0.82rem] p-4 rounded-b-lg custom-scrollbar" ref={consoleRef}>
        {logs.map((log) => {
          let typeClass = '';
          switch (log.className) {
            case 'system':
              typeClass = 'text-blue-400 border-blue-500';
              break;
            case 'gift':
              typeClass = 'text-pink-400 border-pink-500';
              break;
            case 'chat':
              typeClass = 'text-teal-400 border-teal-600';
              break;
            case 'error':
              typeClass = 'text-[#f87171] border-red-500';
              break;
          }

          return (
            <div key={log.id} className={`leading-relaxed mb-1 break-all border-l-2 pl-2 ${typeClass}`}>
              <span className="text-text-muted text-[0.72rem] mr-1">[{log.time}]</span>
              {' '}[{log.tag}] {log.message}
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}
