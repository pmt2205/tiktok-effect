import React from 'react';

interface ToggleProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  id?: string;
}

export default function Toggle({ label, checked, onChange, id }: ToggleProps) {
  return (
    <label className="toggle-control" htmlFor={id}>
      <span className="toggle-label">{label}</span>
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="toggle-switch" />
    </label>
  );
}
