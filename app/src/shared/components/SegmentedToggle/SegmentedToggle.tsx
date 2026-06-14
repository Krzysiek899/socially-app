import React from 'react';
import './SegmentedToggle.css';

export type SegmentedToggleOption<T extends string> = {
  value: T;
  label: string;
};

export interface SegmentedToggleProps<T extends string> {
  ariaLabel: string;
  value: T;
  options: ReadonlyArray<SegmentedToggleOption<T>>;
  onChange: (value: T) => void;
}

/**
 * SegmentedToggle primitive.
 *
 * Renders an accessible, single-select segmented control.
 * Does not accept className to prevent ad-hoc styling drift.
 */
export function SegmentedToggle<T extends string>({
  ariaLabel,
  value,
  options,
  onChange,
}: SegmentedToggleProps<T>): React.JSX.Element {
  return (
    <div className="segmented-toggle" role="group" aria-label={ariaLabel}>
      {options.map((option) => {
        const isActive = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            className={`segmented-toggle__button${isActive ? ' segmented-toggle__button--active' : ''}`}
            aria-pressed={isActive}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
