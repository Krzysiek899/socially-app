import React from 'react';
import { TextField, TEXT_FIELD_VARIANTS, TEXT_FIELD_SIZES } from '../TextField/TextField.tsx';
import type { TextFieldVariant, TextFieldSize } from '../TextField/TextField.tsx';
import './DateTimeField.css';

export interface DateTimeFieldProps {
  id:                   string;
  label:                string;
  variant?:             TextFieldVariant;
  size?:                TextFieldSize;
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

export { TEXT_FIELD_VARIANTS as DATE_TIME_FIELD_VARIANTS, TEXT_FIELD_SIZES as DATE_TIME_FIELD_SIZES };

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
      <TextField
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
