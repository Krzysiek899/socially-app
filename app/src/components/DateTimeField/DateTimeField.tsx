import React from 'react';
import { Input, INPUT_VARIANTS, INPUT_SIZES } from '../Input/Input.tsx';
import type { InputVariant, InputSize } from '../Input/Input.tsx';
import './DateTimeField.css';

export interface DateTimeFieldProps {
  id:                   string;
  label:                string;
  variant?:             InputVariant;
  size?:                InputSize;
  value?:               string;
  defaultValue?:        string;
  min?:                 string;
  max?:                 string;
  /** Step in seconds — e.g. 60 for minute precision, 1 for second precision. */
  step?:                number;
  disabled?:            boolean;
  required?:            boolean;
  readOnly?:            boolean;
  helperText?:          string;
  errorText?:           string;
  onChange?:            React.ChangeEventHandler<HTMLInputElement>;
  'aria-describedby'?:  string;
}

export { INPUT_VARIANTS as DATE_TIME_FIELD_VARIANTS, INPUT_SIZES as DATE_TIME_FIELD_SIZES };

/**
 * DateTimeField — Form Component
 *
 * Combined date-and-time input built on top of the Input primitive.
 * Accepts min/max for scheduling range constraints and step (seconds)
 * for time granularity control.
 * Does not accept `className` to prevent ad-hoc styling drift.
 */
export function DateTimeField({
  id,
  label,
  variant = 'default',
  size = 'md',
  value,
  defaultValue,
  min,
  max,
  step,
  disabled = false,
  required = false,
  readOnly = false,
  helperText,
  errorText,
  onChange,
  'aria-describedby': ariaDescribedBy,
}: DateTimeFieldProps): React.JSX.Element {
  return (
    <div className="datetime-field">
      <Input
        id={id}
        label={label}
        variant={variant}
        size={size}
        type="datetime-local"
        value={value}
        defaultValue={defaultValue}
        min={min}
        max={max}
        step={step}
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
