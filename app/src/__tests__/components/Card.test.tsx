import React from 'react';
import { render, screen } from '@testing-library/react';
import { Card, CARD_VARIANTS } from '../../components/Card/Card.tsx';

describe('Card — contract: variant API', () => {
  it('exposes all three variants', () => {
    expect(CARD_VARIANTS).toEqual(['default', 'raised', 'subtle']);
  });

  it('throws for an unknown variant', () => {
    expect(() => render(<Card variant="outlined">Body</Card>)).toThrow(/unknown variant/i);
  });
});

describe('Card — rendered output', () => {
  it('renders children inside card__body', () => {
    render(<Card>Card content</Card>);
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('applies default variant "default"', () => {
    const { container } = render(<Card>Body</Card>);
    expect(container.firstChild).toHaveClass('card', 'card--default');
  });

  it('applies correct class for raised variant', () => {
    const { container } = render(<Card variant="raised">Body</Card>);
    expect(container.firstChild).toHaveClass('card--raised');
  });

  it('applies correct class for subtle variant', () => {
    const { container } = render(<Card variant="subtle">Body</Card>);
    expect(container.firstChild).toHaveClass('card--subtle');
  });

  it('renders an optional header', () => {
    render(<Card header={<h2>Title</h2>}>Body</Card>);
    expect(screen.getByText('Title').closest('.card__header')).toBeInTheDocument();
  });

  it('renders an optional footer', () => {
    render(<Card footer={<span>Footer</span>}>Body</Card>);
    expect(screen.getByText('Footer').closest('.card__footer')).toBeInTheDocument();
  });

  it('does not render header when not provided', () => {
    const { container } = render(<Card>Body</Card>);
    expect(container.querySelector('.card__header')).toBeNull();
  });

  it('does not render footer when not provided', () => {
    const { container } = render(<Card>Body</Card>);
    expect(container.querySelector('.card__footer')).toBeNull();
  });
});

describe('Card — semantic HTML', () => {
  it('renders as <div> by default', () => {
    const { container } = render(<Card>Body</Card>);
    expect(container.firstChild.tagName).toBe('DIV');
  });

  it('renders as <article> when as="article"', () => {
    const { container } = render(<Card as="article">Body</Card>);
    expect(container.firstChild.tagName).toBe('ARTICLE');
  });

  it('forwards aria-label', () => {
    render(<Card aria-label="user profile card">Body</Card>);
    expect(screen.getByLabelText('user profile card')).toBeInTheDocument();
  });
});

describe('Card — all variants render', () => {
  CARD_VARIANTS.forEach((variant) => {
    it(`renders variant="${variant}" without errors`, () => {
      const { container } = render(<Card variant={variant}>Body</Card>);
      expect(container.firstChild).toHaveClass(`card--${variant}`);
    });
  });
});
