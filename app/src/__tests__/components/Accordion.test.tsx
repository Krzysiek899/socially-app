import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { Accordion } from '../../components/Accordion/Accordion.tsx';
import type { AccordionItem } from '../../components/Accordion/Accordion.tsx';

const ITEMS: AccordionItem[] = [
  { id: 'one',   heading: 'Section 1', content: 'Content for section 1' },
  { id: 'two',   heading: 'Section 2', content: 'Content for section 2' },
  { id: 'three', heading: 'Section 3', content: 'Content for section 3' },
];

const DISABLED_ITEMS: AccordionItem[] = [
  { id: 'one', heading: 'Enabled',  content: 'Content 1' },
  { id: 'two', heading: 'Disabled', content: 'Content 2', disabled: true },
];

describe('Accordion — ARIA structure', () => {
  it('renders a heading with a button for each item', () => {
    render(<Accordion items={ITEMS} />);
    const triggers = screen.getAllByRole('button');
    expect(triggers).toHaveLength(3);
  });

  it('each trigger has aria-expanded="false" by default', () => {
    render(<Accordion items={ITEMS} />);
    screen.getAllByRole('button').forEach((btn) => {
      expect(btn).toHaveAttribute('aria-expanded', 'false');
    });
  });

  it('each trigger has aria-controls pointing to its panel', () => {
    render(<Accordion items={ITEMS} />);
    const triggers = screen.getAllByRole('button');
    triggers.forEach((trigger) => {
      const panelId = trigger.getAttribute('aria-controls');
      expect(panelId).toBeTruthy();
      expect(document.getElementById(panelId!)).toBeInTheDocument();
    });
  });

  it('each panel has role="region" and aria-labelledby pointing to its trigger', () => {
    render(<Accordion items={ITEMS} />);
    const regions = screen.getAllByRole('region', { hidden: true });
    expect(regions).toHaveLength(3);

    regions.forEach((region) => {
      const labelledBy = region.getAttribute('aria-labelledby');
      expect(labelledBy).toBeTruthy();
      expect(document.getElementById(labelledBy!)).toBeInTheDocument();
    });
  });

  it('collapsed panels have hidden attribute', () => {
    render(<Accordion items={ITEMS} />);
    const regions = screen.queryAllByRole('region', { hidden: true });
    regions.forEach((region) => {
      expect(region).toHaveAttribute('hidden');
    });
  });

  it('forwards aria-label to the container', () => {
    render(<Accordion items={ITEMS} aria-label="FAQ accordion" />);
    expect(screen.getByLabelText('FAQ accordion')).toBeInTheDocument();
  });
});

describe('Accordion — expand/collapse behaviour', () => {
  it('expands an item when its trigger is clicked', () => {
    render(<Accordion items={ITEMS} />);
    const trigger = screen.getByRole('button', { name: /section 1/i });
    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });

  it('reveals panel content after expanding', () => {
    render(<Accordion items={ITEMS} />);
    fireEvent.click(screen.getByRole('button', { name: /section 1/i }));
    expect(screen.getByText('Content for section 1')).toBeVisible();
  });

  it('collapses an already-expanded item', () => {
    render(<Accordion items={ITEMS} defaultExpanded={['one']} />);
    const trigger = screen.getByRole('button', { name: /section 1/i });
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('collapses the previous item when allowMultiple is false (default)', () => {
    render(<Accordion items={ITEMS} />);
    fireEvent.click(screen.getByRole('button', { name: /section 1/i }));
    fireEvent.click(screen.getByRole('button', { name: /section 2/i }));

    expect(screen.getByRole('button', { name: /section 1/i })).toHaveAttribute(
      'aria-expanded', 'false',
    );
    expect(screen.getByRole('button', { name: /section 2/i })).toHaveAttribute(
      'aria-expanded', 'true',
    );
  });

  it('keeps multiple items open when allowMultiple is true', () => {
    render(<Accordion items={ITEMS} allowMultiple />);
    fireEvent.click(screen.getByRole('button', { name: /section 1/i }));
    fireEvent.click(screen.getByRole('button', { name: /section 2/i }));

    expect(screen.getByRole('button', { name: /section 1/i })).toHaveAttribute(
      'aria-expanded', 'true',
    );
    expect(screen.getByRole('button', { name: /section 2/i })).toHaveAttribute(
      'aria-expanded', 'true',
    );
  });

  it('respects defaultExpanded (uncontrolled)', () => {
    render(<Accordion items={ITEMS} defaultExpanded={['two']} />);
    expect(screen.getByRole('button', { name: /section 2/i })).toHaveAttribute(
      'aria-expanded', 'true',
    );
  });

  it('only opens first defaultExpanded id when allowMultiple is false', () => {
    render(<Accordion items={ITEMS} defaultExpanded={['one', 'two']} />);
    expect(screen.getByRole('button', { name: /section 1/i })).toHaveAttribute(
      'aria-expanded', 'true',
    );
    expect(screen.getByRole('button', { name: /section 2/i })).toHaveAttribute(
      'aria-expanded', 'false',
    );
  });
});

describe('Accordion — controlled mode', () => {
  it('reflects the expanded prop', () => {
    render(<Accordion items={ITEMS} expanded={['two']} />);
    expect(screen.getByRole('button', { name: /section 2/i })).toHaveAttribute(
      'aria-expanded', 'true',
    );
    expect(screen.getByRole('button', { name: /section 1/i })).toHaveAttribute(
      'aria-expanded', 'false',
    );
  });

  it('calls onChange with the new expanded ids on toggle', () => {
    const onChange = jest.fn();
    render(<Accordion items={ITEMS} expanded={[]} onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: /section 1/i }));
    expect(onChange).toHaveBeenCalledWith(['one']);
  });

  it('calls onChange with ids removed when collapsing', () => {
    const onChange = jest.fn();
    render(<Accordion items={ITEMS} expanded={['one']} onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: /section 1/i }));
    expect(onChange).toHaveBeenCalledWith([]);
  });
});

