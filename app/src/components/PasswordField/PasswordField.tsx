import React, { useState } from 'react';
import { INPUT_VARIANTS, INPUT_SIZES } from '../Input/Input.tsx';
import type { InputVariant, InputSize } from '../Input/Input.tsx';
import '../Input/Input.css';
import './PasswordField.css';

export interface PasswordFieldProps {
  id:                   string;
  label:                string;
  variant?:             InputVariant;
  size?:                InputSize;
  value?:               string;
  defaultValue?:        string;
  placeholder?:         string;
  disabled?:            boolean;
  required?:            boolean;
  readOnly?:            boolean;
  helperText?:          string;
  errorText?:           string;
  onChange?:            React.ChangeEventHandler<HTMLInputElement>;
  'aria-describedby'?:  string;
}

/**
 * PasswordField — Form Component
 *
 * Password input with show/hide toggle built on top of Input primitives.
 * Does not accept `className` to prevent ad-hoc styling drift.
 */
export function PasswordField({
  id,
  label,
  variant = 'default',
  size = 'md',
  value,
  defaultValue,
  placeholder,
  disabled = false,
  required = false,
  readOnly = false,
  helperText,
  errorText,
  onChange,
  'aria-describedby': ariaDescribedBy,
}: PasswordFieldProps): React.JSX.Element {
  if (!INPUT_VARIANTS.includes(variant)) {
    throw new Error(`PasswordField: unknown variant "${variant}". Must be one of: ${INPUT_VARIANTS.join(', ')}.`);
  }
  if (!INPUT_SIZES.includes(size)) {
    throw new Error(`PasswordField: unknown size "${size}". Must be one of: ${INPUT_SIZES.join(', ')}.`);
  }

  const [visible, setVisible] = useState(false);

  const helperId = helperText || errorText ? `${id}-helper` : undefined;
  const describedBy = [ariaDescribedBy, helperId].filter(Boolean).join(' ') || undefined;
  const isError = variant === 'error';

  return (
    <div className="input-wrapper">
      <label
        htmlFor={id}
        className={`input-label${required ? ' input-label--required' : ''}`}
      >
        {label}
      </label>
      <div className="password-field__row">
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          className={`input-field input-field--${variant} input-field--${size} password-field__input`}
          value={value}
          defaultValue={defaultValue}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          readOnly={readOnly}
          onChange={onChange}
          aria-invalid={isError || undefined}
          aria-describedby={describedBy}
        />
        <button
          type="button"
          className={`password-field__toggle password-field__toggle--${size}`}
          aria-label={visible ? 'Hide password' : 'Show password'}
          aria-pressed={visible}
          aria-controls={id}
          disabled={disabled}
          onClick={() => setVisible(v => !v)}
        >
          {visible ? (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
              <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
              <line x1="1" y1="1" x2="23" y2="23" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          )}
        </button>
      </div>
      {(helperText || errorText) && (
        <span
          id={helperId}
          className={`input-helper${isError && errorText ? ' input-helper--error' : ''}`}
          role={isError && errorText ? 'alert' : undefined}
        >
          {isError && errorText ? errorText : helperText}
        </span>
      )}
    </div>
  );
}
