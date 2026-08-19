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
  const variantClass = variant === 'sim' ? 'btn-sim'
    : variant === 'sim-accent' ? 'btn-sim btn-sim-accent'
    : variant === 'sim-special' ? 'btn-sim btn-sim-special'
    : variant === 'small-danger' ? 'btn-small-danger'
    : variant === 'gradient' ? 'btn-gradient'
    : `btn btn-${variant}`;

  return (
    <button
      className={`${variantClass} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
