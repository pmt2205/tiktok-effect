'use client';

import React, { useState } from 'react';
import Button from '@/components/ui/button';
import { BACKEND_URL } from '@/lib/constants';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { authStart, loginSuccess, authFailure } from '@/features/auth/store/auth-slice';
import { useToast } from '@/hooks/use-toast';
import { getApiErrorMessage } from '@/features/auth/lib/register-validation';
import { LoginField, validateLogin } from '@/features/auth/lib/login-validation';

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
  const [touched, setTouched] = useState<Partial<Record<LoginField, boolean>>>({});
  const [formError, setFormError] = useState('');

  const values = { username, password };
  const clientErrors = validateLogin(values);
  const fieldError = (field: LoginField) => touched[field] ? clientErrors[field] : undefined;

  const updateField = (field: LoginField, value: string) => {
    if (field === 'username') setUsername(value);
    if (field === 'password') setPassword(value);
    setFormError('');
  };

  const touchField = (field: LoginField) => {
    setTouched((current) => ({ ...current, [field]: true }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setTouched({ username: true, password: true });
    const validationErrors = validateLogin(values);
    const firstError = Object.values(validationErrors)[0];
    if (firstError) {
      toast.error(firstError);
      return;
    }

    dispatch(authStart());
    setFormError('');

    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        const message = res.status === 401
          ? 'Tài khoản hoặc mật khẩu không chính xác.'
          : res.status === 429
            ? 'Bạn thử đăng nhập quá nhiều lần. Vui lòng chờ một lúc rồi thử lại.'
            : getApiErrorMessage(data, 'Không thể đăng nhập. Vui lòng thử lại.');
        setFormError(message);
        throw new Error(message);
      }

      dispatch(loginSuccess({
        token: data.accessToken,
        user: data.user,
      }));

      toast.success('Đăng nhập thành công!');
      onSuccess();
    } catch (err: unknown) {
      const errMsg = (err as Error).message || 'Không thể kết nối tới máy chủ.';
      setFormError(errMsg);
      dispatch(authFailure(errMsg));
      toast.error(errMsg);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 w-full">
      <div className="flex flex-col gap-2">
        <label htmlFor="login-username" className="text-[0.88rem] text-text-secondary font-medium tracking-[0.5px]">Tài khoản hoặc email</label>
        <input
          id="login-username"
          type="text"
          autoComplete="username"
          placeholder="Nhập tài khoản hoặc email"
          value={username}
          onChange={(e) => updateField('username', e.target.value)}
          onBlur={() => touchField('username')}
          aria-invalid={Boolean(fieldError('username'))}
          aria-describedby={fieldError('username') ? 'login-username-error' : undefined}
          required
          className={`bg-bg-input border rounded-md px-4 py-3 text-white font-body text-[0.95rem] outline-none transition-all duration-200 placeholder:text-white/20 disabled:opacity-50 focus:ring-3 ${fieldError('username') ? 'border-primary focus:border-primary focus:ring-primary-glow/25' : 'border-border-color focus:border-secondary focus:ring-secondary-glow/25'}`}
          disabled={loading}
        />
        {fieldError('username') && <p id="login-username-error" className="text-primary text-xs" role="alert">{fieldError('username')}</p>}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="login-password" className="text-[0.88rem] text-text-secondary font-medium tracking-[0.5px]">Mật khẩu</label>
        <div className="relative w-full">
          <input
            id="login-password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder="Nhập mật khẩu"
            value={password}
            onChange={(e) => updateField('password', e.target.value)}
            onBlur={() => touchField('password')}
            aria-invalid={Boolean(fieldError('password'))}
            aria-describedby={fieldError('password') ? 'login-password-error' : undefined}
            required
            className={`w-full bg-bg-input border rounded-md pl-4 pr-12 py-3 text-white font-body text-[0.95rem] outline-none transition-all duration-200 placeholder:text-white/20 disabled:opacity-50 focus:border-primary focus:ring-3 focus:ring-primary-glow/25 ${fieldError('password') ? 'border-primary' : 'border-border-color'}`}
            disabled={loading}
          />
          <button 
            type="button"
            aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
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
        {fieldError('password') && <p id="login-password-error" className="text-primary text-xs" role="alert">{fieldError('password')}</p>}
      </div>

      {formError && (
        <div className="rounded-md border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-primary" role="alert">
          {formError}
        </div>
      )}

      <div className="flex justify-between items-center text-[0.85rem] my-1">
        <a href="#" className="text-text-muted hover:text-secondary transition-colors duration-200 no-underline" onClick={(e) => e.preventDefault()}>Quên mật khẩu?</a>
        <div className="flex items-center gap-2 text-text-secondary select-none">
          <span>Ghi nhớ</span>
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
        {loading ? 'ĐANG XỬ LÝ...' : 'ĐĂNG NHẬP'}
      </Button>
    </form>
  );
}
