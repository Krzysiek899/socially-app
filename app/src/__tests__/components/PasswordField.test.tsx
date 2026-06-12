import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { PasswordField } from '../../shared/components/PasswordField/PasswordField.tsx';

describe('PasswordField — contract: variant and size APIs', () => {
  it('throws for an unknown variant', () => {
    expect(() => render(<PasswordField id="p" label="Password" variant="warning" />)).toThrow(/unknown variant/i);
  });

  it('throws for an unknown size', () => {
    expect(() => render(<PasswordField id="p" label="Password" size="xl" />)).toThrow(/unknown size/i);
  });
});

describe('PasswordField — rendered output', () => {
  it('renders an associated <label>', () => {
    render(<PasswordField id="pwd" label="Password" />);
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
  });

  it('renders the input with type="password" by default', () => {
    render(<PasswordField id="pwd" label="Password" />);
    expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'password');
  });

  it('renders the show/hide toggle button', () => {
    render(<PasswordField id="pwd" label="Password" />);
    expect(screen.getByRole('button', { name: /show password/i })).toBeInTheDocument();
  });
});

describe('PasswordField — show/hide toggle behavior', () => {
  it('switches input type to "text" when toggle is clicked', () => {
    render(<PasswordField id="pwd" label="Password" />);
    const toggle = screen.getByRole('button', { name: /show password/i });
    fireEvent.click(toggle);
    expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'text');
  });

  it('switches back to "password" on second toggle click', () => {
    render(<PasswordField id="pwd" label="Password" />);
    const toggle = screen.getByRole('button', { name: /show password/i });
    fireEvent.click(toggle);
    fireEvent.click(screen.getByRole('button', { name: /hide password/i }));
    expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'password');
  });

  it('toggle button has aria-pressed=false initially', () => {
    render(<PasswordField id="pwd" label="Password" />);
    expect(screen.getByRole('button', { name: /show password/i })).toHaveAttribute('aria-pressed', 'false');
  });

  it('toggle button has aria-pressed=true when password is visible', () => {
    render(<PasswordField id="pwd" label="Password" />);
    fireEvent.click(screen.getByRole('button', { name: /show password/i }));
    expect(screen.getByRole('button', { name: /hide password/i })).toHaveAttribute('aria-pressed', 'true');
  });

  it('toggle button has aria-controls pointing to input id', () => {
    render(<PasswordField id="pwd" label="Password" />);
    expect(screen.getByRole('button', { name: /show password/i })).toHaveAttribute('aria-controls', 'pwd');
  });
});

describe('PasswordField — accessibility semantics', () => {
  it('sets aria-invalid on error variant', () => {
    render(<PasswordField id="p" label="Password" variant="error" errorText="Required" />);
    expect(screen.getByLabelText('Password')).toHaveAttribute('aria-invalid', 'true');
  });

  it('does not set aria-invalid on default variant', () => {
    render(<PasswordField id="p" label="Password" />);
    expect(screen.getByLabelText('Password')).not.toHaveAttribute('aria-invalid');
  });

  it('shows errorText with role="alert" when error variant', () => {
    render(<PasswordField id="p" label="Password" variant="error" errorText="Invalid password" />);
    expect(screen.getByRole('alert')).toHaveTextContent('Invalid password');
  });

  it('associates helper text via aria-describedby', () => {
    render(<PasswordField id="p" label="Password" helperText="Min 8 characters" />);
    const input = screen.getByLabelText('Password');
    const helperId = input.getAttribute('aria-describedby');
    expect(helperId).toBeTruthy();
    expect(document.getElementById(helperId!)).toHaveTextContent('Min 8 characters');
  });

  it('requires the field when required prop is set', () => {
    render(<PasswordField id="p" label="Password" required />);
    expect(screen.getByLabelText('Password')).toBeRequired();
  });
});

describe('PasswordField — disabled state', () => {
  it('disables the input when disabled prop is true', () => {
    render(<PasswordField id="p" label="Password" disabled />);
    expect(screen.getByLabelText('Password')).toBeDisabled();
  });

  it('disables the toggle button when disabled prop is true', () => {
    render(<PasswordField id="p" label="Password" disabled />);
    expect(screen.getByRole('button', { name: /show password/i })).toBeDisabled();
  });

  it('toggle does not change type when disabled', () => {
    render(<PasswordField id="p" label="Password" disabled />);
    const toggle = screen.getByRole('button', { name: /show password/i });
    fireEvent.click(toggle);
    expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'password');
  });
});

describe('PasswordField — form states', () => {
  it('applies error CSS class when variant is error', () => {
    render(<PasswordField id="p" label="Password" variant="error" />);
    expect(screen.getByLabelText('Password')).toHaveClass('input-field--error');
  });

  it('forwards placeholder', () => {
    render(<PasswordField id="p" label="Password" placeholder="Enter password" />);
    expect(screen.getByPlaceholderText('Enter password')).toBeInTheDocument();
  });
});
