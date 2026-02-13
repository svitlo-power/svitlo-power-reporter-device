import React, { useState, useRef, useEffect } from 'react';

interface SelectProps {
  label: string;
  value: string;
  onChange: (e: { target: { value: string; name?: string } }) => void;
  name?: string;
  options: {
    label: string;
    value: string;
  }[];
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

export const Select: React.FC<SelectProps> = ({ label, value, onChange, name, options, disabled }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value) || options[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (val: string) => {
    if (disabled) return;
    onChange({ target: { value: val, name } });
    setIsOpen(false);
  };

  return (
    <div className="input-group">
      <label>{label}</label>
      <div
        className={`custom-select ${isOpen ? 'open' : ''} ${disabled ? 'disabled' : ''}`}
        ref={containerRef}
      >
        <button
          type="button"
          className="custom-select-trigger"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
        >
          {selectedOption?.label || 'Select...'}
        </button>
        <ul className="custom-select-dropdown">
          {options.map((opt) => (
            <li
              key={opt.value}
              className={`custom-select-option ${opt.value === value ? 'selected' : ''}`}
              onClick={() => handleSelect(opt.value)}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
