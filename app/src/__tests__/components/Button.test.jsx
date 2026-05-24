import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button, BUTTON_VARIANTS, BUTTON_SIZES } from '../../components/Button/Button.jsx';

describe('Button — contract: variant and size APIs', () => {
  it('exposes all four variants', () => {
    expect(BUTTON_VARIANTS).toEqual(['primary', 'secondary', 'ghost', 'danger']);
  });

  it('exposes all three sizes', () => {
    expect(BUTTON_SIZES).toEqual(['sm', 'md', 'lg']);
  });

  it('throws for an unknown variant', () => {
    expect(() => render(<Button variant="outline">X</Button>)).toThrow(/unknown variant/i);
  });

  it('throws for an unknown size', () => {
    expect(() => render(<Button size="xl">X</Button>)).toThrow(/unknown size/i);
  });
});

describe('Button — rendered output', () => {
  it('renders a <button> element by default', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('applies correct CSS classes for variant and size', () => {
    render(<Button variant="secondary" size="lg">Test</Button>);
    const btn = screen.getByRole('button');
    expect(btn).toHaveClass('btn', 'btn--secondary', 'btn--lg');
  });

  it('applies default variant "primary" and size "md"', () => {
    render(<Button>Default</Button>);
    const btn = screen.getByRole('button');
    expect(btn).toHaveClass('btn--primary', 'btn--md');
  });

  it('sets type="button" by default', () => {
    render(<Button>Btn</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
  });

  it('forwards type="submit"', () => {
    render(<Button type="submit">Submit</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
  });

  it('forwards aria-label', () => {
    render(<Button aria-label="close dialog">×</Button>);
    expect(screen.getByRole('button', { name: 'close dialog' })).toBeInTheDocument();
  });
});

describe('Button — disabled state', () => {
  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('sets aria-disabled when disabled', () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('aria-disabled', 'true');
  });

  it('does not call onClick when disabled', () => {
    const handler = jest.fn();
    render(<Button disabled onClick={handler}>Disabled</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(handler).not.toHaveBeenCalled();
  });
});

describe('Button — all variants render', () => {
  BUTTON_VARIANTS.forEach((variant) => {
    it(`renders variant="${variant}" without errors`, () => {
      render(<Button variant={variant}>Label</Button>);
      expect(screen.getByRole('button')).toHaveClass(`btn--${variant}`);
    });
  });
});

describe('Button — all sizes render', () => {
  BUTTON_SIZES.forEach((size) => {
    it(`renders size="${size}" without errors`, () => {
      render(<Button size={size}>Label</Button>);
      expect(screen.getByRole('button')).toHaveClass(`btn--${size}`);
    });
  });
});
