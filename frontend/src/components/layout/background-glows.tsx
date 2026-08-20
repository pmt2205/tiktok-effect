import React from 'react';

interface BackgroundGlowsProps {
  variant?: 'normal' | 'login';
}

export default function BackgroundGlows({ variant = 'normal' }: BackgroundGlowsProps) {
  const animClass = variant === 'login' ? 'animate-login-glow-drift' : 'animate-glow-drift';

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      <div className={`absolute rounded-full filter blur-[120px] opacity-12 mix-blend-screen ${animClass} top-[-15%] left-[15%] w-[50vw] h-[50vw] bg-[radial-gradient(circle,_var(--color-primary)_0%,_transparent_70%)] [animation-delay:0s]`} />
      <div className={`absolute rounded-full filter blur-[120px] opacity-12 mix-blend-screen ${animClass} bottom-[-15%] right-[5%] w-[55vw] h-[55vw] bg-[radial-gradient(circle,_var(--color-secondary)_0%,_transparent_70%)] [animation-delay:-7s]`} />
      <div className={`absolute rounded-full filter blur-[120px] opacity-12 mix-blend-screen ${animClass} top-[30%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40vw] h-[40vw] bg-[radial-gradient(circle,_var(--color-accent)_0%,_transparent_70%)] [animation-delay:-14s]`} />
    </div>
  );
}
