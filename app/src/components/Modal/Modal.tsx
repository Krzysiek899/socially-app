import React, { useEffect, useId, useRef } from 'react';
import ReactDOM from 'react-dom';
import { X } from 'lucide-react';
import './Modal.css';

export type ModalSize = 'sm' | 'md' | 'lg';
export const MODAL_SIZES: ReadonlyArray<ModalSize> = ['sm', 'md', 'lg'];

export interface ModalProps {
  isOpen:    boolean;
  onClose:   () => void;
  title:     string;
  size?:     ModalSize;
  children:  React.ReactNode;
  footer?:   React.ReactNode;
}

const FOCUSABLE_SELECTORS =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Modal — Overlay Component
 *
 * Renders a focused dialog via ReactDOM.createPortal into document.body.
 * Manages focus trapping, body scroll lock, and Escape-to-close.
 * Does not accept `className` to prevent ad-hoc styling drift.
 */
export function Modal({
  isOpen,
  onClose,
  title,
  size = 'md',
  children,
  footer,
}: ModalProps): React.JSX.Element | null {
  if (!MODAL_SIZES.includes(size)) {
    throw new Error(`Modal: unknown size "${size}". Must be one of: ${MODAL_SIZES.join(', ')}.`);
  }

  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  // Tracks the element that had focus before the modal opened, so we can restore it on close.
  const openerRef = useRef<Element | null>(null);

  // Save the currently focused element when opening; restore it when closing.
  useEffect(() => {
    if (isOpen) {
      openerRef.current = document.activeElement;
    } else {
      if (openerRef.current instanceof HTMLElement) {
        openerRef.current.focus();
      }
      openerRef.current = null;
    }
  }, [isOpen]);

  // Move focus into the modal on open — first focusable element, or panel fallback.
  useEffect(() => {
    if (!isOpen) return;
    const panel = panelRef.current;
    if (!panel) return;
    const first = panel.querySelector<HTMLElement>(FOCUSABLE_SELECTORS);
    (first ?? panel).focus();
  }, [isOpen]);

  // Lock body scroll while open; restore the exact previous value on cleanup.
  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen]);

  // Close on Escape key.
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  // Tab / Shift+Tab focus trap — cycles within the panel.
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'Tab') return;
    const panel = panelRef.current;
    if (!panel) return;
    const focusables = Array.from(
      panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS)
    );
    if (focusables.length === 0) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  };

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <>
      {/* Purely decorative scrim — hidden from assistive tech */}
      <div className="modal-backdrop" onClick={onClose} aria-hidden="true" />

      {/* Dialog panel — siblings with backdrop so aria-hidden above does not affect this */}
      <div
        ref={panelRef}
        className={`modal-panel modal-panel--${size}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onKeyDown={handleKeyDown}
      >
        <div className="modal-header">
          <h2 id={titleId} className="modal-title">{title}</h2>
          <button
            type="button"
            className="modal-close"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X aria-hidden="true" />
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </>,
    document.body
  );
}
