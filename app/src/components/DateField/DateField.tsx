import React from 'react';
import { Input, INPUT_VARIANTS, INPUT_SIZES } from '../Input/Input.tsx';
import type { InputVariant, InputSize } from '../Input/Input.tsx';
import './DateField.css';

export interface DateFieldProps {
  id:                   string;
  label:                string;
  variant?:             InputVariant;
  size?:                InputSize;
  value?:               string;
  defaultValue?:        string;
  min?:                 string;
  max?:                 string;
  disabled?:            boolean;
  required?:            boolean;
  readOnly?:            boolean;
  helperText?:          string;
  errorText?:           string;
  onChange?:            React.ChangeEventHandler<HTMLInputElement>;
  'aria-describedby'?:  string;
}

export { INPUT_VARIANTS as DATE_FIELD_VARIANTS, INPUT_SIZES as DATE_FIELD_SIZES };

/**
 * DateField — Form Component
 *
 * Date input built on top of the Input primitive.
 * Accepts min/max for date range constraints.
 * Does not accept `className` to prevent ad-hoc styling drift.
 */
export function DateField({
  id,
  label,
  variant = 'default',
  size = 'md',
  value,
  defaultValue,
  min,
  max,
  disabled = false,
  required = false,
  readOnly = false,
  helperText,
  errorText,
  onChange,
  'aria-describedby': ariaDescribedBy,
}: DateFieldProps): React.JSX.Element {
  return (
    <div className="date-field">
      <Input
        id={id}
        label={label}
        variant={variant}
        size={size}
        type="date"
        value={value}
        defaultValue={defaultValue}
        min={min}
        max={max}
        disabled={disabled}
        required={required}
        readOnly={readOnly}
        helperText={helperText}
        errorText={errorText}
        onChange={onChange}
        aria-describedby={ariaDescribedBy}
      />
    </div>
  );
}
