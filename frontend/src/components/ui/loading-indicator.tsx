import React from 'react';

interface LoadingIndicatorProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'h-5 w-5',
  md: 'h-8 w-8',
  lg: 'h-14 w-14',
} as const;

export default function LoadingIndicator({ size = 'md', className = '' }: LoadingIndicatorProps) {
  return (
    <span
      role="status"
      aria-label="Đang tải"
      className={`relative inline-flex shrink-0 items-center justify-center ${sizeClasses[size]} ${className}`}
    >
      <span className="absolute inset-0 rounded-full border-2 border-secondary/15 border-t-secondary border-r-secondary/55 shadow-[0_0_14px_var(--color-secondary-glow)] animate-[spin_1.05s_linear_infinite]" />
      <span className="absolute inset-[22%] rounded-full border-2 border-primary/15 border-b-primary border-l-primary/55 shadow-[0_0_12px_var(--color-primary-glow)] animate-[spin_0.72s_linear_infinite_reverse]" />
      <span className="h-[18%] w-[18%] rounded-full bg-white shadow-[0_0_8px_var(--color-secondary)] animate-pulse" />
    </span>
  );
}
