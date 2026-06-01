import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { TEXT_FIELD_VARIANTS, TEXT_FIELD_SIZES } from '../TextField/TextField.tsx';
import type { TextFieldVariant, TextFieldSize } from '../TextField/TextField.tsx';
import '../TextField/TextField.css';
import './PasswordField.css';

export interface PasswordFieldProps {
  id:                   string;
  label:                string;
  variant?:             TextFieldVariant;
  size?:                TextFieldSize;
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
  if (!TEXT_FIELD_VARIANTS.includes(variant)) {
    throw new Error(`PasswordField: unknown variant "${variant}". Must be one of: ${TEXT_FIELD_VARIANTS.join(', ')}.`);
  }
  if (!TEXT_FIELD_SIZES.includes(size)) {
    throw new Error(`PasswordField: unknown size "${size}". Must be one of: ${TEXT_FIELD_SIZES.join(', ')}.`);
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
            <EyeOff aria-hidden="true" />
          ) : (
            <Eye aria-hidden="true" />
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
