import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Header() {
  const router = useRouter();
  const [time, setTime] = useState('00:00:00');
  const [username, setUsername] = useState('');

  useEffect(() => {
    const update = () => setTime(new Date().toTimeString().split(' ')[0]);
    update();
    const interval = setInterval(update, 1000);

    const userStr = localStorage.getItem('auth_user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUsername(user.username);
      } catch (e) {
        console.error(e);
      }
    }

    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    router.push('/login');
  };

  return (
    <header className="dashboard-header">
      <div className="logo">
        <i className="fa-brands fa-tiktok logo-icon" />
        <div className="logo-text">
          <h1>TIKTOK LIVE</h1>
          <span>Overlay Engine</span>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        {username && (
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Logged in as: <strong style={{ color: 'var(--secondary)' }}>{username}</strong>
          </div>
        )}
        <div className="system-time">
          <i className="fa-regular fa-clock" />
          <span>{time}</span>
        </div>
        {username && (
          <button 
            onClick={handleLogout}
            className="btn btn-secondary" 
            style={{ padding: '6px 12px', fontSize: '0.78rem', height: 'auto' }}
          >
            <i className="fa-solid fa-right-from-bracket" /> Logout
          </button>
        )}
      </div>
    </header>
  );
}
