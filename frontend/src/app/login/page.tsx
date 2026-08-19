'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import BackgroundGlows from '@/components/layout/BackgroundGlows';
import Button from '@/components/ui/Button';
import { BACKEND_URL } from '@/lib/constants';

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'user'>('user');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    // If user is already logged in, redirect to dashboard
    const token = localStorage.getItem('auth_token');
    if (token) {
      router.push('/');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    const url = isLogin ? `${BACKEND_URL}/api/auth/login` : `${BACKEND_URL}/api/auth/register`;
    const body = isLogin ? { username, password } : { username, password, role };

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      if (isLogin) {
        localStorage.setItem('auth_token', data.accessToken);
        localStorage.setItem('auth_user', JSON.stringify(data.user));
        setSuccessMsg('Login successful! Redirecting...');
        setTimeout(() => {
          router.push('/');
        }, 1500);
      } else {
        setSuccessMsg('Registration successful! You can now sign in.');
        setIsLogin(true);
        setPassword('');
      }
    } catch (err: any) {
      setError(err.message || 'Connection error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page-container">
      <BackgroundGlows />
      
      {/* Background Graphic Rings/Vectors to match the image */}
      <div className="graphic-decorations">
        <div className="ring-1"></div>
        <div className="ring-2"></div>
        <div className="neon-line-blue"></div>
        <div className="neon-line-pink"></div>
      </div>

      <div className="login-card glass-card">
        <div className="login-header">
          <div className="logo-icon-container">
            {/* TikTok glowing logo icon */}
            <svg className="logo-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12.525 2C12.525 4.316 13.9 6.273 15.82 7.027V10.222C14.772 10.222 13.565 9.873 12.525 9.176V16.326C12.525 19.458 10.024 22 6.945 22C3.866 22 1.365 19.458 1.365 16.326C1.365 13.195 3.866 10.653 6.945 10.653C7.433 10.653 7.892 10.72 8.324 10.842V14.137C7.892 13.929 7.422 13.805 6.945 13.805C5.58 13.805 4.472 14.935 4.472 16.326C4.472 17.717 5.58 18.847 6.945 18.847C8.31 18.847 9.418 17.717 9.418 16.326V2H12.525ZM22.635 7.03C22.635 6.46 22.17 6 21.6 6C18.665 6 16.223 3.96 15.69 1.13C15.602 0.66 15.203 0.32 14.726 0.32H12.525V3.53C13.918 3.53 15.215 4.19 16.035 5.29C14.78 6.55 13.99 8.29 13.99 10.22H17.15C17.15 8.91 17.84 7.74 18.89 7.07C19.78 7.82 20.93 8.28 22.19 8.28H22.635V7.03Z" fill="currentColor"/>
            </svg>
          </div>
          <h2>TIKTOK LIVE</h2>
          <span className="subtitle">EVENT & EFFECT MAPPING</span>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group-vertical">
            <label className="input-label">Username or Email</label>
            <input
              type="text"
              placeholder="Username or Email"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="input-field-cyan"
            />
          </div>

          <div className="input-group-vertical">
            <label className="input-label">Password</label>
            <div className="password-input-wrapper">
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="input-field-pink"
              />
              <span className="password-toggle-icon">👁️</span>
            </div>
          </div>

          {!isLogin && (
            <div className="input-group-vertical">
              <label className="input-label">Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as 'admin' | 'user')}
                className="select-control-pink"
              >
                <option value="user">User (Read-only Viewer)</option>
                <option value="admin">Admin (Full Control)</option>
              </select>
            </div>
          )}

          {isLogin && (
            <div className="form-options">
              <a href="#" className="forgot-pass" onClick={(e) => e.preventDefault()}>Forgot Password?</a>
              <div className="remember-me">
                <span>Remember Me</span>
                <label className="toggle-switch-sm">
                  <input 
                    type="checkbox" 
                    checked={rememberMe} 
                    onChange={(e) => setRememberMe(e.target.checked)} 
                  />
                  <span className="slider-switch-sm"></span>
                </label>
              </div>
            </div>
          )}

          {error && <div className="error-msg">{error}</div>}
          {successMsg && <div className="success-msg">{successMsg}</div>}

          <Button type="submit" disabled={loading} variant="gradient" fullWidth>
            {loading ? 'PROCESSING...' : isLogin ? 'LOGIN' : 'REGISTER'}
          </Button>
        </form>

        <div className="login-footer">
          {isLogin ? (
            <span>
              Don't have an account?{' '}
              <a href="#" className="toggle-auth-link" onClick={(e) => { e.preventDefault(); setIsLogin(false); setError(''); setSuccessMsg(''); }}>
                Sign Up
              </a>
            </span>
          ) : (
            <span>
              Already have an account?{' '}
              <a href="#" className="toggle-auth-link" onClick={(e) => { e.preventDefault(); setIsLogin(true); setError(''); setSuccessMsg(''); }}>
                Sign In
              </a>
            </span>
          )}
        </div>
      </div>

      <style jsx global>{`
        .login-page-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background: #07080d;
          position: relative;
          overflow: hidden;
        }

        /* Starry background effect matching the mockup */
        .login-page-container::after {
          content: '';
          position: absolute;
          inset: 0;
          background-image: 
            radial-gradient(white, rgba(255,255,255,.3) 1px, transparent 40px),
            radial-gradient(white, rgba(255,255,255,.2) 1.5px, transparent 35px),
            radial-gradient(white, rgba(255,255,255,.1) 2px, transparent 45px);
          background-size: 450px 450px, 300px 300px, 200px 200px;
          background-position: 0 0, 40px 60px, 130px 270px;
          opacity: 0.22;
          pointer-events: none;
          z-index: 0;
        }

        /* Graphic decorations */
        .graphic-decorations {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 0;
        }

        /* Large circular path behind the card */
        .ring-1 {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 580px;
          height: 580px;
          border: 1px solid rgba(255, 255, 255, 0.03);
          border-radius: 50%;
        }

        .ring-2 {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-53%, -47%) rotate(25deg);
          width: 490px;
          height: 490px;
          border: 1.5px dashed rgba(255, 255, 255, 0.025);
          border-radius: 50%;
        }

        /* Glowing blue diagonal capsule in top-right */
        .neon-line-blue {
          position: absolute;
          top: 25%;
          right: 32%;
          width: 140px;
          height: 12px;
          background: #00f2fe;
          border-radius: 999px;
          transform: rotate(-45deg);
          filter: blur(1px) drop-shadow(0 0 10px rgba(0, 242, 254, 0.6));
          opacity: 0.65;
        }

        /* Glowing red diagonal accent in bottom-left */
        .neon-line-pink {
          position: absolute;
          bottom: 30%;
          left: 32%;
          width: 80px;
          height: 8px;
          background: #ff0050;
          border-radius: 999px;
          transform: rotate(-45deg);
          filter: blur(1px) drop-shadow(0 0 10px rgba(255, 0, 80, 0.6));
          opacity: 0.65;
        }

        .login-card {
          width: 100%;
          max-width: 440px;
          z-index: 1;
          background: rgba(16, 18, 32, 0.55);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.5);
          padding: 40px 35px;
          position: relative;
        }

        /* Glowing dual border */
        .login-card::after {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 20px;
          padding: 1.5px;
          background: linear-gradient(135deg, #ff0050 0%, transparent 40%, transparent 60%, #00f2fe 100%);
          -webkit-mask: 
            linear-gradient(#fff 0 0) content-box, 
            linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
          z-index: 2;
        }

        .login-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          margin-bottom: 30px;
        }

        .logo-icon-container {
          width: 64px;
          height: 64px;
          border-radius: 18px;
          background: rgba(0, 0, 0, 0.25);
          border: 1px solid rgba(255, 0, 80, 0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 12px;
          box-shadow: 0 0 20px rgba(255, 0, 80, 0.25);
          color: #ff0050;
        }

        .logo-svg {
          width: 32px;
          height: 32px;
          filter: drop-shadow(0 0 4px rgba(0, 242, 254, 0.8));
          color: #ffffff;
        }

        .login-header h2 {
          font-family: 'Space Grotesk', system-ui, sans-serif;
          font-size: 1.65rem;
          font-weight: 700;
          letter-spacing: 2px;
          color: #ffffff;
          line-height: 1.2;
        }

        .login-header .subtitle {
          font-size: 0.72rem;
          color: #7c819a;
          text-transform: uppercase;
          letter-spacing: 3px;
          font-weight: 600;
          margin-top: 4px;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .input-group-vertical {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .input-label {
          font-size: 0.82rem;
          color: #c5c8d4;
          font-weight: 500;
          letter-spacing: 0.5px;
        }

        .input-field-cyan, .input-field-pink, .select-control-pink {
          width: 100%;
          background: rgba(0, 0, 0, 0.35);
          border: 1px solid rgba(255, 255, 255, 0.08);
          outline: none;
          color: #fff;
          padding: 12px 18px;
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 0.95rem;
          border-radius: 999px;
          transition: all 0.25s ease-in-out;
        }

        /* Specific border colors matching the mockup */
        .input-field-cyan {
          border-color: rgba(0, 242, 254, 0.35);
        }

        .input-field-cyan:focus {
          border-color: #00f2fe;
          box-shadow: 0 0 10px rgba(0, 242, 254, 0.25);
        }

        .input-field-pink, .select-control-pink {
          border-color: rgba(255, 0, 80, 0.35);
        }

        .input-field-pink:focus, .select-control-pink:focus {
          border-color: #ff0050;
          box-shadow: 0 0 10px rgba(255, 0, 80, 0.25);
        }

        .password-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .password-toggle-icon {
          position: absolute;
          right: 18px;
          cursor: pointer;
          color: #7c819a;
          font-size: 0.95rem;
          user-select: none;
        }

        .password-toggle-icon:hover {
          color: #fff;
        }

        .form-options {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.82rem;
          margin-top: -4px;
        }

        .forgot-pass {
          color: #ff0050;
          text-decoration: none;
          font-weight: 500;
          transition: opacity 0.2s;
        }

        .forgot-pass:hover {
          opacity: 0.8;
        }

        .remember-me {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #7c819a;
        }

        /* Remember Me Toggle Switch */
        .toggle-switch-sm {
          position: relative;
          display: inline-block;
          width: 38px;
          height: 20px;
        }

        .toggle-switch-sm input {
          display: none;
        }

        .slider-switch-sm {
          position: absolute;
          cursor: pointer;
          inset: 0;
          background-color: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 999px;
          transition: 0.3s;
        }

        .slider-switch-sm::before {
          position: absolute;
          content: "";
          height: 14px;
          width: 14px;
          left: 2px;
          bottom: 2px;
          background-color: white;
          border-radius: 50%;
          transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .toggle-switch-sm input:checked + .slider-switch-sm {
          background-color: #00f2fe;
          border-color: transparent;
          box-shadow: 0 0 8px rgba(0, 242, 254, 0.4);
        }

        .toggle-switch-sm input:checked + .slider-switch-sm::before {
          transform: translateX(18px);
        }

        /* Pill shape gradient login button with strong double glow */
        .btn-login-gradient {
          width: 100%;
          height: 48px;
          border-radius: 999px;
          border: none;
          background: linear-gradient(to right, #ff0050 0%, #00f2fe 100%);
          color: white;
          font-family: 'Space Grotesk', system-ui, sans-serif;
          font-size: 0.95rem;
          font-weight: 700;
          letter-spacing: 2px;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 
            0 0 15px rgba(255, 0, 80, 0.3), 
            0 0 15px rgba(0, 242, 254, 0.3);
          margin-top: 10px;
        }

        .btn-login-gradient:hover {
          transform: translateY(-2px);
          box-shadow: 
            0 0 25px rgba(255, 0, 80, 0.5), 
            0 0 25px rgba(0, 242, 254, 0.5);
        }

        .btn-login-gradient:active {
          transform: translateY(0);
        }

        .btn-login-gradient:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none !important;
          box-shadow: none !important;
        }

        .login-footer {
          margin-top: 24px;
          text-align: center;
          font-size: 0.85rem;
          color: #7c819a;
        }

        .toggle-auth-link {
          color: #ff0050;
          text-decoration: none;
          font-weight: 600;
          margin-left: 4px;
          transition: opacity 0.2s;
        }

        .toggle-auth-link:hover {
          opacity: 0.85;
        }
      `}</style>
    </div>
  );
}
