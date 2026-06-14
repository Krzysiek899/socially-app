import React from 'react';
import { render, screen } from '@testing-library/react';
import { TextArea, TEXT_AREA_VARIANTS, TEXT_AREA_SIZES } from '../../shared/components/TextArea/TextArea.tsx';

describe('TextArea — contract: variant and size APIs', () => {
  it('exposes both variants', () => {
    expect(TEXT_AREA_VARIANTS).toEqual(['default', 'error']);
  });

  it('exposes all three sizes', () => {
    expect(TEXT_AREA_SIZES).toEqual(['sm', 'md', 'lg']);
  });

  it('throws for an unknown variant', () => {
    expect(() => render(<TextArea id="x" label="X" variant="warning" />)).toThrow(/unknown variant/i);
  });

  it('throws for an unknown size', () => {
    expect(() => render(<TextArea id="x" label="X" size="xl" />)).toThrow(/unknown size/i);
  });
});

describe('TextArea — rendered output', () => {
  it('renders a <textarea> with role "textbox"', () => {
    render(<TextArea id="event-description" label="Opis wydarzenia" />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('renders an associated <label>', () => {
    render(<TextArea id="event-description" label="Opis wydarzenia" />);
    expect(screen.getByLabelText('Opis wydarzenia')).toBeInTheDocument();
  });

  it('applies correct CSS classes for variant and size', () => {
    render(<TextArea id="event-description" label="Opis wydarzenia" variant="error" size="lg" />);
    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveClass('textarea-field', 'textarea-field--error', 'textarea-field--lg');
  });
});
