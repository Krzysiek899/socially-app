import React from 'react';
import { render, screen } from '@testing-library/react';
import { DateTimeField, DATE_TIME_FIELD_VARIANTS, DATE_TIME_FIELD_SIZES } from '../../shared/components/DateTimeField/DateTimeField.tsx';

describe('DateTimeField — contract: variant and size APIs', () => {
  it('exposes variants from Input', () => {
    expect(DATE_TIME_FIELD_VARIANTS).toEqual(['default', 'error']);
  });

  it('exposes sizes from Input', () => {
    expect(DATE_TIME_FIELD_SIZES).toEqual(['sm', 'md', 'lg']);
  });

  it('throws for an unknown variant', () => {
    expect(() => render(<DateTimeField id="dt" label="Start" variant="warning" />)).toThrow(/unknown variant/i);
  });

  it('throws for an unknown size', () => {
    expect(() => render(<DateTimeField id="dt" label="Start" size="xl" />)).toThrow(/unknown size/i);
  });
});

describe('DateTimeField — rendered output', () => {
  it('renders an associated <label>', () => {
    render(<DateTimeField id="event-start" label="Event Start" />);
    expect(screen.getByLabelText('Event Start')).toBeInTheDocument();
  });

  it('renders an input with type="datetime-local"', () => {
    render(<DateTimeField id="event-start" label="Event Start" />);
    expect(screen.getByLabelText('Event Start')).toHaveAttribute('type', 'datetime-local');
  });

  it('forwards min attribute', () => {
    render(<DateTimeField id="dt" label="Start" min="2024-01-01T00:00" />);
    expect(screen.getByLabelText('Start')).toHaveAttribute('min', '2024-01-01T00:00');
  });

  it('forwards max attribute', () => {
    render(<DateTimeField id="dt" label="Start" max="2030-12-31T23:59" />);
    expect(screen.getByLabelText('Start')).toHaveAttribute('max', '2030-12-31T23:59');
  });

  it('forwards step attribute in seconds', () => {
    render(<DateTimeField id="dt" label="Start" step={60} />);
    expect(screen.getByLabelText('Start')).toHaveAttribute('step', '60');
  });

  it('applies correct CSS class for size', () => {
    render(<DateTimeField id="dt" label="Start" size="lg" />);
    expect(screen.getByLabelText('Start')).toHaveClass('input-field--lg');
  });
});

describe('DateTimeField — accessibility semantics', () => {
  it('sets aria-invalid on error variant', () => {
    render(<DateTimeField id="dt" label="Start" variant="error" errorText="Invalid datetime" />);
    expect(screen.getByLabelText('Start')).toHaveAttribute('aria-invalid', 'true');
  });

  it('does not set aria-invalid on default variant', () => {
    render(<DateTimeField id="dt" label="Start" />);
    expect(screen.getByLabelText('Start')).not.toHaveAttribute('aria-invalid');
  });

  it('shows errorText with role="alert" when error variant', () => {
    render(<DateTimeField id="dt" label="Start" variant="error" errorText="Start time is required" />);
    expect(screen.getByRole('alert')).toHaveTextContent('Start time is required');
  });

  it('associates helper text via aria-describedby', () => {
    render(<DateTimeField id="dt" label="Start" helperText="Format: YYYY-MM-DDTHH:MM" />);
    const input = screen.getByLabelText('Start');
    const helperId = input.getAttribute('aria-describedby');
    expect(helperId).toBeTruthy();
    expect(document.getElementById(helperId!)).toHaveTextContent('Format: YYYY-MM-DDTHH:MM');
  });

  it('marks the input as required', () => {
    render(<DateTimeField id="dt" label="Start" required />);
    expect(screen.getByLabelText('Start')).toBeRequired();
  });
});

describe('DateTimeField — disabled state', () => {
  it('is disabled when disabled prop is true', () => {
    render(<DateTimeField id="dt" label="Start" disabled />);
    expect(screen.getByLabelText('Start')).toBeDisabled();
  });
});

describe('DateTimeField — all variants render', () => {
  DATE_TIME_FIELD_VARIANTS.forEach((variant) => {
    it(`renders variant="${variant}" without errors`, () => {
      render(<DateTimeField id={`dt-${variant}`} label="Start" variant={variant} />);
      expect(screen.getByLabelText('Start')).toHaveClass(`input-field--${variant}`);
    });
  });
});

describe('DateTimeField — all sizes render', () => {
  DATE_TIME_FIELD_SIZES.forEach((size) => {
    it(`renders size="${size}" without errors`, () => {
      render(<DateTimeField id={`dt-${size}`} label="Start" size={size} />);
      expect(screen.getByLabelText('Start')).toHaveClass(`input-field--${size}`);
    });
  });
});
