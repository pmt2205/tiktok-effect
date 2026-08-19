'use client';

import React, { useState, useEffect } from 'react';

export default function Header() {
  const [time, setTime] = useState('00:00:00');

  useEffect(() => {
    const update = () => setTime(new Date().toTimeString().split(' ')[0]);
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="dashboard-header">
      <div className="logo">
        <i className="fa-brands fa-tiktok logo-icon" />
        <div className="logo-text">
          <h1>TIKTOK LIVE</h1>
          <span>Overlay Engine</span>
        </div>
      </div>
      <div className="system-time">
        <i className="fa-regular fa-clock" />
        <span>{time}</span>
      </div>
    </header>
  );
}
