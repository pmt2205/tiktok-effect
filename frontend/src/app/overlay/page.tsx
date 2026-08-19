'use client';

import dynamic from 'next/dynamic';

// Must be client-side only due to canvas, WebSocket, Web Audio API
const OverlayCanvas = dynamic(() => import('@/features/overlay/OverlayCanvas'), {
  ssr: false,
});

export default function OverlayPage() {
  return <OverlayCanvas />;
}
