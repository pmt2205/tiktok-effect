import React from 'react';

interface InputGroupProps {
  addon?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  id?: string;
  type?: string;
  readOnly?: boolean;
}

export default function InputGroup({
  addon,
  value,
  onChange,
  placeholder,
  disabled = false,
  id,
  type = 'text',
  readOnly = false,
}: InputGroupProps) {
  return (
    <div className="flex items-center bg-bg-input border border-border-color rounded-md overflow-hidden transition-all duration-200 mb-4 focus-within:border-secondary focus-within:ring-3 focus-within:ring-secondary-glow/25">
      {addon && <span className="px-4 py-3 bg-white/[0.03] text-text-muted font-semibold border-r border-border-color text-base flex items-center">{addon}</span>}
      <input
        type={type}
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={readOnly}
        className="flex-1 bg-transparent border-none outline-none text-white px-4 py-3 font-body text-[0.95rem] placeholder:text-white/20"
      />
    </div>
  );
}
