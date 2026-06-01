import React from 'react';
import { render, screen } from '@testing-library/react';
import { Dropdown, DROPDOWN_VARIANTS, DROPDOWN_SIZES } from '../../components/Dropdown/Dropdown.tsx';

const OPTIONS = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry', disabled: true },
];

describe('Dropdown — contract: variant and size APIs', () => {
  it('exposes variants from Input', () => {
    expect(DROPDOWN_VARIANTS).toEqual(['default', 'error']);
  });

  it('exposes sizes from Input', () => {
    expect(DROPDOWN_SIZES).toEqual(['sm', 'md', 'lg']);
  });

  it('throws for an unknown variant', () => {
    expect(() =>
      render(<Dropdown id="d" label="Fruit" options={OPTIONS} variant={'warning' as never} />)
    ).toThrow(/unknown variant/i);
  });

  it('throws for an unknown size', () => {
    expect(() =>
      render(<Dropdown id="d" label="Fruit" options={OPTIONS} size={'xl' as never} />)
    ).toThrow(/unknown size/i);
  });
});

describe('Dropdown — rendered output', () => {
  it('renders an associated <label>', () => {
    render(<Dropdown id="fruit" label="Fruit" options={OPTIONS} />);
    expect(screen.getByLabelText('Fruit')).toBeInTheDocument();
  });

  it('renders a <select> element', () => {
    render(<Dropdown id="fruit" label="Fruit" options={OPTIONS} />);
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('renders all options', () => {
    render(<Dropdown id="fruit" label="Fruit" options={OPTIONS} />);
    expect(screen.getByRole('option', { name: 'Apple' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Banana' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Cherry' })).toBeInTheDocument();
  });

  it('renders a placeholder option when provided', () => {
    render(<Dropdown id="fruit" label="Fruit" options={OPTIONS} placeholder="Choose a fruit" />);
    expect(screen.getByRole('option', { name: 'Choose a fruit' })).toBeInTheDocument();
  });

  it('does not render a placeholder option when omitted', () => {
    render(<Dropdown id="fruit" label="Fruit" options={OPTIONS} />);
    expect(screen.queryByRole('option', { name: /choose/i })).not.toBeInTheDocument();
  });

  it('applies correct CSS class for variant', () => {
    render(<Dropdown id="fruit" label="Fruit" options={OPTIONS} variant="error" />);
    expect(screen.getByRole('combobox')).toHaveClass('input-field--error');
  });

  it('applies correct CSS class for size', () => {
    render(<Dropdown id="fruit" label="Fruit" options={OPTIONS} size="lg" />);
    expect(screen.getByRole('combobox')).toHaveClass('input-field--lg');
  });
});

describe('Dropdown — option rendering', () => {
  it('marks a disabled option as disabled', () => {
    render(<Dropdown id="fruit" label="Fruit" options={OPTIONS} />);
    expect(screen.getByRole('option', { name: 'Cherry' })).toBeDisabled();
  });

  it('does not mark non-disabled options as disabled', () => {
    render(<Dropdown id="fruit" label="Fruit" options={OPTIONS} />);
    expect(screen.getByRole('option', { name: 'Apple' })).not.toBeDisabled();
  });
});

describe('Dropdown — accessibility semantics', () => {
  it('sets aria-invalid on error variant', () => {
    render(<Dropdown id="d" label="Fruit" options={OPTIONS} variant="error" errorText="Select a fruit" />);
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-invalid', 'true');
  });

  it('does not set aria-invalid on default variant', () => {
    render(<Dropdown id="d" label="Fruit" options={OPTIONS} />);
    expect(screen.getByRole('combobox')).not.toHaveAttribute('aria-invalid');
  });

  it('shows errorText with role="alert" when error variant', () => {
    render(<Dropdown id="d" label="Fruit" options={OPTIONS} variant="error" errorText="Selection required" />);
    expect(screen.getByRole('alert')).toHaveTextContent('Selection required');
  });

  it('associates helper text via aria-describedby', () => {
    render(<Dropdown id="d" label="Fruit" options={OPTIONS} helperText="Pick one" />);
    const select = screen.getByRole('combobox');
    const helperId = select.getAttribute('aria-describedby');
    expect(helperId).toBeTruthy();
    expect(document.getElementById(helperId!)).toHaveTextContent('Pick one');
  });

  it('marks the select as required', () => {
    render(<Dropdown id="d" label="Fruit" options={OPTIONS} required />);
    expect(screen.getByRole('combobox')).toBeRequired();
  });
});

describe('Dropdown — disabled state', () => {
  it('is disabled when disabled prop is true', () => {
    render(<Dropdown id="d" label="Fruit" options={OPTIONS} disabled />);
    expect(screen.getByRole('combobox')).toBeDisabled();
  });
});

describe('Dropdown — multiple mode', () => {
  it('renders listbox semantics when multiple is enabled', () => {
    render(<Dropdown id="d" label="Fruit" options={OPTIONS} multiple value={['apple']} />);
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('does not render placeholder option in multiple mode', () => {
    render(
      <Dropdown
        id="d"
        label="Fruit"
        options={OPTIONS}
        multiple
        value={['apple']}
        placeholder="Choose a fruit"
      />,
    );
    expect(screen.queryByRole('option', { name: 'Choose a fruit' })).not.toBeInTheDocument();
  });
});

describe('Dropdown — all variants render', () => {
  DROPDOWN_VARIANTS.forEach((variant) => {
    it(`renders variant="${variant}" without errors`, () => {
      render(<Dropdown id={`d-${variant}`} label="Fruit" options={OPTIONS} variant={variant} />);
      expect(screen.getByRole('combobox')).toHaveClass(`input-field--${variant}`);
    });
  });
});

describe('Dropdown — all sizes render', () => {
  DROPDOWN_SIZES.forEach((size) => {
    it(`renders size="${size}" without errors`, () => {
      render(<Dropdown id={`d-${size}`} label="Fruit" options={OPTIONS} size={size} />);
      expect(screen.getByRole('combobox')).toHaveClass(`input-field--${size}`);
    });
  });
});
