import React, { useState } from 'react';
import GlassCard from '@/components/ui/glass-card';
import Button from '@/components/ui/button';

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
      headerIcon={<i className="fa-solid fa-video" />}
      headerTitle="OBS Studio Setup"
    >
      <p className="text-[0.88rem] text-text-muted mb-4 leading-normal">
        Add this URL as a <strong>Browser Source</strong> in OBS or TikTok Live Studio:
      </p>
      <div className="flex gap-2 mb-4">
        <input 
          type="text" 
          value={overlayUrl} 
          readOnly 
          id="obs-url-input" 
          className="flex-1 bg-bg-input border border-border-color rounded-md px-3.5 py-3 text-secondary text-[0.88rem] outline-none font-header [font-variant-numeric:tabular-nums]"
        />
        <Button
          variant="icon"
          onClick={handleCopy}
          title="Copy URL"
          id="btn-copy-url"
          className={copied ? 'border-success text-success' : ''}
        >
          <i className={copied ? 'fa-solid fa-check' : 'fa-regular fa-copy'} />
        </Button>
      </div>
      <ul className="list-none flex flex-col gap-2 text-[0.85rem] text-text-muted">
        <li><i className="fa-solid fa-check text-success mr-1.5" /> Set resolution to: <strong>1920 x 1080</strong></li>
        <li><i className="fa-solid fa-check text-success mr-1.5" /> Check <strong>Control audio via OBS</strong> (optional)</li>
        <li><i className="fa-solid fa-check text-success mr-1.5" /> Check <strong>Refresh browser when scene becomes active</strong></li>
      </ul>
    </GlassCard>
  );
}
