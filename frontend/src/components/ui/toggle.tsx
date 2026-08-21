import React from 'react';

interface ToggleProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  id?: string;
}

export default function Toggle({ label, checked, onChange, disabled, id }: ToggleProps) {
  return (
    <label className={`flex justify-between items-center cursor-pointer select-none mb-5 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`} htmlFor={id}>
      <span className="text-[0.92rem] text-text-secondary">{label}</span>
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className="peer sr-only"
      />
      <span className="w-12 h-6 bg-white/8 rounded-full relative transition-all duration-300 border border-border-color shrink-0 after:absolute after:w-[18px] after:h-[18px] after:rounded-full after:bg-white after:top-[2px] after:left-[2px] after:transition-all after:duration-300 after:ease-out after:shadow-[0_1px_3px_rgba(0,0,0,0.3)] peer-checked:bg-success peer-checked:border-transparent peer-checked:shadow-[0_0_12px_var(--color-success-glow)] peer-checked:after:translate-x-[22px]" />
    </label>
  );
}
