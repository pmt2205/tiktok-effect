'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logout } from '@/features/auth/store/auth-slice';
import { setLanguage } from '@/features/admin-dashboard/store/dashboard-slice';

interface AdminSidebarProps {
  activeTab: 'home' | 'effects' | 'users';
  setActiveTab: (tab: 'home' | 'effects' | 'users') => void;
}

export default function AdminSidebar({ activeTab, setActiveTab }: AdminSidebarProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const language = useAppSelector((state) => state.dashboard.language) || 'vi';
  
  const [time, setTime] = useState('00:00:00');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const update = () => setTime(new Date().toTimeString().split(' ')[0]);
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    router.push('/login');
  };

  const toggleLanguage = () => {
    dispatch(setLanguage(language === 'vi' ? 'en' : 'vi'));
  };

  const t = {
    vi: {
      home: 'Trang chủ',
      effects: 'Quản lý hiệu ứng',
      users: 'Quản lý user',
      profile: 'Hồ sơ',
      logout: 'Đăng xuất',
      role: 'Vai trò',
      username: 'Tên tài khoản',
      joined: 'Tham gia',
      admin: 'Quản trị viên',
      user: 'Người dùng',
      status: 'Trạng thái',
      active: 'Đang hoạt động',
      close: 'Đóng',
    },
    en: {
      home: 'Dashboard Console',
      effects: 'Manage Effects',
      users: 'Manage Users',
      profile: 'Profile',
      logout: 'Logout',
      role: 'Role',
      username: 'Username',
      joined: 'Joined',
      admin: 'Admin',
      user: 'User',
      status: 'Status',
      active: 'Active',
      close: 'Close',
    }
  }[language];

  return (
    <>
      <aside className="w-64 min-h-screen bg-bg-surface/90 border-r border-border-color flex flex-col justify-between p-5 py-6 shrink-0 relative z-45">
        {/* Top Section: Logo & Brand */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('home')}>
            <div className="w-16 h-8 relative select-none">
              <Image src="/logo.png" alt="TikTok Live Effect Logo" fill className="object-contain" priority />
            </div>
            <div className="font-header">
              <h1 className="text-[1.05rem] font-bold tracking-[0.5px] bg-gradient-to-r from-white to-[#b0b5c8] bg-clip-text text-transparent leading-none">TIKTOK LIVE</h1>
              <span className="text-[0.58rem] text-secondary uppercase tracking-[1.5px] font-semibold mt-0.5 block">ADMIN PORTAL</span>
            </div>
          </div>

          <div className="h-[1px] bg-border-color/60 w-full" />

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1.5 font-header text-[0.88rem]">
            <button
              onClick={() => setActiveTab('home')}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-md transition-all duration-200 text-left outline-none ${
                activeTab === 'home'
                  ? 'bg-secondary/10 border-l-2 border-secondary text-white font-semibold'
                  : 'text-text-secondary hover:bg-white/4 hover:text-white border-l-2 border-transparent'
              }`}
            >
              <i className="fa-solid fa-chart-line text-[0.95rem] w-5 text-center" />
              <span>{t.home}</span>
            </button>

            <button
              onClick={() => setActiveTab('effects')}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-md transition-all duration-200 text-left outline-none ${
                activeTab === 'effects'
                  ? 'bg-secondary/10 border-l-2 border-secondary text-white font-semibold'
                  : 'text-text-secondary hover:bg-white/4 hover:text-white border-l-2 border-transparent'
              }`}
            >
              <i className="fa-solid fa-gift text-[0.95rem] w-5 text-center" />
              <span>{t.effects}</span>
            </button>

            <button
              onClick={() => setActiveTab('users')}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-md transition-all duration-200 text-left outline-none ${
                activeTab === 'users'
                  ? 'bg-secondary/10 border-l-2 border-secondary text-white font-semibold'
                  : 'text-text-secondary hover:bg-white/4 hover:text-white border-l-2 border-transparent'
              }`}
            >
              <i className="fa-solid fa-users text-[0.95rem] w-5 text-center" />
              <span>{t.users}</span>
            </button>
          </nav>
        </div>

        {/* Bottom Section: Clock, Language, User Dropdown */}
        <div className="flex flex-col gap-4 mt-auto">
          {/* Time Clock */}
          <div className="flex items-center gap-2 font-header text-[0.78rem] bg-white/4 px-3.5 py-2 rounded-md border border-border-color/60 text-text-muted select-none [font-variant-numeric:tabular-nums]">
            <i className="fa-regular fa-clock text-[0.8rem]" />
            <span>{time}</span>
          </div>

          <div className="flex items-center justify-between gap-2.5">
            {/* Language Switcher */}
            <button 
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border-color bg-white/4 text-text-muted hover:text-white hover:border-white/15 transition-all duration-200 text-[0.78rem] font-semibold cursor-pointer outline-none active:scale-95"
            >
              <i className="fa-solid fa-globe" />
              <span>{language.toUpperCase()}</span>
            </button>

            {/* Username Dropdown */}
            {user && (
              <div className="relative" ref={menuRef}>
                <button 
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md border ${isMenuOpen ? 'border-secondary text-secondary ring-2 ring-secondary-glow/15' : 'border-border-color text-text-secondary'} bg-bg-surface/50 hover:bg-bg-surface hover:text-white transition-all duration-200 text-[0.82rem] font-semibold cursor-pointer outline-none`}
                >
                  <i className="fa-regular fa-user text-[0.85rem]" />
                  <span className="max-w-[70px] truncate">{user.username}</span>
                  <i className={`fa-solid fa-chevron-down text-[0.65rem] transition-transform duration-200 ${isMenuOpen ? 'rotate-180 text-secondary' : ''}`} />
                </button>

                {/* Profile Dropdown Menu */}
                {isMenuOpen && (
                  <div className="absolute right-0 bottom-full mb-1.5 w-40 bg-bg-surface/95 backdrop-blur-xl border border-border-color rounded-md p-1 shadow-[0_8px_32px_rgba(0,0,0,0.5)] flex flex-col gap-0.5 z-50 animate-[fade-in-up_0.15s_ease-out]">
                    <button 
                      onClick={() => { setIsProfileOpen(true); setIsMenuOpen(false); }}
                      className="w-full text-left px-3 py-2 rounded-sm text-[0.82rem] text-text-secondary hover:bg-secondary/10 hover:text-white transition-all duration-150 flex items-center gap-2 cursor-pointer outline-none"
                    >
                      <i className="fa-regular fa-id-card text-[0.85rem]" />
                      <span>{t.profile}</span>
                    </button>
                    <div className="h-[1px] bg-border-color my-0.5" />
                    <button 
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 rounded-sm text-[0.82rem] text-[#f87171] hover:bg-primary/10 hover:text-[#ef4444] transition-all duration-150 flex items-center gap-2 cursor-pointer outline-none"
                    >
                      <i className="fa-solid fa-right-from-bracket text-[0.85rem]" />
                      <span>{t.logout}</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* User Profile Modal */}
      {isProfileOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-5 bg-black/75 backdrop-blur-sm animate-[fade-in_0.2s_ease-out]">
          <div className="relative w-full max-w-[360px] bg-bg-surface border border-border-color rounded-2xl shadow-[0_12px_48px_rgba(0,0,0,0.6)] p-6 md:p-8 animate-[fade-in-up_0.3s_cubic-bezier(0.175,0.885,0.32,1.275)]">
            <h3 className="font-header text-[1.25rem] font-bold text-white mb-5 flex items-center gap-2 border-b border-border-color pb-3">
              <i className="fa-regular fa-circle-user text-secondary" />
              <span>{t.profile}</span>
            </h3>

            <div className="flex flex-col gap-4 font-body text-[0.88rem]">
              <div className="flex justify-between border-b border-border-color/40 pb-2.5">
                <span className="text-text-muted">{t.username}</span>
                <span className="text-white font-semibold">{user?.username}</span>
              </div>
              <div className="flex justify-between border-b border-border-color/40 pb-2.5">
                <span className="text-text-muted">{t.role}</span>
                <span className="text-secondary font-semibold capitalize">
                  {user?.role === 'admin' ? t.admin : t.user}
                </span>
              </div>
              <div className="flex justify-between border-b border-border-color/40 pb-2.5">
                <span className="text-text-muted">{t.joined}</span>
                <span className="text-text-secondary font-semibold">2026-08-20</span>
              </div>
              <div className="flex justify-between pb-1">
                <span className="text-text-muted">{t.status}</span>
                <span className="text-success font-semibold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                  {t.active}
                </span>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button 
                onClick={() => setIsProfileOpen(false)}
                className="px-5 py-2 rounded-md font-body text-[0.8rem] font-semibold bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-white/20 transition-all duration-200 cursor-pointer outline-none active:scale-95"
              >
                {t.close}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
