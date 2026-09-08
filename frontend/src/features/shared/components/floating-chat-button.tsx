'use client';

import React from 'react';

interface FloatingChatButtonProps {
  onClick: () => void;
  language?: 'vi' | 'en';
}

export default function FloatingChatButton({ onClick, language = 'vi' }: FloatingChatButtonProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-[#00f2fe] to-[#ff0050] text-white font-header font-bold text-sm shadow-[0_0_24px_rgba(0,242,254,0.4)] hover:shadow-[0_0_32px_rgba(255,0,80,0.6)] hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer outline-none border border-white/20 group"
      title={language === 'vi' ? 'Trò chuyện hỗ trợ với Admin' : 'Support Chat with Admin'}
    >
      <div className="relative">
        <i className="fa-solid fa-comments text-lg animate-pulse" />
        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-slate-900" />
      </div>
      <span className="hidden sm:inline-block tracking-wide font-semibold">
        {language === 'vi' ? 'Hỗ Trợ Admin' : 'Support Chat'}
      </span>
    </button>
  );
}
