import React from 'react';
import { render, screen } from '@testing-library/react';
import { DateField, DATE_FIELD_VARIANTS, DATE_FIELD_SIZES } from '../../shared/components/DateField/DateField.tsx';

describe('DateField — contract: variant and size APIs', () => {
  it('exposes variants from Input', () => {
    expect(DATE_FIELD_VARIANTS).toEqual(['default', 'error']);
  });

  it('exposes sizes from Input', () => {
    expect(DATE_FIELD_SIZES).toEqual(['sm', 'md', 'lg']);
  });

  it('throws for an unknown variant', () => {
    expect(() => render(<DateField id="d" label="Date" variant="warning" />)).toThrow(/unknown variant/i);
  });

  it('throws for an unknown size', () => {
    expect(() => render(<DateField id="d" label="Date" size="xl" />)).toThrow(/unknown size/i);
  });
});

describe('DateField — rendered output', () => {
  it('renders an associated <label>', () => {
    render(<DateField id="dob" label="Date of Birth" />);
    expect(screen.getByLabelText('Date of Birth')).toBeInTheDocument();
  });

  it('renders an input with type="date"', () => {
    render(<DateField id="dob" label="Date of Birth" />);
    expect(screen.getByLabelText('Date of Birth')).toHaveAttribute('type', 'date');
  });

  it('forwards min attribute', () => {
    render(<DateField id="dob" label="Date" min="2000-01-01" />);
    expect(screen.getByLabelText('Date')).toHaveAttribute('min', '2000-01-01');
  });

  it('forwards max attribute', () => {
    render(<DateField id="dob" label="Date" max="2030-12-31" />);
    expect(screen.getByLabelText('Date')).toHaveAttribute('max', '2030-12-31');
  });

  it('applies correct CSS class for size', () => {
    render(<DateField id="d" label="Date" size="lg" />);
    expect(screen.getByLabelText('Date')).toHaveClass('input-field--lg');
  });
});

describe('DateField — accessibility semantics', () => {
  it('sets aria-invalid on error variant', () => {
    render(<DateField id="d" label="Date" variant="error" errorText="Invalid date" />);
    expect(screen.getByLabelText('Date')).toHaveAttribute('aria-invalid', 'true');
  });

  it('does not set aria-invalid on default variant', () => {
    render(<DateField id="d" label="Date" />);
    expect(screen.getByLabelText('Date')).not.toHaveAttribute('aria-invalid');
  });

  it('shows errorText with role="alert" when error variant', () => {
    render(<DateField id="d" label="Date" variant="error" errorText="Date is required" />);
    expect(screen.getByRole('alert')).toHaveTextContent('Date is required');
  });

  it('associates helper text via aria-describedby', () => {
    render(<DateField id="d" label="Date" helperText="Format: YYYY-MM-DD" />);
    const input = screen.getByLabelText('Date');
    const helperId = input.getAttribute('aria-describedby');
    expect(helperId).toBeTruthy();
    expect(document.getElementById(helperId!)).toHaveTextContent('Format: YYYY-MM-DD');
  });

  it('marks the input as required', () => {
    render(<DateField id="d" label="Date" required />);
    expect(screen.getByLabelText('Date')).toBeRequired();
  });
});

describe('DateField — disabled state', () => {
  it('is disabled when disabled prop is true', () => {
    render(<DateField id="d" label="Date" disabled />);
    expect(screen.getByLabelText('Date')).toBeDisabled();
  });
});

describe('DateField — all variants render', () => {
  DATE_FIELD_VARIANTS.forEach((variant) => {
    it(`renders variant="${variant}" without errors`, () => {
      render(<DateField id={`d-${variant}`} label="Date" variant={variant} />);
      expect(screen.getByLabelText('Date')).toHaveClass(`input-field--${variant}`);
    });
  });
});

describe('DateField — all sizes render', () => {
  DATE_FIELD_SIZES.forEach((size) => {
    it(`renders size="${size}" without errors`, () => {
      render(<DateField id={`d-${size}`} label="Date" size={size} />);
      expect(screen.getByLabelText('Date')).toHaveClass(`input-field--${size}`);
    });
  });
});
