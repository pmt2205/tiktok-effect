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
import { BACKEND_URL } from '@/lib/constants';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const toast = useToast();
  const [isLogin, setIsLogin] = useState(true);
  const token = useAppSelector((state) => state.auth.token);
  const language = useAppSelector((state) => state.dashboard.language) || 'vi';

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

  const handleGoogleCallback = async (response: any) => {
    try {
      const tokenRes = await fetch(`${BACKEND_URL}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken: response.credential }),
      });
      
      if (tokenRes.ok) {
        const data = await tokenRes.json();
        localStorage.setItem('auth_token', data.accessToken);
        localStorage.setItem('auth_user', JSON.stringify(data.user));
        
        dispatch(initializeAuth({ token: data.accessToken, user: data.user }));
        toast.success(language === 'vi' ? 'Đăng nhập thành công!' : 'Sign in successful!');
        router.push('/');
      } else {
        const errorText = await tokenRes.text();
        console.error('Google login failed:', errorText);
        toast.error(language === 'vi' ? 'Đăng nhập Google thất bại!' : 'Google sign in failed!');
      }
    } catch (err) {
      console.error('Network error during Google login:', err);
      toast.error(language === 'vi' ? 'Lỗi kết nối mạng!' : 'Network error!');
    }
  };

  useEffect(() => {
    if (token || !isLogin) return;

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);
    
    script.onload = () => {
      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '142345860269-placeholder.apps.googleusercontent.com';
      if ((window as any).google) {
        (window as any).google.accounts.id.initialize({
          client_id: clientId,
          callback: handleGoogleCallback,
        });
        
        (window as any).google.accounts.id.renderButton(
          document.getElementById('google-signin-button'),
          { 
            theme: 'filled_black', 
            size: 'large', 
            shape: 'rectangular',
            text: 'continue_with',
            width: 380 
          }
        );
      }
    };

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [token, isLogin]);

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
          <>
            <LoginForm onSuccess={() => router.push('/')} />
            
            <div className="flex items-center gap-3 my-4.5 select-none">
              <div className="h-[1px] bg-border-color flex-1 opacity-60" />
              <span className="text-[0.7rem] text-text-muted font-bold uppercase tracking-[1px]">{language === 'vi' ? 'Hoặc' : 'OR'}</span>
              <div className="h-[1px] bg-border-color flex-1 opacity-60" />
            </div>

            <div className="relative w-full h-12 flex items-center justify-center gap-3 px-6 rounded-full border border-border-color bg-bg-input text-text-main font-body text-[0.92rem] font-semibold tracking-[0.5px] hover:border-secondary hover:bg-bg-card-hover hover:shadow-[0_0_15px_var(--color-secondary-glow)] hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 select-none overflow-hidden cursor-pointer">
              {/* Custom presentation elements (Google Logo & Text) */}
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.5 24c0-1.61-.15-3.16-.42-4.69H24v8.89h12.66c-.55 2.85-2.16 5.27-4.57 6.88l7.1 5.5C43.35 36.31 46.5 30.73 46.5 24z"/>
                <path fill="#FBBC05" d="M10.54 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.98-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.1-5.5c-1.97 1.32-4.5 2.11-7.79 2.11-6.26 0-11.57-4.22-13.46-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              </svg>
              <span>
                {language === 'vi' ? 'Tiếp tục với Google' : 'Continue with Google'}
              </span>

              {/* Hidden native Google button overlay */}
              <div
                id="google-signin-button"
                className="absolute inset-0 w-full h-full opacity-[0.001] cursor-pointer overflow-hidden z-10 flex items-center justify-center"
              />
            </div>
          </>
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
