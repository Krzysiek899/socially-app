import React from 'react';
import './TextField.css';

export type TextFieldVariant = 'default' | 'error';
export type TextFieldSize = 'sm' | 'md' | 'lg';

export const TEXT_FIELD_VARIANTS: ReadonlyArray<TextFieldVariant> = ['default', 'error'];
export const TEXT_FIELD_SIZES: ReadonlyArray<TextFieldSize> = ['sm', 'md', 'lg'];

export interface TextFieldProps {
  id:                   string;
  label:                string;
  variant?:             TextFieldVariant;
  size?:                TextFieldSize;
  type?:                string;
  value?:               string;
  defaultValue?:        string;
  placeholder?:         string;
  disabled?:            boolean;
  required?:            boolean;
  readOnly?:            boolean;
  min?:                 string | number;
  max?:                 string | number;
  step?:                string | number;
  helperText?:          string;
  errorText?:           string;
  onChange?:            React.ChangeEventHandler<HTMLInputElement>;
  'aria-describedby'?:  string;
}

/**
 * TextField primitive.
 *
 * Wraps a labelled `<input>` with constrained variant/size API.
 * Does not accept `className` to prevent ad-hoc styling drift.
 */
export function TextField({
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
  min,
  max,
  step,
  helperText,
  errorText,
  onChange,
  'aria-describedby': ariaDescribedBy,
}: TextFieldProps): React.JSX.Element {
  if (!TEXT_FIELD_VARIANTS.includes(variant)) {
    throw new Error(`TextField: unknown variant "${variant}". Must be one of: ${TEXT_FIELD_VARIANTS.join(', ')}.`);
  }
  if (!TEXT_FIELD_SIZES.includes(size)) {
    throw new Error(`TextField: unknown size "${size}". Must be one of: ${TEXT_FIELD_SIZES.join(', ')}.`);
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
        min={min}
        max={max}
        step={step}
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
