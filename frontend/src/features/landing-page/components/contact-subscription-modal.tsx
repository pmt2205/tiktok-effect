'use client';

import { useEffect } from 'react';

const ZALO_PHONE = '0795533253';

export default function ContactSubscriptionModal({ planName, onClose }: { planName: string; onClose: () => void }) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 p-4 backdrop-blur-md" role="dialog" aria-modal="true" aria-labelledby="contact-subscription-title" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className="glass-card relative w-full max-w-md rounded-2xl border border-border-color p-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.4)] sm:p-8">
        <button type="button" onClick={onClose} aria-label="Đóng" className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-xl border border-border-color bg-bg-input text-text-muted transition-all duration-200 hover:border-secondary hover:text-secondary focus:border-secondary focus:outline-none focus:ring-3 focus:ring-secondary-glow">
          <i className="fa-solid fa-xmark" />
        </button>

        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-secondary/25 bg-secondary/10 text-2xl text-secondary shadow-[0_0_24px_var(--color-secondary-glow)]">
          <i className="fa-solid fa-comments" />
        </div>
        <h2 id="contact-subscription-title" className="mt-5 pr-10 font-header text-2xl font-bold text-white">Đăng ký {planName}</h2>
        <p className="mt-3 text-sm leading-6 text-text-secondary">
          Liên hệ Zalo để được xác nhận thanh toán và kích hoạt gói trực tiếp trên tài khoản của bạn.
        </p>

        <div className="mt-5 rounded-xl border border-border-color bg-bg-input p-4">
          <span className="block text-xs font-bold uppercase tracking-wider text-text-muted">Zalo hỗ trợ</span>
          <span className="mt-1 block font-header text-xl font-bold text-white">0795 533 253</span>
        </div>

        <a href={`https://zalo.me/${ZALO_PHONE}`} target="_blank" rel="noreferrer" className="keep-white mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-secondary px-5 py-3.5 text-sm font-extrabold text-white shadow-[0_4px_16px_var(--color-primary-glow)] transition-all duration-300 hover:-translate-y-0.5 focus:outline-none focus:ring-3 focus:ring-secondary-glow">
          <i className="fa-solid fa-arrow-up-right-from-square" />
          Mở trò chuyện Zalo
        </a>
        <p className="mt-3 text-center text-xs text-text-muted">Vui lòng gửi tên tài khoản và gói bạn muốn đăng ký.</p>
      </div>
    </div>
  );
}
