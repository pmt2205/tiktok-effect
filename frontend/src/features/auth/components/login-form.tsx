'use client';

import React, { useState } from 'react';
import Button from '@/components/ui/button';
import { BACKEND_URL } from '@/lib/constants';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { authStart, loginSuccess, authFailure } from '@/features/auth/store/auth-slice';
import { useToast } from '@/hooks/use-toast';

interface LoginFormProps {
  onSuccess: () => void;
}

export default function LoginForm({ onSuccess }: LoginFormProps) {
  const dispatch = useAppDispatch();
  const toast = useToast();
  const { loading } = useAppSelector((state) => state.auth);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    dispatch(authStart());

    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      dispatch(loginSuccess({
        token: data.accessToken,
        user: data.user,
      }));

      toast.success('Successfully logged in!');
      onSuccess();
    } catch (err: unknown) {
      const errMsg = (err as Error).message || 'Connection error';
      dispatch(authFailure(errMsg));
      toast.error(errMsg);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 w-full">
      <div className="flex flex-col gap-2">
        <label className="text-[0.88rem] text-text-secondary font-medium tracking-[0.5px]">Username or Email</label>
        <input
          type="text"
          placeholder="Username or Email"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          className="bg-bg-input border border-border-color rounded-md px-4 py-3 text-white font-body text-[0.95rem] outline-none transition-all duration-200 placeholder:text-white/20 disabled:opacity-50 focus:border-secondary focus:ring-3 focus:ring-secondary-glow/25"
          disabled={loading}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-[0.88rem] text-text-secondary font-medium tracking-[0.5px]">Password</label>
        <div className="relative w-full">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full bg-bg-input border border-border-color rounded-md pl-4 pr-12 py-3 text-white font-body text-[0.95rem] outline-none transition-all duration-200 placeholder:text-white/20 disabled:opacity-50 focus:border-primary focus:ring-3 focus:ring-primary-glow/25"
            disabled={loading}
          />
          <button 
            type="button"
            className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer select-none text-[1.05rem] text-text-muted hover:text-white transition-colors duration-150 outline-none bg-transparent border-none" 
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <i className="fa-solid fa-eye-slash" />
            ) : (
              <i className="fa-solid fa-eye" />
            )}
          </button>
        </div>
      </div>

      <div className="flex justify-between items-center text-[0.85rem] my-1">
        <a href="#" className="text-text-muted hover:text-secondary transition-colors duration-200 no-underline" onClick={(e) => e.preventDefault()}>Forgot Password?</a>
        <div className="flex items-center gap-2 text-text-secondary select-none">
          <span>Remember Me</span>
          <label className="relative inline-flex items-center cursor-pointer select-none">
            <input 
              type="checkbox" 
              checked={rememberMe} 
              onChange={(e) => setRememberMe(e.target.checked)} 
              disabled={loading}
              className="peer sr-only"
            />
            <span className="w-9 h-[18px] bg-white/8 rounded-full relative transition-all duration-300 border border-border-color after:absolute after:w-[12px] after:h-[12px] after:rounded-full after:bg-white after:top-[2px] after:left-[2px] after:transition-all after:duration-300 after:ease-out after:shadow-[0_1px_2px_rgba(0,0,0,0.3)] peer-checked:bg-primary peer-checked:border-transparent peer-checked:shadow-[0_0_8px_var(--color-primary-glow)] peer-checked:after:translate-x-[16px]" />
          </label>
        </div>
      </div>

      <Button type="submit" disabled={loading} variant="gradient" fullWidth>
        {loading ? 'PROCESSING...' : 'LOGIN'}
      </Button>
    </form>
  );
}
