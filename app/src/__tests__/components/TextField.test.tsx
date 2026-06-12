import React from 'react';
import { render, screen } from '@testing-library/react';
import { TextField, TEXT_FIELD_VARIANTS, TEXT_FIELD_SIZES } from '../../shared/components/TextField/TextField.tsx';

describe('TextField — contract: variant and size APIs', () => {
  it('exposes both variants', () => {
    expect(TEXT_FIELD_VARIANTS).toEqual(['default', 'error']);
  });

  it('exposes all three sizes', () => {
    expect(TEXT_FIELD_SIZES).toEqual(['sm', 'md', 'lg']);
  });

  it('throws for an unknown variant', () => {
    expect(() => render(<TextField id="x" label="X" variant="warning" />)).toThrow(/unknown variant/i);
  });

  it('throws for an unknown size', () => {
    expect(() => render(<TextField id="x" label="X" size="xl" />)).toThrow(/unknown size/i);
  });
});

describe('TextField — rendered output', () => {
  it('renders an <input> with role "textbox"', () => {
    render(<TextField id="email" label="Email" />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('renders an associated <label>', () => {
    render(<TextField id="email" label="Email" />);
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });

  it('applies correct CSS classes for variant and size', () => {
    render(<TextField id="u" label="User" variant="error" size="lg" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('input-field', 'input-field--error', 'input-field--lg');
  });

  it('forwards placeholder', () => {
    render(<TextField id="q" label="Search" placeholder="Type here…" />);
    expect(screen.getByPlaceholderText('Type here…')).toBeInTheDocument();
  });
});

describe('TextField — accessibility semantics', () => {
  it('sets aria-invalid on error variant', () => {
    render(<TextField id="e" label="Email" variant="error" errorText="Required" />);
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
  });

  it('does not set aria-invalid on default variant', () => {
    render(<TextField id="e" label="Email" />);
    expect(screen.getByRole('textbox')).not.toHaveAttribute('aria-invalid');
  });

  it('shows errorText with role="alert" when error variant', () => {
    render(<TextField id="e" label="Email" variant="error" errorText="Required field" />);
    expect(screen.getByRole('alert')).toHaveTextContent('Required field');
  });

  it('associates helper text via aria-describedby', () => {
    render(<TextField id="u" label="User" helperText="Enter your username" />);
    const input = screen.getByRole('textbox');
    const helperId = input.getAttribute('aria-describedby');
    expect(helperId).toBeTruthy();
    expect(document.getElementById(helperId)).toHaveTextContent('Enter your username');
  });
});

describe('TextField — disabled state', () => {
  it('is disabled when disabled prop is true', () => {
    render(<TextField id="d" label="Disabled" disabled />);
    expect(screen.getByRole('textbox')).toBeDisabled();
  });
});

describe('TextField — required state', () => {
  it('marks the input as required', () => {
    render(<TextField id="r" label="Name" required />);
    expect(screen.getByRole('textbox')).toBeRequired();
  });
});

describe('TextField — all variants render', () => {
  TEXT_FIELD_VARIANTS.forEach((variant) => {
    it(`renders variant="${variant}" without errors`, () => {
      render(<TextField id={variant} label="Test" variant={variant} />);
      expect(screen.getByRole('textbox')).toHaveClass(`input-field--${variant}`);
    });
  });
});

describe('TextField — all sizes render', () => {
  TEXT_FIELD_SIZES.forEach((size) => {
    it(`renders size="${size}" without errors`, () => {
      render(<TextField id={size} label="Test" size={size} />);
      expect(screen.getByRole('textbox')).toHaveClass(`input-field--${size}`);
    });
  });
});
