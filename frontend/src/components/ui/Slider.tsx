import React from 'react';

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  displayValue: string;
  onChange: (value: number) => void;
  disabled?: boolean;
  id?: string;
}

export default function Slider({ label, value, min, max, step = 1, displayValue, onChange, disabled, id }: SliderProps) {
  return (
    <div className="flex flex-col gap-2 mb-5">
      <label className="flex justify-between text-[0.88rem] text-text-muted">
        <span>{label}</span>
        <span className="text-secondary font-semibold">{displayValue}</span>
      </label>
      <input
        type="range"
        id={id}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value, 10))}
        disabled={disabled}
        className="appearance-none w-full h-[5px] rounded-full bg-white/8 outline-none transition-colors duration-250 disabled:opacity-50 disabled:cursor-not-allowed [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-secondary [&::-webkit-slider-thumb]:shadow-[0_0_10px_var(--color-secondary-glow)] [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:transition-all [&::-webkit-slider-thumb]:duration-150 hover:[&::-webkit-slider-thumb]:scale-125 hover:[&::-webkit-slider-thumb]:shadow-[0_0_16px_var(--color-secondary-glow)]"
      />
    </div>
  );
}
