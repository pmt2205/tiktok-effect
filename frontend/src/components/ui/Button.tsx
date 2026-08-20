import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'danger' | 'secondary' | 'icon' | 'sim' | 'sim-accent' | 'sim-special' | 'small-danger' | 'gradient';
  fullWidth?: boolean;
  children: React.ReactNode;
}

export default function Button({
  variant = 'primary',
  fullWidth = false,
  children,
  className = '',
  ...props
}: ButtonProps) {
  const baseClass = 'inline-flex items-center justify-center gap-2 rounded-md font-body transition-all duration-200 outline-none relative overflow-hidden select-none active:scale-[0.98]';
  
  let variantClass = '';
  switch (variant) {
    case 'primary':
      variantClass = 'px-5 py-2.5 text-[0.92rem] font-semibold bg-gradient-to-br from-primary to-[#d0003c] text-white shadow-[0_4px_16px_var(--color-primary-glow)] hover:shadow-[0_6px_24px_rgba(255,0,80,0.5)] hover:-translate-y-0.5 active:translate-y-0';
      break;
    case 'secondary':
      variantClass = 'px-5 py-2.5 text-[0.92rem] font-semibold bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-white/20 hover:-translate-y-0.5 active:translate-y-0';
      break;
    case 'danger':
      variantClass = 'px-5 py-2.5 text-[0.92rem] font-semibold bg-danger/10 border border-danger/20 text-[#f87171] hover:bg-danger/20 hover:border-danger/35 hover:-translate-y-0.5 active:translate-y-0';
      break;
    case 'small-danger':
      variantClass = 'text-[0.75rem] px-2.5 py-1.25 bg-danger/8 border border-danger/20 text-[#f87171] font-semibold hover:bg-danger/18 hover:border-danger/35';
      break;
    case 'gradient':
      variantClass = 'h-12 rounded-full bg-gradient-to-r from-primary to-secondary text-white font-header text-[0.95rem] font-bold tracking-[2px] shadow-[0_0_15px_rgba(255,0,80,0.3),0_0_15px_rgba(0,242,254,0.3)] px-6 hover:shadow-[0_0_25px_rgba(255,0,80,0.5),0_0_25px_rgba(0,242,254,0.5)] hover:-translate-y-0.5 active:translate-y-0';
      break;
    case 'sim':
      variantClass = 'bg-white/4 border border-border-color text-white text-[0.82rem] px-3 py-2 rounded-sm font-semibold hover:bg-white/10 hover:border-white/25 hover:-translate-y-px';
      break;
    case 'sim-accent':
      variantClass = 'border border-primary/25 text-[#ff80a6] text-[0.82rem] px-3 py-2 rounded-sm font-semibold bg-primary/12 hover:bg-primary/22 hover:border-primary/45 hover:shadow-[0_0_12px_rgba(255,0,80,0.15)] hover:-translate-y-px';
      break;
    case 'sim-special':
      variantClass = 'border border-secondary/25 text-[#80f9ff] text-[0.82rem] px-3 py-2 rounded-sm font-semibold bg-secondary/12 hover:bg-secondary/22 hover:border-secondary/45 hover:shadow-[0_0_12px_rgba(0,242,254,0.15)] hover:-translate-y-px';
      break;
    case 'icon':
      variantClass = 'p-2 border border-border-color rounded-md text-text-muted hover:border-white/20 hover:text-white';
      break;
  }

  return (
    <button
      className={`${baseClass} ${variantClass} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
