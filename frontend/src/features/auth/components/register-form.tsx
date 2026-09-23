'use client';

import React, { useState } from 'react';
import Button from '@/components/ui/button';
import LoadingIndicator from '@/components/ui/loading-indicator';
import { BACKEND_URL } from '@/lib/constants';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { authStart, registerSuccess, authFailure } from '@/features/auth/store/auth-slice';
import { useToast } from '@/hooks/use-toast';
import {
  getApiErrorMessage,
  RegisterErrors,
  RegisterField,
  validateRegistration,
} from '@/features/auth/lib/register-validation';

interface RegisterFormProps {
  onSuccess: () => void;
}

export default function RegisterForm({ onSuccess }: RegisterFormProps) {
  const dispatch = useAppDispatch();
  const toast = useToast();
  const { loading } = useAppSelector((state) => state.auth);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [touched, setTouched] = useState<Partial<Record<RegisterField, boolean>>>({});
  const [serverErrors, setServerErrors] = useState<RegisterErrors>({});

  const values = { username, password, confirmPassword };
  const clientErrors = validateRegistration(values);
  const fieldError = (field: RegisterField) => serverErrors[field] || (touched[field] ? clientErrors[field] : undefined);

  const updateField = (field: RegisterField, value: string) => {
    if (field === 'username') setUsername(value);
    if (field === 'password') setPassword(value);
    if (field === 'confirmPassword') setConfirmPassword(value);
    setServerErrors((current) => ({ ...current, [field]: undefined }));
  };

  const touchField = (field: RegisterField) => {
    setTouched((current) => ({ ...current, [field]: true }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setTouched({ username: true, password: true, confirmPassword: true });
    const validationErrors = validateRegistration(values);
    const firstError = Object.values(validationErrors)[0];
    if (firstError) {
      toast.error(firstError);
      return;
    }

    dispatch(authStart());

    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password }),
      });

      const data: unknown = await res.json();

      if (!res.ok) {
        const message = getApiErrorMessage(data, 'Không thể đăng ký. Vui lòng thử lại.');
        if (res.status === 409) setServerErrors({ username: message });
        throw new Error(message);
      }

      dispatch(registerSuccess('Đăng ký thành công! Bạn có thể đăng nhập.'));
      toast.success('Đăng ký thành công! Đang chuyển sang đăng nhập...');
      
      // Auto-toggle back to login screen after success
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (err: unknown) {
      const errMsg = (err as Error).message || 'Không thể kết nối tới máy chủ.';
      dispatch(authFailure(errMsg));
      toast.error(errMsg);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 w-full">
      <div className="flex flex-col gap-2">
        <label htmlFor="register-username" className="text-[0.88rem] text-text-secondary font-medium tracking-[0.5px]">Tài khoản hoặc email</label>
        <input
          id="register-username"
          type="text"
          autoComplete="username"
          placeholder="Nhập tài khoản hoặc email"
          value={username}
          onChange={(e) => updateField('username', e.target.value)}
          onBlur={() => touchField('username')}
          aria-invalid={Boolean(fieldError('username'))}
          aria-describedby={fieldError('username') ? 'register-username-error' : undefined}
          required
          className={`bg-bg-input border rounded-md px-4 py-3 text-text-main font-body text-[0.95rem] outline-none transition-all duration-200 placeholder:text-text-muted disabled:opacity-50 focus:ring-3 ${fieldError('username') ? 'border-primary focus:border-primary focus:ring-primary-glow/25' : 'border-border-color focus:border-secondary focus:ring-secondary-glow/25'}`}
          disabled={loading}
        />
        {fieldError('username') && <p id="register-username-error" className="text-primary text-xs" role="alert">{fieldError('username')}</p>}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="register-password" className="text-[0.88rem] text-text-secondary font-medium tracking-[0.5px]">Mật khẩu</label>
        <div className="relative w-full">
          <input
            id="register-password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder="Tạo mật khẩu"
            value={password}
            onChange={(e) => updateField('password', e.target.value)}
            onBlur={() => touchField('password')}
            aria-invalid={Boolean(fieldError('password'))}
            aria-describedby={fieldError('password') ? 'register-password-error' : 'register-password-hint'}
            required
            className={`w-full bg-bg-input border rounded-md pl-4 pr-12 py-3 text-text-main font-body text-[0.95rem] outline-none transition-all duration-200 placeholder:text-text-muted disabled:opacity-50 focus:border-primary focus:ring-3 focus:ring-primary-glow/25 ${fieldError('password') ? 'border-primary' : 'border-border-color'}`}
            disabled={loading}
          />
          <button 
            type="button"
            className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer select-none text-[1.05rem] text-text-muted hover:text-text-main transition-colors duration-150 outline-none bg-transparent border-none" 
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <i className="fa-solid fa-eye-slash" />
            ) : (
              <i className="fa-solid fa-eye" />
            )}
          </button>
        </div>
        {fieldError('password') ? (
          <p id="register-password-error" className="text-primary text-xs" role="alert">{fieldError('password')}</p>
        ) : (
          <p id="register-password-hint" className="text-text-muted text-xs">10–128 ký tự, gồm chữ hoa, chữ thường và số.</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="register-confirm-password" className="text-[0.88rem] text-text-secondary font-medium tracking-[0.5px]">Xác nhận mật khẩu</label>
        <div className="relative w-full">
          <input
            id="register-confirm-password"
            type={showConfirmPassword ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder="Nhập lại mật khẩu"
            value={confirmPassword}
            onChange={(e) => updateField('confirmPassword', e.target.value)}
            onBlur={() => touchField('confirmPassword')}
            aria-invalid={Boolean(fieldError('confirmPassword'))}
            aria-describedby={fieldError('confirmPassword') ? 'register-confirm-password-error' : undefined}
            required
            className={`w-full bg-bg-input border rounded-md pl-4 pr-12 py-3 text-text-main font-body text-[0.95rem] outline-none transition-all duration-200 placeholder:text-text-muted disabled:opacity-50 focus:border-primary focus:ring-3 focus:ring-primary-glow/25 ${fieldError('confirmPassword') ? 'border-primary' : 'border-border-color'}`}
            disabled={loading}
          />
          <button
            type="button"
            aria-label={showConfirmPassword ? 'Ẩn mật khẩu xác nhận' : 'Hiện mật khẩu xác nhận'}
            className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer select-none text-[1.05rem] text-text-muted hover:text-text-main transition-colors duration-150 outline-none bg-transparent border-none"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            <i className={`fa-solid ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`} />
          </button>
        </div>
        {fieldError('confirmPassword') && <p id="register-confirm-password-error" className="text-primary text-xs" role="alert">{fieldError('confirmPassword')}</p>}
      </div>

      <Button type="submit" disabled={loading} variant="gradient" fullWidth>
        {loading ? <LoadingIndicator size="sm" /> : 'ĐĂNG KÝ'}
      </Button>
    </form>
  );
}
