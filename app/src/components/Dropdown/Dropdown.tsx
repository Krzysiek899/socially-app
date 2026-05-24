import React from 'react';
import { INPUT_VARIANTS, INPUT_SIZES } from '../Input/Input.tsx';
import type { InputVariant, InputSize } from '../Input/Input.tsx';
import '../Input/Input.css';
import './Dropdown.css';

export interface DropdownOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface DropdownProps {
  id:                   string;
  label:                string;
  options:              DropdownOption[];
  variant?:             InputVariant;
  size?:                InputSize;
  value?:               string;
  defaultValue?:        string;
  placeholder?:         string;
  disabled?:            boolean;
  required?:            boolean;
  helperText?:          string;
  errorText?:           string;
  onChange?:            React.ChangeEventHandler<HTMLSelectElement>;
  'aria-describedby'?:  string;
}

export { INPUT_VARIANTS as DROPDOWN_VARIANTS, INPUT_SIZES as DROPDOWN_SIZES };

/**
 * Dropdown — Form Component
 *
 * Styled `<select>` built on top of Input primitives.
 * Provides a custom chevron indicator via CSS, replacing the native appearance.
 * Does not accept `className` to prevent ad-hoc styling drift.
 */
export function Dropdown({
  id,
  label,
  options,
  variant = 'default',
  size = 'md',
  value,
  defaultValue,
  placeholder,
  disabled = false,
  required = false,
  helperText,
  errorText,
  onChange,
  'aria-describedby': ariaDescribedBy,
}: DropdownProps): React.JSX.Element {
  if (!INPUT_VARIANTS.includes(variant)) {
    throw new Error(`Dropdown: unknown variant "${variant}". Must be one of: ${INPUT_VARIANTS.join(', ')}.`);
  }
  if (!INPUT_SIZES.includes(size)) {
    throw new Error(`Dropdown: unknown size "${size}". Must be one of: ${INPUT_SIZES.join(', ')}.`);
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
      <div className="dropdown__wrapper">
        <select
          id={id}
          className={`input-field input-field--${variant} input-field--${size} dropdown__select`}
          value={value}
          defaultValue={defaultValue}
          disabled={disabled}
          required={required}
          onChange={onChange}
          aria-invalid={isError || undefined}
          aria-describedby={describedBy}
        >
          {placeholder !== undefined && (
            <option value="" disabled={required}>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </option>
          ))}
        </select>
        <span className={`dropdown__chevron dropdown__chevron--${size}`} aria-hidden="true">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>
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
