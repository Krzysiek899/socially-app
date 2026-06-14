import React from 'react';
import '../TextField/TextField.css';
import './TextArea.css';

export type TextAreaVariant = 'default' | 'error';
export type TextAreaSize = 'sm' | 'md' | 'lg';

export const TEXT_AREA_VARIANTS: ReadonlyArray<TextAreaVariant> = ['default', 'error'];
export const TEXT_AREA_SIZES: ReadonlyArray<TextAreaSize> = ['sm', 'md', 'lg'];

export interface TextAreaProps {
  id:                  string;
  label:               string;
  variant?:            TextAreaVariant;
  size?:               TextAreaSize;
  value?:              string;
  defaultValue?:       string;
  placeholder?:        string;
  disabled?:           boolean;
  required?:           boolean;
  readOnly?:           boolean;
  rows?:               number;
  helperText?:         string;
  errorText?:          string;
  onChange?:           React.ChangeEventHandler<HTMLTextAreaElement>;
  onFocus?:            React.FocusEventHandler<HTMLTextAreaElement>;
  'aria-describedby'?: string;
}

/**
 * TextArea primitive.
 *
 * Wraps a labelled `<textarea>` with constrained variant/size API.
 * Does not accept `className` to prevent ad-hoc styling drift.
 */
export function TextArea({
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
  rows = 4,
  helperText,
  errorText,
  onChange,
  onFocus,
  'aria-describedby': ariaDescribedBy,
}: TextAreaProps): React.JSX.Element {
  if (!TEXT_AREA_VARIANTS.includes(variant)) {
    throw new Error(`TextArea: unknown variant "${variant}". Must be one of: ${TEXT_AREA_VARIANTS.join(', ')}.`);
  }
  if (!TEXT_AREA_SIZES.includes(size)) {
    throw new Error(`TextArea: unknown size "${size}". Must be one of: ${TEXT_AREA_SIZES.join(', ')}.`);
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
      <textarea
        id={id}
        className={`textarea-field textarea-field--${variant} textarea-field--${size}`}
        value={value}
        defaultValue={defaultValue}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        readOnly={readOnly}
        rows={rows}
        onChange={onChange}
        onFocus={onFocus}
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
