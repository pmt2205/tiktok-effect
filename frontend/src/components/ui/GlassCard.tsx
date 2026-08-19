import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  headerIcon?: React.ReactNode;
  headerTitle?: string;
  headerActions?: React.ReactNode;
  noPadding?: boolean;
}

export default function GlassCard({
  children,
  className = '',
  headerIcon,
  headerTitle,
  headerActions,
  noPadding = false,
}: GlassCardProps) {
  return (
    <section className={`glass-card ${className}`}>
      {headerTitle && (
        <div className="card-header">
          {headerActions ? (
            <div className="header-with-actions">
              <div className="title-wrap">
                {headerIcon && <span className="icon-header">{headerIcon}</span>}
                <h2>{headerTitle}</h2>
              </div>
              {headerActions}
            </div>
          ) : (
            <>
              {headerIcon && <span className="icon-header">{headerIcon}</span>}
              <h2>{headerTitle}</h2>
            </>
          )}
        </div>
      )}
      <div className={`card-body ${noPadding ? 'no-padding' : ''}`}>
        {children}
      </div>
    </section>
  );
}
