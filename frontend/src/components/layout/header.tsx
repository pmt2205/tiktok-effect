'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logout } from '@/features/auth/store/auth-slice';
import { setLanguage } from '@/features/admin-dashboard/store/dashboard-slice';
import { useToast } from '@/hooks/use-toast';

export default function Header() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const toast = useToast();
  const user = useAppSelector((state) => state.auth.user);
  const language = useAppSelector((state) => state.dashboard.language) || 'vi';
  
  const [time, setTime] = useState('00:00:00');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLightMode, setIsLightMode] = useState(false);
  
  const menuRef = useRef<HTMLDivElement>(null);

  // Sync isLightMode state with document class on mount
  useEffect(() => {
    const hasLightClass = document.documentElement.classList.contains('light-mode');
    setIsLightMode(hasLightClass);
  }, []);

  const toggleTheme = () => {
    const root = document.documentElement;
    if (isLightMode) {
      root.classList.remove('light-mode');
      localStorage.setItem('theme_preference', 'dark');
      setIsLightMode(false);
    } else {
      root.classList.add('light-mode');
      localStorage.setItem('theme_preference', 'light');
      setIsLightMode(true);
    }
  };

  useEffect(() => {
    const update = () => setTime(new Date().toTimeString().split(' ')[0]);
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on click outside
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

  const handleScrollToEffects = (e: React.MouseEvent) => {
    e.preventDefault();
    const section = document.getElementById('effects-section') || document.getElementById('mappings-section');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleScrollToHome = (e: React.MouseEvent) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const t = {
    vi: {
      home: 'Trang chủ',
      effects: 'Danh sách hiệu ứng',
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
      home: 'Home',
      effects: 'Effect List',
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
      <header className="flex justify-between items-center mb-6 py-2.5 border-b border-border-color relative z-40">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 cursor-pointer" onClick={handleScrollToHome}>
            <div className="w-20 h-10 relative select-none">
              <Image src="/logo.png" alt="TikTok Effect Auto Logo" fill className="object-contain" priority />
            </div>
            <div className="font-header hidden sm:block">
              <h1 className="text-[1.25rem] font-bold tracking-[0.5px] bg-gradient-to-r from-white to-[#b0b5c8] bg-clip-text text-transparent leading-none">TIKTOK LIVE</h1>
              <span className="text-[0.65rem] text-secondary uppercase tracking-[2.5px] font-semibold mt-0.5 block">Overlay Engine</span>
            </div>
          </div>

          {/* Navigation Links */}
          {user && (
            <nav className="hidden md:flex items-center gap-5 font-header text-[0.88rem]">
              <a 
                href="#" 
                onClick={handleScrollToHome}
                className="text-text-secondary hover:text-white transition-colors duration-150 font-medium"
              >
                {t.home}
              </a>
              <a 
                href="#" 
                onClick={handleScrollToEffects}
                className="text-text-secondary hover:text-secondary transition-colors duration-150 font-medium"
              >
                {t.effects}
              </a>
            </nav>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Language Switcher */}
          <button 
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border-color bg-white/4 text-text-muted hover:text-white hover:border-white/15 transition-all duration-200 text-[0.78rem] font-semibold cursor-pointer outline-none active:scale-95"
          >
            <i className="fa-solid fa-globe" />
            <span>{language.toUpperCase()}</span>
          </button>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="flex items-center justify-center w-8.5 h-8.5 rounded-full border border-border-color bg-white/4 text-text-muted hover:text-white hover:border-white/15 transition-all duration-200 cursor-pointer outline-none active:scale-[0.9] shadow-sm shrink-0"
            title={isLightMode ? (language === 'vi' ? 'Chế độ Tối' : 'Dark Mode') : (language === 'vi' ? 'Chế độ Sáng' : 'Light Mode')}
          >
            {isLightMode ? (
              <i className="fa-solid fa-moon text-[0.88rem] text-secondary" />
            ) : (
              <i className="fa-solid fa-sun text-[0.88rem] text-primary" />
            )}
          </button>

          {/* Time Clock */}
          <div className="hidden lg:flex items-center gap-2 font-header text-[0.88rem] bg-white/4 px-3.5 py-1.5 rounded-full border border-border-color text-text-muted select-none [font-variant-numeric:tabular-nums]">
            <i className="fa-regular fa-clock text-[0.8rem]" />
            <span>{time}</span>
          </div>

          {/* Username Dropdown */}
          {user && (
            <div className="relative" ref={menuRef}>
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-md border ${isMenuOpen ? 'border-secondary text-secondary ring-2 ring-secondary-glow/15' : 'border-border-color text-text-secondary'} bg-bg-surface/50 hover:bg-bg-surface hover:text-white transition-all duration-200 text-[0.82rem] font-semibold cursor-pointer outline-none`}
              >
                <i className="fa-regular fa-user" />
                <span className="max-w-[80px] truncate">{user.username}</span>
                <i className={`fa-solid fa-chevron-down text-[0.7rem] transition-transform duration-200 ${isMenuOpen ? 'rotate-180 text-secondary' : ''}`} />
              </button>

              {/* Profile Dropdown Menu */}
              {isMenuOpen && (
                <div className="absolute right-0 mt-1.5 w-44 bg-bg-surface/95 backdrop-blur-xl border border-border-color rounded-md p-1 shadow-[0_8px_32px_rgba(0,0,0,0.5)] flex flex-col gap-0.5 z-50 animate-[fade-in-up_0.15s_ease-out]">
                  <button 
                    onClick={() => { setIsProfileOpen(true); setIsMenuOpen(false); }}
                    className="w-full text-left px-3.5 py-2.5 rounded-sm text-[0.82rem] text-text-secondary hover:bg-secondary/10 hover:text-white transition-all duration-150 flex items-center gap-2 cursor-pointer outline-none"
                  >
                    <i className="fa-regular fa-id-card text-[0.9rem]" />
                    <span>{t.profile}</span>
                  </button>
                  <div className="h-[1px] bg-border-color my-0.5" />
                  <button 
                    onClick={handleLogout}
                    className="w-full text-left px-3.5 py-2.5 rounded-sm text-[0.82rem] text-[#f87171] hover:bg-primary/10 hover:text-[#ef4444] transition-all duration-150 flex items-center gap-2 cursor-pointer outline-none"
                  >
                    <i className="fa-solid fa-right-from-bracket text-[0.9rem]" />
                    <span>{t.logout}</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

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
