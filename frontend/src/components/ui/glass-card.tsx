import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  headerIcon?: React.ReactNode;
  headerTitle?: string;
  headerActions?: React.ReactNode;
  noPadding?: boolean;
  contentClassName?: string;
}

export default function GlassCard({
  children,
  className = '',
  headerIcon,
  headerTitle,
  headerActions,
  noPadding = false,
  contentClassName = '',
}: GlassCardProps) {
  return (
    <section className={`relative overflow-hidden bg-bg-card backdrop-blur-3xl rounded-lg border border-transparent shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] transition-all duration-300 hover:shadow-[0_8px_40px_0_rgba(0,242,254,0.15)] hover:-translate-y-0.5 border-glow-animated before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/[0.025] before:to-transparent before:pointer-events-none hover:border-white/12 hover:shadow-[0_8px_40px_0_rgba(0,242,254,0.04)] hover:bg-bg-card-hover hover:-translate-y-0.5 ${className}`}>
      {headerTitle && (
        <div className="flex items-center gap-2.5 px-6 py-4 border-b border-border-color">
          {headerActions ? (
            <div className="flex justify-between items-center w-full">
              <div className="flex items-center gap-2.5">
                {headerIcon && <span className="text-[1.15rem] text-secondary flex items-center">{headerIcon}</span>}
                <h2 className="font-header text-[1.1rem] font-semibold text-text-main">{headerTitle}</h2>
              </div>
              {headerActions}
            </div>
          ) : (
            <>
              {headerIcon && <span className="text-[1.15rem] text-secondary flex items-center">{headerIcon}</span>}
              <h2 className="font-header text-[1.1rem] font-semibold text-text-main">{headerTitle}</h2>
            </>
          )}
        </div>
      )}
      <div className={`${noPadding ? 'p-0' : 'p-6'} ${contentClassName}`}>
        {children}
      </div>
    </section>
  );
}
