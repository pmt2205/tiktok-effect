'use client';

import React, { useState } from 'react';
import GlassCard from '@/components/ui/GlassCard';

interface ObsSetupPanelProps {
  overlayUrl: string;
}

export default function ObsSetupPanel({ overlayUrl }: ObsSetupPanelProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(overlayUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <GlassCard
      className="panel-obs"
      headerIcon={<i className="fa-solid fa-video" />}
      headerTitle="OBS Studio Setup"
    >
      <p className="card-desc">
        Add this URL as a <strong>Browser Source</strong> in OBS or TikTok Live Studio:
      </p>
      <div className="copy-url-group">
        <input type="text" value={overlayUrl} readOnly id="obs-url-input" />
        <button
          className="btn btn-icon"
          onClick={handleCopy}
          title="Copy URL"
          id="btn-copy-url"
          style={copied ? { borderColor: 'var(--success)', color: 'var(--success)' } : undefined}
        >
          <i className={copied ? 'fa-solid fa-check' : 'fa-regular fa-copy'} />
        </button>
      </div>
      <ul className="obs-instructions">
        <li><i className="fa-solid fa-check" /> Set resolution to: <strong>1920 x 1080</strong></li>
        <li><i className="fa-solid fa-check" /> Check <strong>Control audio via OBS</strong> (optional)</li>
        <li><i className="fa-solid fa-check" /> Check <strong>Refresh browser when scene becomes active</strong></li>
      </ul>
    </GlassCard>
  );
}
