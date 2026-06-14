import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { SegmentedToggle } from '../../shared/components/SegmentedToggle/SegmentedToggle.tsx';

describe('SegmentedToggle', () => {
  it('renders options and current selection state', () => {
    render(
      <SegmentedToggle
        ariaLabel="Price mode"
        value="free"
        options={[
          { value: 'free', label: 'Free' },
          { value: 'paid', label: 'Paid' },
        ]}
        onChange={() => {}}
      />,
    );

    const freeButton = screen.getByRole('button', { name: 'Free' });
    const paidButton = screen.getByRole('button', { name: 'Paid' });
    expect(freeButton).toHaveAttribute('aria-pressed', 'true');
    expect(paidButton).toHaveAttribute('aria-pressed', 'false');
  });

  it('calls onChange with clicked option value', () => {
    const onChange = jest.fn();
    render(
      <SegmentedToggle
        ariaLabel="Capacity mode"
        value="unlimited"
        options={[
          { value: 'unlimited', label: 'Unlimited' },
          { value: 'limited', label: 'Limited' },
        ]}
        onChange={onChange}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Limited' }));
    expect(onChange).toHaveBeenCalledWith('limited');
  });
});
