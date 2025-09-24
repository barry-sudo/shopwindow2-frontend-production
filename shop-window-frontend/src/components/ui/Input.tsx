import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  className = '',
  ...props
}) => {
  const inputClasses = ['form-control', error ? 'error' : '', className]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="input-group">
      {label && (
        <label className="input-label" htmlFor={props.id}>
          {label}
        </label>
      )}
      <input className={inputClasses} {...props} />
      {error && (
        <span className="input-error">{error}</span>
      )}
      {helperText && !error && (
        <span className="input-helper">{helperText}</span>
      )}
    </div>
  );
};