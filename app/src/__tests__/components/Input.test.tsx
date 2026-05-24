import React from 'react';
import { render, screen } from '@testing-library/react';
import { Input, INPUT_VARIANTS, INPUT_SIZES } from '../../components/Input/Input.tsx';

describe('Input — contract: variant and size APIs', () => {
  it('exposes both variants', () => {
    expect(INPUT_VARIANTS).toEqual(['default', 'error']);
  });

  it('exposes all three sizes', () => {
    expect(INPUT_SIZES).toEqual(['sm', 'md', 'lg']);
  });

  it('throws for an unknown variant', () => {
    expect(() => render(<Input id="x" label="X" variant="warning" />)).toThrow(/unknown variant/i);
  });

  it('throws for an unknown size', () => {
    expect(() => render(<Input id="x" label="X" size="xl" />)).toThrow(/unknown size/i);
  });
});

describe('Input — rendered output', () => {
  it('renders an <input> with role "textbox"', () => {
    render(<Input id="email" label="Email" />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('renders an associated <label>', () => {
    render(<Input id="email" label="Email" />);
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });

  it('applies correct CSS classes for variant and size', () => {
    render(<Input id="u" label="User" variant="error" size="lg" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('input-field', 'input-field--error', 'input-field--lg');
  });

  it('forwards placeholder', () => {
    render(<Input id="q" label="Search" placeholder="Type here…" />);
    expect(screen.getByPlaceholderText('Type here…')).toBeInTheDocument();
  });
});

describe('Input — accessibility semantics', () => {
  it('sets aria-invalid on error variant', () => {
    render(<Input id="e" label="Email" variant="error" errorText="Required" />);
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
  });

  it('does not set aria-invalid on default variant', () => {
    render(<Input id="e" label="Email" />);
    expect(screen.getByRole('textbox')).not.toHaveAttribute('aria-invalid');
  });

  it('shows errorText with role="alert" when error variant', () => {
    render(<Input id="e" label="Email" variant="error" errorText="Required field" />);
    expect(screen.getByRole('alert')).toHaveTextContent('Required field');
  });

  it('associates helper text via aria-describedby', () => {
    render(<Input id="u" label="User" helperText="Enter your username" />);
    const input = screen.getByRole('textbox');
    const helperId = input.getAttribute('aria-describedby');
    expect(helperId).toBeTruthy();
    expect(document.getElementById(helperId)).toHaveTextContent('Enter your username');
  });
});

describe('Input — disabled state', () => {
  it('is disabled when disabled prop is true', () => {
    render(<Input id="d" label="Disabled" disabled />);
    expect(screen.getByRole('textbox')).toBeDisabled();
  });
});

describe('Input — required state', () => {
  it('marks the input as required', () => {
    render(<Input id="r" label="Name" required />);
    expect(screen.getByRole('textbox')).toBeRequired();
  });
});

describe('Input — all variants render', () => {
  INPUT_VARIANTS.forEach((variant) => {
    it(`renders variant="${variant}" without errors`, () => {
      render(<Input id={variant} label="Test" variant={variant} />);
      expect(screen.getByRole('textbox')).toHaveClass(`input-field--${variant}`);
    });
  });
});

describe('Input — all sizes render', () => {
  INPUT_SIZES.forEach((size) => {
    it(`renders size="${size}" without errors`, () => {
      render(<Input id={size} label="Test" size={size} />);
      expect(screen.getByRole('textbox')).toHaveClass(`input-field--${size}`);
    });
  });
});
