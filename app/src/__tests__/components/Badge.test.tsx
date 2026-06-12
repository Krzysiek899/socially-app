import React from 'react';
import { render, screen } from '@testing-library/react';
import { Badge, BADGE_VARIANTS, BADGE_SIZES } from '../../shared/components/Badge/Badge.tsx';

describe('Badge — contract: variant and size APIs', () => {
  it('exposes all six variants', () => {
    expect(BADGE_VARIANTS).toEqual(['primary', 'success', 'warning', 'danger', 'info', 'neutral']);
  });

  it('exposes both sizes', () => {
    expect(BADGE_SIZES).toEqual(['sm', 'md']);
  });

  it('throws for an unknown variant', () => {
    expect(() => render(<Badge variant="error">X</Badge>)).toThrow(/unknown variant/i);
  });

  it('throws for an unknown size', () => {
    expect(() => render(<Badge size="lg">X</Badge>)).toThrow(/unknown size/i);
  });
});

describe('Badge — rendered output', () => {
  it('renders children as text', () => {
    render(<Badge>Active</Badge>);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('applies default variant "neutral" and size "md"', () => {
    render(<Badge>Default</Badge>);
    const badge = screen.getByText('Default');
    expect(badge).toHaveClass('badge--neutral', 'badge--md');
  });

  it('applies correct classes for given variant and size', () => {
    render(<Badge variant="success" size="sm">Online</Badge>);
    const badge = screen.getByText('Online');
    expect(badge).toHaveClass('badge', 'badge--success', 'badge--sm');
  });
});

describe('Badge — all variants render', () => {
  BADGE_VARIANTS.forEach((variant) => {
    it(`renders variant="${variant}" without errors`, () => {
      render(<Badge variant={variant}>Label</Badge>);
      expect(screen.getByText('Label')).toHaveClass(`badge--${variant}`);
    });
  });
});

describe('Badge — all sizes render', () => {
  BADGE_SIZES.forEach((size) => {
    it(`renders size="${size}" without errors`, () => {
      render(<Badge size={size}>Label</Badge>);
      expect(screen.getByText('Label')).toHaveClass(`badge--${size}`);
    });
  });
});
