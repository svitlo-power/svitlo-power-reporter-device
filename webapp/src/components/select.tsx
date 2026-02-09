import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: {
    label: string;
    value: string;
  }[];
}

export const Select: React.FC<SelectProps> = ({ label, options, ...props }) => {
  return (
    <div className="input-group">
      <label>{label}</label>
      <select className="input-style" {...props} style={{ width: '100%', appearance: 'none', background: 'transparent' }}>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} style={{ background: '#222', color: 'white' }}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};
