'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Button from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { BACKEND_URL } from '@/lib/constants';
import { useAppSelector } from '@/store/hooks';

type HealthState = 'checking' | 'online' | 'offline';

function StatusRow({ icon, label, value, detail, tone }: { icon: string; label: string; value: string; detail: string; tone: 'success' | 'warning' | 'danger' }) {
  const toneClass = tone === 'success' ? 'text-secondary bg-secondary/10 border-secondary/20' : tone === 'warning' ? 'text-primary bg-primary/10 border-primary/20' : 'text-danger bg-danger/10 border-danger/20';
  return (
    <div className="flex gap-3 rounded-xl border border-border-color bg-black/20 p-3">
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${toneClass}`}><i className={icon} /></div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2"><span className="text-sm font-bold text-white">{label}</span><span className={`text-[0.68rem] font-bold uppercase tracking-wide ${toneClass.split(' ')[0]}`}>{value}</span></div>
        <p className="mt-0.5 text-xs text-text-muted">{detail}</p>
      </div>
    </div>
  );
}

export default function StreamSetupPanel({ socketConnected }: { socketConnected: boolean }) {
  const toast = useToast();
  const language = useAppSelector((state) => state.dashboard.language) || 'vi';
  const streamStatus = useAppSelector((state) => state.dashboard.status);
  const selectedStreamer = useAppSelector((state) => state.dashboard.selectedStreamer);
  const user = useAppSelector((state) => state.auth.user);
  const streamerUsername = selectedStreamer || user?.username || '';
  const [health, setHealth] = useState<HealthState>('checking');
  const [overlayToken, setOverlayToken] = useState('');
  const [overlayError, setOverlayError] = useState('');

  const refreshStatus = useCallback(async () => {
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 5000);
    try {
      const response = await fetch(`${BACKEND_URL}/api/health`, { signal: controller.signal });
      setHealth(response.ok ? 'online' : 'offline');
    } catch {
      setHealth('offline');
    } finally {
      window.clearTimeout(timer);
    }
  }, []);

  const createOverlayLink = useCallback(async () => {
    const authToken = localStorage.getItem('auth_token');
    if (!streamerUsername || !authToken) {
      setOverlayError(language === 'vi' ? 'Không xác định được tài khoản streamer. Hãy đăng nhập lại.' : 'Streamer account is unavailable. Please sign in again.');
      return;
    }
    setOverlayError('');
    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/overlay-token?username=${encodeURIComponent(streamerUsername)}`, { headers: { Authorization: `Bearer ${authToken}` } });
      if (!response.ok) throw new Error('overlay-token');
      const data = await response.json() as { accessToken: string };
      setOverlayToken(data.accessToken);
    } catch {
      setOverlayError(language === 'vi' ? 'Không tạo được link overlay. Kiểm tra Backend, sau đó thử lại.' : 'Could not create the overlay link. Check Backend and try again.');
    }
  }, [language, streamerUsername]);

  useEffect(() => { void Promise.resolve().then(refreshStatus); }, [refreshStatus]);
  useEffect(() => { if (streamerUsername) void Promise.resolve().then(createOverlayLink); }, [createOverlayLink, streamerUsername]);

  const overlayUrl = useMemo(() => overlayToken && typeof window !== 'undefined' ? `${window.location.origin}/overlay?token=${encodeURIComponent(overlayToken)}` : '', [overlayToken]);
  const copyOverlayLink = async () => {
    if (!overlayUrl) return;
    try {
      await navigator.clipboard.writeText(overlayUrl);
      toast.success(language === 'vi' ? 'Đã sao chép link overlay. Dán vào Browser Source của OBS.' : 'Overlay link copied. Paste it into an OBS Browser Source.');
    } catch {
      toast.error(language === 'vi' ? 'Không thể sao chép tự động. Hãy sao chép link thủ công.' : 'Could not copy automatically. Please copy the link manually.');
    }
  };

  const backendOnline = health === 'online';
  const tiktokConnected = streamStatus.status === 'connected';
  return (
    <section className="glass-card rounded-2xl p-5 md:p-6">
      <div className="mb-5 flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
        <div><h2 className="font-header text-lg font-bold text-white"><i className="fa-solid fa-tower-broadcast mr-2 text-secondary" />{language === 'vi' ? 'Thiết lập & Trạng thái' : 'Setup & Status'}</h2><p className="mt-1 text-sm text-text-muted">{language === 'vi' ? 'Kiểm tra kết nối trước khi bắt đầu livestream.' : 'Check every connection before going live.'}</p></div>
        <Button type="button" variant="secondary" onClick={() => { void refreshStatus(); void createOverlayLink(); }} className="text-xs"><i className="fa-solid fa-rotate" />{language === 'vi' ? 'Kiểm tra lại' : 'Refresh'}</Button>
      </div>

      <div className="mt-5 rounded-xl border border-border-color bg-bg-input p-4">
        <div className="mb-2 flex items-center justify-between gap-3"><span className="text-sm font-bold text-white">{language === 'vi' ? 'Link OBS Browser Source' : 'OBS Browser Source URL'}</span>{overlayUrl && <Button type="button" variant="secondary" onClick={copyOverlayLink} className="px-3 py-1.5 text-xs"><i className="fa-regular fa-copy" />{language === 'vi' ? 'Sao chép' : 'Copy'}</Button>}</div>
        <code className="block overflow-x-auto rounded-lg border border-border-color bg-black/30 p-3 text-xs text-secondary">{overlayUrl || (language === 'vi' ? 'Đang tạo link bảo mật…' : 'Creating a secure link…')}</code>
        {overlayError && <p className="mt-2 text-xs text-danger"><i className="fa-solid fa-circle-exclamation mr-1" />{overlayError}</p>}
        <ol className="mt-4 space-y-1.5 pl-5 text-xs text-text-muted list-decimal"><li>{language === 'vi' ? 'Mở OBS → Sources → + → Browser.' : 'Open OBS → Sources → + → Browser.'}</li><li>{language === 'vi' ? 'Dán link ở trên, đặt kích thước 1080 × 1920.' : 'Paste the URL above and set it to 1080 × 1920.'}</li><li>{language === 'vi' ? 'Giữ nền trong suốt, sau đó bắt đầu kết nối TikTok.' : 'Keep the background transparent, then connect TikTok Live.'}</li></ol>
      </div>
      {!socketConnected && <p className="mt-3 text-xs text-primary"><i className="fa-solid fa-triangle-exclamation mr-1" />{language === 'vi' ? 'Dashboard đang mất kết nối realtime. Dữ liệu có thể chưa cập nhật ngay.' : 'The dashboard realtime connection is offline. Data may not update immediately.'}</p>}
    </section>
  );
}
