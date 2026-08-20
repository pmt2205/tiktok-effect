'use client';

import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { removeToast, ToastMessage } from '@/features/shared/store/toast-slice';

export default function ToastContainer() {
  const toasts = useAppSelector((state) => state.toast.toasts);

  return (
    <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3.5 w-full max-w-[380px] pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
}

function ToastItem({ toast }: { toast: ToastMessage }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(removeToast(toast.id));
    }, toast.duration);
    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, dispatch]);

  let icon = <i className="fa-solid fa-circle-info text-secondary" />;
  let borderGlow = 'border-[#00f2fe]/20 shadow-[0_4px_20px_rgba(0,242,254,0.15)]';
  if (toast.type === 'success') {
    icon = <i className="fa-solid fa-circle-check text-success" />;
    borderGlow = 'border-success/30 shadow-[0_4px_20px_rgba(0,245,212,0.15)]';
  } else if (toast.type === 'error') {
    icon = <i className="fa-solid fa-circle-exclamation text-primary" />;
    borderGlow = 'border-primary/30 shadow-[0_4px_20px_rgba(255,0,80,0.15)]';
  } else if (toast.type === 'warning') {
    icon = <i className="fa-solid fa-triangle-exclamation text-warning" />;
    borderGlow = 'border-warning/30 shadow-[0_4px_20px_rgba(255,183,3,0.15)]';
  }

  return (
    <div
      className={`pointer-events-auto flex items-start gap-3.5 p-4 rounded-xl bg-bg-surface/85 backdrop-blur-xl border ${borderGlow} text-text-main animate-[fade-in-up_0.3s_ease-out] relative overflow-hidden transition-all duration-300 hover:scale-[1.02]`}
    >
      <span className="text-[1.2rem] mt-0.5 shrink-0 flex items-center justify-center">{icon}</span>
      <div className="flex-1 text-[0.88rem] leading-normal font-semibold pr-4">{toast.message}</div>
      <button
        onClick={() => dispatch(removeToast(toast.id))}
        className="text-text-muted hover:text-white transition-colors duration-150 absolute top-3.5 right-3.5 cursor-pointer text-[0.85rem]"
      >
        <i className="fa-solid fa-xmark" />
      </button>
    </div>
  );
}
