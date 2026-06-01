import React, { useCallback, useId, useRef, useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import './Accordion.css';

export interface AccordionItem {
  /** Unique identifier for this item. */
  id: string;
  /** Visible heading / trigger text or element. */
  heading: React.ReactNode;
  /** Content revealed when the item is expanded. */
  content: React.ReactNode;
  /** When true the item cannot be toggled. */
  disabled?: boolean;
}

export interface AccordionProps {
  /** Items to render. Each item has a heading trigger and a content panel. */
  items: AccordionItem[];
  /**
   * Controlled list of expanded item ids.
   * When provided the component is fully controlled — pair with `onChange`.
   */
  expanded?: string[];
  /**
   * Item ids expanded on first render (uncontrolled mode).
   * Ignored when `expanded` is provided.
   */
  defaultExpanded?: string[];
  /** When true, multiple panels may be open simultaneously. Default: false. */
  allowMultiple?: boolean;
  /** Called with the new set of expanded ids after a toggle. */
  onChange?: (expandedIds: string[]) => void;
  /** Accessible label for the accordion landmark region. */
  'aria-label'?: string;
}

/**
 * Accordion / Disclosure component.
 *
 * Implements the WAI-ARIA Accordion pattern:
 *   https://www.w3.org/WAI/ARIA/apg/patterns/accordion/
 *
 * Keyboard interactions:
 *   Enter / Space — toggle focused header
 *   Arrow Down    — move focus to next header
 *   Arrow Up      — move focus to previous header
 *   Home          — move focus to first header
 *   End           — move focus to last header
 */
export function Accordion({
  items,
  expanded: controlledExpanded,
  defaultExpanded = [],
  allowMultiple = false,
  onChange,
  'aria-label': ariaLabel,
}: AccordionProps): React.JSX.Element {
  const isControlled = controlledExpanded !== undefined;

  const [internalExpanded, setInternalExpanded] = useState<string[]>(
    () => (allowMultiple ? defaultExpanded : defaultExpanded.slice(0, 1)),
  );

  const expandedIds = isControlled ? controlledExpanded : internalExpanded;

  const uid = useId();
  const headingRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const toggle = useCallback(
    (id: string) => {
      const isOpen = expandedIds.includes(id);
      let next: string[];

      if (isOpen) {
        next = expandedIds.filter((eid) => eid !== id);
      } else if (allowMultiple) {
        next = [...expandedIds, id];
      } else {
        next = [id];
      }

      if (!isControlled) {
        setInternalExpanded(next);
      }
      onChange?.(next);
    },
    [expandedIds, allowMultiple, isControlled, onChange],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
      const enabledIndices = items
        .map((item, i) => (!item.disabled ? i : null))
        .filter((i): i is number => i !== null);

      const currentEnabledPos = enabledIndices.indexOf(index);

      let targetIndex: number | undefined;

      switch (e.key) {
        case 'ArrowDown': {
          e.preventDefault();
          const next = enabledIndices[(currentEnabledPos + 1) % enabledIndices.length];
          targetIndex = next;
          break;
        }
        case 'ArrowUp': {
          e.preventDefault();
          const prev =
            enabledIndices[
              (currentEnabledPos - 1 + enabledIndices.length) % enabledIndices.length
            ];
          targetIndex = prev;
          break;
        }
        case 'Home': {
          e.preventDefault();
          targetIndex = enabledIndices[0];
          break;
        }
        case 'End': {
          e.preventDefault();
          targetIndex = enabledIndices[enabledIndices.length - 1];
          break;
        }
        default:
          break;
      }

      if (targetIndex !== undefined) {
        headingRefs.current[targetIndex]?.focus();
      }
    },
    [items],
  );

  return (
    <div className="accordion" aria-label={ariaLabel}>
      {items.map((item, index) => {
        const isExpanded = expandedIds.includes(item.id);
        const triggerId = `${uid}-trigger-${item.id}`;
        const panelId = `${uid}-panel-${item.id}`;

        return (
          <div
            key={item.id}
            className={`accordion__item${isExpanded ? ' accordion__item--expanded' : ''}${item.disabled ? ' accordion__item--disabled' : ''}`}
          >
            <h3 className="accordion__heading">
              <button
                id={triggerId}
                ref={(el) => {
                  headingRefs.current[index] = el;
                }}
                type="button"
                className="accordion__trigger"
                aria-expanded={isExpanded}
                aria-controls={panelId}
                aria-disabled={item.disabled || undefined}
                disabled={item.disabled}
                onClick={() => toggle(item.id)}
                onKeyDown={(e) => handleKeyDown(e, index)}
              >
                <span className="accordion__trigger-label">{item.heading}</span>
                <span className="accordion__trigger-icon" aria-hidden="true">
                  {isExpanded ? <ChevronUp /> : <ChevronDown />}
                </span>
              </button>
            </h3>

            <div
              id={panelId}
              role="region"
              aria-labelledby={triggerId}
              className="accordion__panel"
              hidden={!isExpanded}
            >
              <div className="accordion__panel-body">{item.content}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
