import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { Modal, MODAL_SIZES } from '../../components/Modal/Modal.tsx';

/* ── Helpers ── */
function renderModal(props: Partial<React.ComponentProps<typeof Modal>> = {}) {
  const defaults = {
    isOpen: true,
    onClose: jest.fn(),
    title: 'Test Modal',
    children: <p>Modal body content</p>,
  };
  return render(<Modal {...defaults} {...props} />);
}

describe('Modal — contract: size API', () => {
  it('exposes all three sizes', () => {
    expect(MODAL_SIZES).toEqual(['sm', 'md', 'lg']);
  });

  it('throws for an unknown size', () => {
    expect(() => renderModal({ size: 'xl' as never })).toThrow(/unknown size/i);
  });
});

describe('Modal — open/closed rendering', () => {
  it('renders nothing when isOpen=false', () => {
    renderModal({ isOpen: false });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders the dialog when isOpen=true', () => {
    renderModal();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('renders the title inside the dialog', () => {
    renderModal({ title: 'My Dialog' });
    expect(screen.getByText('My Dialog')).toBeInTheDocument();
  });

  it('renders children inside the dialog', () => {
    renderModal({ children: <span>Hello World</span> });
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });

  it('renders footer when provided', () => {
    renderModal({ footer: <button>Confirm</button> });
    expect(screen.getByRole('button', { name: /confirm/i })).toBeInTheDocument();
  });

  it('does not render footer slot when footer is not provided', () => {
    renderModal();
    expect(document.querySelector('.modal-footer')).not.toBeInTheDocument();
  });
});

describe('Modal — ARIA attributes', () => {
  it('has role="dialog"', () => {
    renderModal();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('has aria-modal="true"', () => {
    renderModal();
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
  });

  it('aria-labelledby points to the title element', () => {
    renderModal({ title: 'Accessible Title' });
    const dialog = screen.getByRole('dialog');
    const labelId = dialog.getAttribute('aria-labelledby');
    expect(labelId).toBeTruthy();
    expect(document.getElementById(labelId!)).toHaveTextContent('Accessible Title');
  });

  it('close button has aria-label="Close modal"', () => {
    renderModal();
    expect(screen.getByRole('button', { name: 'Close modal' })).toBeInTheDocument();
  });
});

describe('Modal — onClose triggers', () => {
  it('calls onClose when the close button is clicked', () => {
    const onClose = jest.fn();
    renderModal({ onClose });
    fireEvent.click(screen.getByRole('button', { name: 'Close modal' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when the backdrop is clicked', () => {
    const onClose = jest.fn();
    renderModal({ onClose });
    fireEvent.click(document.querySelector('.modal-backdrop')!);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when Escape is pressed', () => {
    const onClose = jest.fn();
    renderModal({ onClose });
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not call onClose for Escape when isOpen=false', () => {
    const onClose = jest.fn();
    renderModal({ isOpen: false, onClose });
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).not.toHaveBeenCalled();
  });
});

describe('Modal — body scroll lock', () => {
  it('sets overflow:hidden on body when open', () => {
    renderModal({ isOpen: true });
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('restores body overflow when unmounted', () => {
    document.body.style.overflow = '';
    const { unmount } = renderModal({ isOpen: true });
    expect(document.body.style.overflow).toBe('hidden');
    unmount();
    expect(document.body.style.overflow).toBe('');
  });

  it('restores previous body overflow value (not blank) when unmounted', () => {
    document.body.style.overflow = 'auto';
    const { unmount } = renderModal({ isOpen: true });
    unmount();
    expect(document.body.style.overflow).toBe('auto');
    document.body.style.overflow = '';
  });
});

describe('Modal — size classes', () => {
  MODAL_SIZES.forEach((size) => {
    it(`applies modal-panel--${size} class`, () => {
      renderModal({ size });
      expect(document.querySelector(`.modal-panel--${size}`)).toBeInTheDocument();
    });
  });
});

describe('Modal — focus management', () => {
  it('moves focus into the modal on open (close button is first focusable)', () => {
    renderModal();
    const closeBtn = screen.getByRole('button', { name: 'Close modal' });
    expect(document.activeElement).toBe(closeBtn);
  });

  it('restores focus to the opener element after close', () => {
    const opener = document.createElement('button');
    document.body.appendChild(opener);
    opener.focus();

    const { rerender } = render(
      <Modal isOpen={true} onClose={jest.fn()} title="T">Body</Modal>
    );
    rerender(
      <Modal isOpen={false} onClose={jest.fn()} title="T">Body</Modal>
    );
    expect(document.activeElement).toBe(opener);
    document.body.removeChild(opener);
  });
});

describe('Modal — focus trap', () => {
  it('wraps Tab from last focusable to first', () => {
    renderModal({ footer: <button>Confirm</button> });
    const confirmBtn = screen.getByRole('button', { name: /confirm/i });
    confirmBtn.focus();
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Tab', shiftKey: false });
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Close modal' }));
  });

  it('wraps Shift+Tab from first focusable to last', () => {
    renderModal({ footer: <button>Confirm</button> });
    const closeBtn = screen.getByRole('button', { name: 'Close modal' });
    closeBtn.focus();
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Tab', shiftKey: true });
    expect(document.activeElement).toBe(screen.getByRole('button', { name: /confirm/i }));
  });
});
