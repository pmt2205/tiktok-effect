'use client';

import React, { useState, useRef, useEffect } from 'react';

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  label?: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  disabled?: boolean;
  id?: string;
  className?: string;
  style?: React.CSSProperties;
}

export default function Select({ label, value, options, onChange, disabled, id, className = '', style }: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value) || options[0];

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
  };

  const hasMargin = className.split(' ').some(c => /^m[trblxy]?-/.test(c));
  const marginClass = hasMargin ? '' : 'mb-5';

  return (
    <div className={`flex flex-col gap-2 relative ${marginClass} ${className}`} style={style} ref={containerRef}>
      {label && <label className="text-[0.88rem] text-text-secondary font-medium tracking-[0.5px] select-none" id={`${id}-label`}>{label}</label>}
      
      <button
        id={id}
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full bg-bg-input border ${isOpen ? 'border-secondary ring-3 ring-secondary-glow/25' : 'border-border-color'} rounded-md px-4 py-3 text-text-main font-body text-[0.88rem] flex justify-between items-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 outline-none select-none text-left`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-labelledby={`${id}-label`}
      >
        <span className="truncate">{selectedOption?.label}</span>
        <span className={`transition-transform duration-200 text-text-muted ${isOpen ? 'rotate-180 text-secondary' : ''}`}>
          <i className="fa-solid fa-chevron-down text-[0.78rem]" />
        </span>
      </button>

      {isOpen && (
        <ul
          className="absolute left-0 right-0 mt-2 z-50 bg-bg-surface/95 backdrop-blur-xl border border-border-color rounded-md p-1 shadow-[0_8px_32px_rgba(0,0,0,0.5)] flex flex-col gap-0.5 max-h-[220px] overflow-y-auto custom-scrollbar animate-[fade-in-up_0.15s_ease-out]"
          role="listbox"
          tabIndex={-1}
          style={{ top: '100%' }}
        >
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <li
                key={opt.value}
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelect(opt.value)}
                className={`px-4 py-2.5 rounded-sm text-[0.88rem] flex justify-between items-center cursor-pointer select-none transition-all duration-150 ${
                  isSelected
                    ? 'bg-secondary/8 text-secondary font-semibold'
                    : 'text-text-secondary hover:bg-secondary/10 hover:text-text-main'
                }`}
              >
                <span className="truncate">{opt.label}</span>
                {isSelected && (
                  <i className="fa-solid fa-check text-[0.78rem] text-secondary" />
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