describe('Accordion — disabled state', () => {
  it('does not toggle a disabled item', () => {
    render(<Accordion items={DISABLED_ITEMS} />);
    const trigger = screen.getByRole('button', { name: /disabled/i });
    expect(trigger).toBeDisabled();
    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('applies aria-disabled to disabled triggers', () => {
    render(<Accordion items={DISABLED_ITEMS} />);
    expect(screen.getByRole('button', { name: /disabled/i })).toHaveAttribute(
      'aria-disabled', 'true',
    );
  });
});

describe('Accordion — keyboard navigation', () => {
  it('moves focus to the next header on ArrowDown', () => {
    render(<Accordion items={ITEMS} />);
    const [first, second] = screen.getAllByRole('button');
    first.focus();
    fireEvent.keyDown(first, { key: 'ArrowDown' });
    expect(document.activeElement).toBe(second);
  });

  it('moves focus to the previous header on ArrowUp', () => {
    render(<Accordion items={ITEMS} />);
    const [, second, third] = screen.getAllByRole('button');
    third.focus();
    fireEvent.keyDown(third, { key: 'ArrowUp' });
    expect(document.activeElement).toBe(second);
  });

  it('wraps from last to first on ArrowDown', () => {
    render(<Accordion items={ITEMS} />);
    const triggers = screen.getAllByRole('button');
    const last = triggers[triggers.length - 1];
    last.focus();
    fireEvent.keyDown(last, { key: 'ArrowDown' });
    expect(document.activeElement).toBe(triggers[0]);
  });

  it('wraps from first to last on ArrowUp', () => {
    render(<Accordion items={ITEMS} />);
    const triggers = screen.getAllByRole('button');
    triggers[0].focus();
    fireEvent.keyDown(triggers[0], { key: 'ArrowUp' });
    expect(document.activeElement).toBe(triggers[triggers.length - 1]);
  });

  it('moves focus to the first header on Home', () => {
    render(<Accordion items={ITEMS} />);
    const triggers = screen.getAllByRole('button');
    triggers[2].focus();
    fireEvent.keyDown(triggers[2], { key: 'Home' });
    expect(document.activeElement).toBe(triggers[0]);
  });

  it('moves focus to the last header on End', () => {
    render(<Accordion items={ITEMS} />);
    const triggers = screen.getAllByRole('button');
    triggers[0].focus();
    fireEvent.keyDown(triggers[0], { key: 'End' });
    expect(document.activeElement).toBe(triggers[triggers.length - 1]);
  });

  it('skips disabled items during ArrowDown navigation', () => {
    render(<Accordion items={DISABLED_ITEMS} />);
    const [enabled] = screen.getAllByRole('button');
    enabled.focus();
    fireEvent.keyDown(enabled, { key: 'ArrowDown' });
    // wraps back to the only enabled item
    expect(document.activeElement).toBe(enabled);
  });
});
