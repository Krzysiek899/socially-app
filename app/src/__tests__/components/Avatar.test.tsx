import React from 'react';
import { render, screen } from '@testing-library/react';
import { Avatar, AVATAR_SIZES } from '../../shared/components/Avatar/Avatar.tsx';

describe('Avatar — contract: size API', () => {
  it('exposes all four sizes', () => {
    expect(AVATAR_SIZES).toEqual(['sm', 'md', 'lg', 'xl']);
  });

  it('throws for an unknown size', () => {
    expect(() => render(<Avatar name="Jane Doe" size="xxl" />)).toThrow(/unknown size/i);
  });
});

describe('Avatar — initials fallback', () => {
  it('renders initials from a two-word name', () => {
    render(<Avatar name="Jane Doe" />);
    expect(screen.getByRole('img', { name: 'Jane Doe' })).toBeInTheDocument();
    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('renders a single initial from a one-word name', () => {
    render(<Avatar name="Alice" />);
    expect(screen.getByText('A')).toBeInTheDocument();
  });

  it('uses first and last word initials for multi-word names', () => {
    render(<Avatar name="Mary Jane Watson" />);
    expect(screen.getByText('MW')).toBeInTheDocument();
  });
});

describe('Avatar — image', () => {
  it('renders an <img> when src is provided', () => {
    render(<Avatar name="Jane Doe" src="https://example.com/jane.jpg" />);
    const imgEl = document.querySelector('img.avatar__img');
    expect(imgEl).toHaveAttribute('src', 'https://example.com/jane.jpg');
    expect(imgEl).toHaveAttribute('alt', 'Jane Doe');
  });

  it('does not render initials when src is provided', () => {
    render(<Avatar name="Jane Doe" src="https://example.com/jane.jpg" />);
    expect(screen.queryByText('JD')).toBeNull();
  });
});

describe('Avatar — accessibility', () => {
  it('has role="img" with aria-label set to the name', () => {
    render(<Avatar name="John Smith" />);
    expect(screen.getByRole('img', { name: 'John Smith' })).toBeInTheDocument();
  });

  it('initials span is aria-hidden', () => {
    render(<Avatar name="Jane Doe" />);
    expect(screen.getByText('JD')).toHaveAttribute('aria-hidden', 'true');
  });
});

describe('Avatar — sizes', () => {
  AVATAR_SIZES.forEach((size) => {
    it(`renders size="${size}" with correct class`, () => {
      const { container } = render(<Avatar name="Test User" size={size} />);
      expect(container.firstChild).toHaveClass(`avatar--${size}`);
    });
  });
});
