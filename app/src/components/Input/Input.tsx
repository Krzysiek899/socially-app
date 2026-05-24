import React from 'react';
import './Input.css';

export type InputVariant = 'default' | 'error';
export type InputSize = 'sm' | 'md' | 'lg';

export const INPUT_VARIANTS: ReadonlyArray<InputVariant> = ['default', 'error'];
export const INPUT_SIZES: ReadonlyArray<InputSize> = ['sm', 'md', 'lg'];

export interface InputProps {
  id:                   string;
  label:                string;
  variant?:             InputVariant;
  size?:                InputSize;
  type?:                string;
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
 * Input primitive.
 *
 * Wraps a labelled `<input>` with constrained variant/size API.
 * Does not accept `className` to prevent ad-hoc styling drift.
 */
export function Input({
  id,
  label,
  variant = 'default',
  size = 'md',
  type = 'text',
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
}: InputProps): React.JSX.Element {
  if (!INPUT_VARIANTS.includes(variant)) {
    throw new Error(`Input: unknown variant "${variant}". Must be one of: ${INPUT_VARIANTS.join(', ')}.`);
  }
  if (!INPUT_SIZES.includes(size)) {
    throw new Error(`Input: unknown size "${size}". Must be one of: ${INPUT_SIZES.join(', ')}.`);
  }

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
      <input
        id={id}
        type={type}
        className={`input-field input-field--${variant} input-field--${size}`}
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
