'use client';

import { useEffect } from 'react';
import dynamic from 'next/dynamic';

// Must be client-side only due to canvas, WebSocket, Web Audio API
const OverlayCanvas = dynamic(() => import('@/features/overlay/components/overlay-canvas'), {
  ssr: false,
});

export default function OverlayPage() {
  useEffect(() => {
    // Set background to transparent for OBS capture
    document.body.style.backgroundColor = 'transparent';
    return () => {
      document.body.style.backgroundColor = '';
    };
  }, []);

  return (
    <div className="w-[1080px] h-[1920px] relative overflow-hidden bg-transparent mx-auto">
      <OverlayCanvas />
    </div>
  );
}
