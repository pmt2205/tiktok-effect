import React from 'react';

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  displayValue: string;
  onChange: (value: number) => void;
  id?: string;
}

export default function Slider({ label, value, min, max, displayValue, onChange, id }: SliderProps) {
  return (
    <div className="settings-group">
      <label className="slider-label">
        <span>{label}</span>
        <span>{displayValue}</span>
      </label>
      <input
        type="range"
        id={id}
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value, 10))}
        className="slider"
      />
    </div>
  );
}
