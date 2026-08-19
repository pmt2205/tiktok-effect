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
    <div className="input-group">
      {addon && <span className="input-addon">{addon}</span>}
      <input
        type={type}
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={readOnly}
      />
    </div>
  );
}
