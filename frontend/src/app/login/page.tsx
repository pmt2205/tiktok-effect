'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import BackgroundGlows from '@/components/layout/background-glows';
import ShootingStars from '@/features/auth/components/shooting-stars';
import LoginForm from '@/features/auth/components/login-form';
import RegisterForm from '@/features/auth/components/register-form';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { initializeAuth, clearMessages } from '@/features/auth/store/auth-slice';

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [isLogin, setIsLogin] = useState(true);
  const token = useAppSelector((state) => state.auth.token);

  useEffect(() => {
    // If user is already logged in, redirect to dashboard
    const savedToken = localStorage.getItem('auth_token');
    const savedUser = localStorage.getItem('auth_user');
    
    if (savedToken && savedUser) {
      try {
        dispatch(initializeAuth({ 
          token: savedToken, 
          user: JSON.parse(savedUser) 
        }));
        router.push('/');
      } catch {
        // Clear corrupt storage
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
      }
    }
    
    return () => {
      dispatch(clearMessages());
    };
  }, [dispatch, router]);

  useEffect(() => {
    if (token) {
      router.push('/');
    }
  }, [token, router]);

  const handleToggleAuth = () => {
    setIsLogin(!isLogin);
    dispatch(clearMessages());
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-5 bg-gradient-to-b from-[#020205] via-[#07080d] to-[#0c081a] overflow-hidden">
      {/* 3D Twinkling Cosmic Starfield Layers */}
      <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.8)_1px,_transparent_1px)] bg-[size:180px_180px] bg-[position:0_0] pointer-events-none z-0 animate-twinkle" style={{ animationDuration: '5s' }} />
      <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.6)_1.5px,_transparent_1.5px)] bg-[size:280px_280px] bg-[position:40px_70px] pointer-events-none z-0 animate-twinkle" style={{ animationDuration: '8s', animationDelay: '1.5s' } as React.CSSProperties} />
      <div className="absolute inset-0 bg-[radial-gradient(rgba(0,242,254,0.4)_2px,_transparent_2px)] bg-[size:400px_400px] bg-[position:100px_220px] pointer-events-none z-0 animate-twinkle" style={{ animationDuration: '11s', animationDelay: '3s' } as React.CSSProperties} />

      <BackgroundGlows variant="login" />
      <ShootingStars />

      <div className="relative z-10 w-full max-w-[420px] bg-bg-surface rounded-xl border border-transparent shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] p-8 md:p-10 transition-all duration-300 hover:shadow-[0_8px_40px_0_rgba(0,242,254,0.15)] hover:-translate-y-0.5 border-glow-animated">
        <div className="text-center mb-8">
          <div className="w-64 h-32 mb-2 mx-auto transition-all duration-300 hover:scale-105 select-none relative">
            <Image src="/logo.png" alt="TikTok Effect Auto Logo" fill className="object-contain" priority />
          </div>
          <h2 className="font-header text-[1.5rem] font-bold text-center text-white leading-tight tracking-[0.5px]">TIKTOK LIVE</h2>
          <span className="font-header text-[0.7rem] text-secondary text-center tracking-[4px] block mt-1">EVENT & EFFECT MAPPING</span>
        </div>

        {isLogin ? (
          <LoginForm onSuccess={() => router.push('/')} />
        ) : (
          <RegisterForm onSuccess={() => setIsLogin(true)} />
        )}

        <div className="text-center text-[0.85rem] text-text-muted mt-6 pt-5 border-t border-border-color">
          {isLogin ? (
            <span>
              Don&apos;t have an account?{' '}
              <a href="#" className="text-secondary hover:text-primary transition-colors duration-200 font-semibold no-underline" onClick={(e) => { e.preventDefault(); handleToggleAuth(); }}>
                Sign Up
              </a>
            </span>
          ) : (
            <span>
              Already have an account?{' '}
              <a href="#" className="text-secondary hover:text-primary transition-colors duration-200 font-semibold no-underline" onClick={(e) => { e.preventDefault(); handleToggleAuth(); }}>
                Sign In
              </a>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
