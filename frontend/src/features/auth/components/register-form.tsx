'use client';

import React, { useState } from 'react';
import Button from '@/components/ui/button';
import Select from '@/components/ui/select';
import { BACKEND_URL } from '@/lib/constants';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { authStart, registerSuccess, authFailure } from '@/features/auth/store/auth-slice';
import { useToast } from '@/hooks/use-toast';

interface RegisterFormProps {
  onSuccess: () => void;
}

export default function RegisterForm({ onSuccess }: RegisterFormProps) {
  const dispatch = useAppDispatch();
  const toast = useToast();
  const { loading } = useAppSelector((state) => state.auth);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'user'>('user');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    dispatch(authStart());

    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      dispatch(registerSuccess('Registration successful! You can now sign in.'));
      toast.success('Registration successful! Redirecting to login...');
      
      // Auto-toggle back to login screen after success
      setTimeout(() => {
        onSuccess();
      }, 1500);
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
          placeholder="Choose Username"
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
            placeholder="Choose Password"
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

      <Select
        label="Role"
        value={role}
        options={[
          { value: 'user', label: 'User (Read-only Viewer)' },
          { value: 'admin', label: 'Admin (Full Control)' },
        ]}
        onChange={(val) => setRole(val as 'admin' | 'user')}
        disabled={loading}
        id="role-select"
      />

      <Button type="submit" disabled={loading} variant="gradient" fullWidth>
        {loading ? 'PROCESSING...' : 'REGISTER'}
      </Button>
    </form>
  );
}
