import React from 'react';
import { ChevronDown } from 'lucide-react';
import { TEXT_FIELD_VARIANTS, TEXT_FIELD_SIZES } from '../TextField/TextField.tsx';
import type { TextFieldVariant, TextFieldSize } from '../TextField/TextField.tsx';
import '../TextField/TextField.css';
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
  variant?:             TextFieldVariant;
  size?:                TextFieldSize;
  value?:               string | string[];
  defaultValue?:        string | string[];
  placeholder?:         string;
  multiple?:            boolean;
  disabled?:            boolean;
  required?:            boolean;
  helperText?:          string;
  errorText?:           string;
  onChange?:            React.ChangeEventHandler<HTMLSelectElement>;
  'aria-describedby'?:  string;
}

export { TEXT_FIELD_VARIANTS as DROPDOWN_VARIANTS, TEXT_FIELD_SIZES as DROPDOWN_SIZES };

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
  multiple = false,
  disabled = false,
  required = false,
  helperText,
  errorText,
  onChange,
  'aria-describedby': ariaDescribedBy,
}: DropdownProps): React.JSX.Element {
  if (!TEXT_FIELD_VARIANTS.includes(variant)) {
    throw new Error(`Dropdown: unknown variant "${variant}". Must be one of: ${TEXT_FIELD_VARIANTS.join(', ')}.`);
  }
  if (!TEXT_FIELD_SIZES.includes(size)) {
    throw new Error(`Dropdown: unknown size "${size}". Must be one of: ${TEXT_FIELD_SIZES.join(', ')}.`);
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
          multiple={multiple}
          disabled={disabled}
          required={required}
          onChange={onChange}
          aria-invalid={isError || undefined}
          aria-describedby={describedBy}
        >
          {!multiple && placeholder !== undefined && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </option>
          ))}
        </select>
        {!multiple && (
          <span className={`dropdown__chevron dropdown__chevron--${size}`} aria-hidden="true">
            <ChevronDown />
          </span>
        )}
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
